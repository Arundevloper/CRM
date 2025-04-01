import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Radio,
  Button,
  Input,
  Space,
  Modal,
  Menu,
  ConfigProvider,
  Dropdown,
  Select,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import axios from "axios";
import toast from "react-hot-toast";
import { ExclamationCircleFilled } from "@ant-design/icons";
import AdminDashboard from "../Layout/AdminDashboard";
import WorkLogForm from "./WorkLogForm";
import { useAuth } from "../Context/AuthContext";
import UpdateWorkLog from "./UpdateWorkLog";
import { useParams } from "react-router-dom";

const { confirm } = Modal;

// Debounce function definition
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Define your debounce delay (e.g., 300ms)
const debounceDelay = 300;

const AdminWorkLogTable = () => {
  const [flattenedTableData, setFlattenedTableData] = useState([]);
  const [sortData, setSortData] = useState("newlyadded");
  const [selectionType, setSelectionType] = useState("checkbox");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 8, // Adjust page size as needed
      total: 0, // Initial total count
    },
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [userId, setUserId] = useState("");
  const [workLogExists, setWorkLogExists] = useState(false);
  const [auditors, setAuditors] = useState([]);
  const [intialLoading, setIntialLoading] = useState(true);
  const [selectedAuditor, setSelectedAuditor] = useState("none");
  const { user } = useAuth();
  const { toDate, fromDate } = useParams();

  // Fetch data function
  const fetchData = useCallback(() => {
    setLoading(true);
  
    axios
      .get("/api/worklogs/getAllWorkLogs", {
        params: {
          page: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
          sort: sortData,
          userId: selectedAuditor !== "none" ? selectedAuditor : undefined,
          fromDate, // Ensure these are correctly used
          toDate // Check API expectations
        },
      })
      .then((response) => {
        const { data } = response;
        const { data: responseData, total, page } = data;
  
        const flattenedData = responseData.map((row, index) => ({
          ...row,
          key: `${row._id}-${index}`,
        }));
  
        setFlattenedTableData(flattenedData);
        setTableParams((prevState) => ({
          ...prevState,
          pagination: { ...prevState.pagination, total, current: page },
        }));
  
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [
    selectedAuditor !== "none" ? selectedAuditor : undefined, // Prevent unnecessary calls
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    sortData,
    fromDate, // Add missing dependencies
    toDate, // Add missing dependencies (ensure correct key name)
  ]);
  
  useEffect(() => {
    // Scroll to the top of the page whenever this component is rendered
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkWorkLogExist = async () => {
      try {
        if (!user?._id) return; // Prevent unnecessary API calls if user is not available

        const response = await axios.get(
          "/api/worklogs/isWorkLogAlreadyExist",
          {
            params: { userId: user._id },
          }
        );

        if (
          response.status === 200 &&
          response.data.message.includes("already exists")
        ) {
          console.log("Work log already exists for today:", response.data);
          setWorkLogExists(true);
        } else {
          setWorkLogExists(false);
        }
      } catch (error) {
        console.error("Error checking work log:", error);
        setWorkLogExists(false); // Ensure state is properly updated in case of an error
      }
    };

    checkWorkLogExist();
  }, [user?._id]);

  const fetchAuditors = useCallback(() => {
    axios
      .get("/api/auditor/getAuditAdmins")
      .then((response) => {
        if (response.data.success) {
          setAuditors(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching auditors:", error))
      .finally(() => {
        setIntialLoading(false); // Reset the loading state here
      });
  }, []);

  useEffect(() => {
    fetchAuditors();
  }, [fetchAuditors]);

  const fetchDataWithDebounce = debounce(() => {
    if (searchKeyword.trim()) {
      // Your backend call logic here
      console.log("Fetching data for keyword:", searchKeyword);
    }
  }, debounceDelay);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data when shouldFetch changes
  useEffect(() => {
    if (shouldFetch) {
      fetchData();
      setShouldFetch(false);
    }
  }, [shouldFetch, fetchData]);

  // Pagination
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      setFlattenedTableData([]);
    }
  };

  // Handle auditor selection change
  const handleAuditorChange = (value) => {
    setSelectedAuditor(value);
    const userId = value !== "none" ? value : null;

    setTableParams((prevState) => ({
      ...prevState,
      pagination: { ...prevState.pagination, current: 1 }, // Reset to first page
    }));

    setShouldFetch(true); // Trigger data fetch
  };

  const showUpdateModal = (id) => {
    setUserId(id);
    setIsUpdateModalVisible(true);
  };

  const handleWorkLogCancel = () => {
    // message.success("Edit Work Log");
    fetchData();
    setIsUpdateModalVisible(false);
  };

  const handleOk = () => {
    fetchData();
    setIsUpdateModalVisible(false);
  };

  // Row Selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  // Show confirm Delete
  const showDeleteConfirm = () => {
    confirm({
      title: "Are you sure delete?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        axios
          .delete("/api/worklogs/deleteFields", { data: selectedRows })
          .then((response) => {
            const currentPage = tableParams.pagination.current;
            const pageSize = tableParams.pagination.pageSize;
            const newTotal = tableParams.pagination.total - selectedRows.length;
            const newCurrentPage = Math.min(
              currentPage,
              Math.ceil(newTotal / pageSize)
            );

            setTableParams((prevState) => ({
              ...prevState,
              pagination: {
                ...prevState.pagination,
                total: newTotal,
                current: newCurrentPage,
              },
            }));

            setSelectedRows([]);
            setShouldFetch(true); // Trigger data fetch
            toast.success("Successfully Deleted");
          })
          .catch((error) => {
            console.error("Error deleting rows:", error);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  //const single delete
  const showSingleDeleteConfirm = (id) => {
    confirm({
      title: "Are you sure delete?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        axios
          .delete("/api/worklogs/deleteFields", { data: [id] }) // Send ID as an array
          .then((response) => {
            const currentPage = tableParams.pagination.current;
            const pageSize = tableParams.pagination.pageSize;
            const newTotal = tableParams.pagination.total - 1; // Only one row is deleted
            const newCurrentPage = Math.min(
              currentPage,
              Math.ceil(newTotal / pageSize)
            );

            setTableParams((prevState) => ({
              ...prevState,
              pagination: {
                ...prevState.pagination,
                total: newTotal,
                current: newCurrentPage,
              },
            }));

            setShouldFetch(true); // Trigger data fetch
            toast.success("Successfully Deleted");
          })
          .catch((error) => {
            console.error("Error deleting row:", error);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // Updated handleMenuClick function
  const handleMenuClick = (record, { key }) => {
    switch (key) {
      case "edit":
        showUpdateModal(record._id);
        break;
      case "delete":
        showSingleDeleteConfirm(record._id); // Pass the correct record ID
        break;
      default:
        break;
    }
  };

  const menu = (record) => (
    <Menu
      onClick={(e) => handleMenuClick(record, e)}
      style={{ padding: "8px" }}
    >
      <Menu.Item
        key="edit"
        style={{ margin: "8px 0", backgroundColor: "#FFE0B2" }}
      >
        <span
          style={{ color: "#E65100", fontWeight: "bold", fontSize: "12px" }}
        >
          <EditOutlined /> Edit
        </span>
      </Menu.Item>
      <Menu.Item
        key="delete"
        style={{ margin: "8px 0", backgroundColor: "#FFCDD2" }}
      >
        <span
          style={{ color: "#B71C1C", fontWeight: "bold", fontSize: "12px" }}
        >
          <DeleteOutlined /> Delete
        </span>
      </Menu.Item>
    </Menu>
  );

  const handleInputChange = (event) => {
    if (isModalOpen) return;

    const { value } = event.target;
    setSearchKeyword(value);
  };

  useEffect(() => {
    if (searchKeyword.trim()) {
      fetchDataWithDebounce();
    } else {
      // Reset fields to normal state
      // Your code to reset fields here
      console.log("Resetting fields to normal state");
    }
  }, [searchKeyword, fetchDataWithDebounce]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Auditor Name",
      dataIndex: "auditor_name",
      key: "auditor_name",
    },
    {
      title: "Work Type",
      dataIndex: "workType",
      key: "workType",
      render: (workType) => {
        const workTypeMap = {
          wfh: {
            label: "Work From Home",
            className: "bg-yellow-100 text-yellow-800",
          },
          office: { label: "Office", className: "bg-green-100 text-green-800" },
          audit: { label: "Audit", className: "bg-blue-100 text-blue-800" },
          onDuty: {
            label: "On Duty",
            className: "bg-orange-100 text-orange-800",
          },
          absent: { label: "Absent", className: "bg-red-100 text-red-800" },
        };

        const { label, className } = workTypeMap[workType] || {
          label: workType,
          className: "bg-gray-100 text-gray-800",
        };

        return (
          <span className={`px-2 py-1 rounded-md font-medium ${className}`}>
            {label}
          </span>
        );
      },
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
    },
    {
      title: "Total Hours",
      dataIndex: "totalHours",
      key: "totalHours",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Dropdown
          overlay={menu(record)}
          trigger={["click"]}
          placement="bottomLeft"
          arrow
          danger
        >
          <Button type="link" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <AdminDashboard>
        <div className="bg-blue-50 m-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Work Log Table</h2>
            <div className="space-x-2">
              <Space wrap>
                <Button
                  onClick={showDeleteConfirm}
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                  shape="round"
                >
                  Delete
                </Button>
              </Space>

              <Button
                type="primary"
                shape="round"
                icon={<PlusOutlined />}
                size="default"
                onClick={() => setIsModalOpen(true)}
                //disabled={workLogExists===true}
              >
                Add Work
              </Button>
            </div>
          </div>

          <div className="flex justify-between my-4">
            <ConfigProvider
              theme={{
                components: {
                  Radio: {
                    buttonBorderWidth: 0, // Remove border
                  },
                },
              }}
            >
              <Radio.Group
                value={sortData}
                onChange={(e) => setSortData(e.target.value)}
              >
                <Radio.Button
                  value="allist"
                  style={{
                    backgroundColor:
                      sortData === "alllist" ? "transparent" : "white",
                    color: sortData === "alllist" ? "black" : "black",
                    padding: "0 16px",
                    height: "32px",
                    lineHeight: "30px",
                    border: "1px solid #d3d3d3",
                    fontWeight: sortData === "alllist" ? "500" : "normal",
                  }}
                >
                  All list
                </Radio.Button>
                <Radio.Button
                  value="newlyadded"
                  style={{
                    backgroundColor:
                      sortData === "newlyadded" ? "transparent" : "white",
                    color: sortData === "newlyadded" ? "black" : "black",
                    padding: "0 16px",
                    height: "32px",
                    lineHeight: "30px",
                    border: "1px solid #d3d3d3",
                    fontWeight: sortData === "alllist" ? "normal" : "500",
                  }}
                >
                  Newly Added
                </Radio.Button>
              </Radio.Group>
            </ConfigProvider>

            <div className="space-x-2">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-semibold">Filters</h2>
                </div>
                <div className="ml-5">
                  <Select
                    showSearch
                    placeholder="Select an Auditor"
                    optionFilterProp="label"
                    options={[
                      { value: "none", label: "None" },
                      ...auditors.map((auditor) => ({
                        value: auditor._id,
                        label: auditor.userName,
                      })),
                    ]}
                    value={selectedAuditor}
                    onChange={handleAuditorChange}
                    style={{ width: 200 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <ConfigProvider
              theme={{
                token: {
                  colorTextHeading: "#4A5568", // Darker grey color for titles
                  colorText: "#4A5568", // Darker grey color for general text
                  fontWeight: "bold", // Make text bold
                },
                components: {
                  Table: {
                    colorText: "#4A5568", // Darker grey color for table text
                    fontWeight: "bold", // Make table text bold
                  },
                },
              }}
            >
              <Table
                rowSelection={{
                  type: selectionType,
                  ...rowSelection,
                }}
                columns={columns}
                dataSource={flattenedTableData}
                rowKey={(record) => record.key}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
              />
            </ConfigProvider>
          </div>
        </div>
        <UpdateWorkLog
          visible={isUpdateModalVisible}
          handleOk={handleOk}
          workLogId={userId}
          handleUpdateCancel={handleWorkLogCancel}
        />
        <WorkLogForm
          isModalOpen={isModalOpen}
          handleOk={handleOk}
          handleCancel={() => setIsModalOpen(false)}
        />
      </AdminDashboard>
    </>
  );
};

export default AdminWorkLogTable;
