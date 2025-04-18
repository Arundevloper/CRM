import React, { useState, useEffect } from "react";
import {
  Modal,
  DatePicker,
  Form,
  Input,
  Table,
  message,
  Select,
  Spin,
  Button,
} from "antd";
import axios from "axios";
import "../css/GenerateProposalModal.css";
import GenreateSuccessSendMailTableModal from "./GenreateSuccessSendMailTableModal";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";

// Extend dayjs with customParseFormat
dayjs.extend(customParseFormat);

const { Option } = Select;

const GenerateInvoiceModal = ({ visible, onOk, onCancel, proposalId }) => {
  const [form] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [showSendMailModal, setShowSendMailModal] = useState(false);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [items, setItems] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState([]);
  const [InvoiceId, setInvoiceId] = useState([]);
  const [initialValuesLoaded, setInitialValuesLoaded] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(moment());
  const [phone, setPhone] = useState(0);
  const [email, setEmail] = useState("");
  const [checkState, setCheckState] = useState("");
  const [sameState, setSameState] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOutlets, setLoadingOutlets] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) {
      setInvoiceDate(moment());

      const fetchInvoices = async () => {
        try {
          const response = await axios.get(
            `/api/invoice/getInvoicesByProposalId/${proposalId}`
          );
          setInvoices(response.data.invoices); // Adjust according to your API response structure
        } catch (err) {
          setError(err.message); // Set the error message
        } finally {
          setLoading(false); // Set loading to false after request completion
        }
      };

      // Fetch outlets when the modal is visible
      axios
        .get(`/api/proposal/getOutletsByProposalId/${proposalId}`)
        .then((response) => {
          setOutlets(
            response.data.map((outlet) => {
              const _id = outlet._id;
              const type_of_industry = outlet.type_of_industry || "";
              const unit = outlet.unit || 0;
              const man_days = outlet.man_days || 0;
              const quantity = outlet.quantity || 0;
              const unit_cost = outlet.unit_cost || 0;
              const description = outlet.description || 0;

              // Calculate amount based on quantity, unit cost, and man_days
              const amount = outlet.amount || 0;
              const is_invoiced = outlet.is_invoiced || 0;

              let postfix = "";
              switch (type_of_industry) {
                case "Transportation":
                  postfix = "VH";
                  break;
                case "Catering":
                  postfix = "FH";
                  break;
                case "Trade and Retail":
                  postfix = "Sq ft";
                  break;
                case "Manufacturing":
                  postfix = "PD/Line";
                  break;
                default:
                  postfix = ""; // or any default value
              }

              return {
                outletId: outlet._id || "",
                outlet_name: outlet.outlet_name || "",
                type_of_industry,
                unit,
                man_days,
                quantity,
                description,
                unit_cost,
                amount,
                _id,
                is_invoiced,
                service: `${unit} ${postfix}`,
              };
            })
          );
        })
        .catch((error) => {
          console.error("Error fetching outlets:", error);
        })
        .finally(() => {
          setLoadingOutlets(false);
        });

      // Fetch proposal data to initialize the form
      axios
        .get(`/api/invoice/getProposalById/${proposalId}`)
        .then((response) => {
          const {
            address,
            fbo_name,
            proposal_date,
            proposal_number,
            pincode,
            phone,
            email,
            gst_number,
          } = response.data;
          setEmail(email);
          setPhone(phone);
          form.setFieldsValue({
            address,
            fbo_name,
            proposal_date: proposal_date ? moment(proposal_date) : null,
            proposal_number,
            pincode,
            gst_number,
          });
          setInitialValuesLoaded(true);

          const state = address.line2.split(",")[1].trim();

          if (checkState === state) {
            setSameState(true);
          } else {
            setSameState(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching proposal data:", error);
        });

      const fetchProfileSetting = async () => {
        try {
          const response = await axios.get("/api/setting/getCompanyDetail");
          console.log("here", response.data.profile.company_address.state);
          setCheckState(response.data.profile.company_address.state);
        } catch (error) {
          console.error("Error is fetching the profile state");
        }
      };
      fetchInvoices();
      fetchProfileSetting();
    }
  }, [visible, proposalId, form, checkState]);

  // Separate useEffect for fetchInvoiceId
  useEffect(() => {
    const fetchInvoiceId = async () => {
      try {
        const response = await axios.get("/api/invoice/generateInvoiceNumber");
        setInvoiceNumber(response.data.invoice_number);
      } catch (error) {
        console.error("Error fetching InvoiceId", error);
      }
    };
    fetchInvoiceId();
  }, [visible, form]);

  const handleCancel = () => {
    setInvoices([]);
    onCancel();
    form.resetFields();
    setItems([]);
    setOutlets([]);
    setSelectedOutlets([]);
    setShowForm(false);
  };

  const handleSelect = (record, selected) => {
    const updatedSelectedOutlets = selected
      ? [...selectedOutlets, record]
      : selectedOutlets.filter((outlet) => outlet._id !== record._id);
    setSelectedOutlets(updatedSelectedOutlets);
  };
  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoice/view-invoice/${invoiceId}`); // Use navigate to redirect
  };
  const handleSelectAll = (selected, selectedRows) => {
    const validSelectedRows = selectedRows.filter((row) => row && row._id);
    setSelectedOutlets(selected ? validSelectedRows : []);
  };

  const handleNext = () => {
    const selectedItems = selectedOutlets.map((outlet) => {
      let postfix = "";

      switch (
        outlet.type_of_industry // assuming record refers to outlet
      ) {
        case "Transportation":
          postfix = "VH";
          break;
        case "Catering":
          postfix = "FH";
          break;
        case "Trade and Retail":
          postfix = "Sq ft";
          break;
        case "Manufacturing":
          postfix = "PD/Line";
          break;
        default:
          postfix = ""; // or any default value
      }

      return {
        _id: outlet._id,
        outlet_name: outlet.outlet_name,
        description: outlet.description,
        man_days: outlet.man_days,
        unit_cost: outlet.unit_cost,
        quantity: outlet.quantity,
        discount: outlet.discount,
        amount: outlet.amount,
        service: outlet.unit + " " + postfix, // Assuming 'unit' is a property of the outlet object
      };
    });

    setItems(selectedItems);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      // Validate the form fields
      await form.validateFields();

      // Collect form values
      const formData = form.getFieldsValue();

      // Prepare the data to be sent
      const invoiceData = {
        ...formData,
        proposalId,
        outlets: items,
        invoice_number: invoiceNumber,
        email: email,
        phone: phone,
        same_state: sameState,
      };

      // Send the request and wait for the response
      const response = await axios.post(
        "/api/invoice/createInvoice",
        invoiceData
      );

      // Check if the response is successful based on status code
      if (response.status === 201 && response.data && response.data.data) {
        message.success("Invoice generated successfully");
        form.resetFields();
        setShowForm(false);
        onCancel();
        setInvoiceId(response.data.data._id);
        setShowSendMailModal(true);
      } else {
        message.error("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      message.error(
        `Error generating invoice: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);

    let tax = 0;
    let cgst = 0;
    let sgst = 0;
    let gst = 0;

    if (sameState) {
      // Calculate CGST and SGST (9% each)
      cgst = subTotal * 0.09;
      sgst = subTotal * 0.09;
      tax = cgst + sgst;
      console.log(1);
    } else {
      // Calculate GST (18%)
      gst = subTotal * 0.18;
      tax = gst;
      console.log(2);
    }

    const total = subTotal + tax;
    return { subTotal, cgst, sgst, gst, total };
  };

  const { subTotal, cgst, sgst, gst, total } = calculateTotals();

  const outletsColumns = [
    {
      title: "Outlet Name",
      dataIndex: "outlet_name",
      key: "outlet_name",
    },
    {
      title: "Service",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Criteria",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Man Days",
      dataIndex: "man_days",
      key: "man_days",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) =>
        amount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
    },
  ];

  const itemsColumns = [
    {
      title: "Outlet name",
      dataIndex: "outlet_name",
      key: "outlet_name",
      render: (value) => <span className=" block">{value}</span>,
    },
    {
      title: "Service",
      dataIndex: "description",
      key: "description",
      render: (value) => <span className=" block">{value}</span>,
    },
    {
      title: "Criteria",
      dataIndex: "service",
      key: "service",
      render: (value) => <span className=" block">{value}</span>,
    },
    {
      title: "Man Days",
      dataIndex: "man_days",
      key: "man_days",
      render: (value) => <span className=" block">{value}</span>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "",
      render: (value) => <span className=" block">{value}</span>,
    },
    {
      title: "Unit Cost",
      dataIndex: "unit_cost",
      key: "unit_cost",
      render: (value) => <span className=" block">{value}</span>,
    },

    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className=" block">
          {amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </span>
      ),
    },
  ];
  const statesAndUTs = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
  ];

  const handleOk = () => {
    setShowSendMailModal(false);
  };
  return (
    <>
      <Modal
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        className="acc-modal"
      >
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <div
            className="text-center align-middle font-medium text-xl bg-blue-50 p-7"
            style={{ boxShadow: "0 4px 2px -2px lightgrey" }}
          >
            Generate Invoice
          </div>
          {!showForm ? (
            <div className="p-4" style={{ backgroundColor: "#F6FAFB" }}>
              <div className="text-center font-medium text-xl mb-5 rounded-md">
                Select Outlets
              </div>
              <Spin spinning={loadingOutlets}>
                <Table
                  rowSelection={{
                    type: "checkbox",
                    onSelect: handleSelect,
                    onSelectAll: handleSelectAll,
                    getCheckboxProps: (record) => ({
                      disabled: record.is_invoiced, // Disable row if 'is_invoiced' is true
                    }),
                  }}
                  dataSource={outlets}
                  columns={outletsColumns}
                  rowKey="_id" // Ensure each row has a unique key (use _id here)
                  pagination={false}
                />
              </Spin>
              <div className="text-center mt-4">
                <Button
                  className="bg-buttonModalColor  text-white rounded"
                  onClick={handleNext}
                  disabled={selectedOutlets.length === 0} // Disable if no outlets are selected
                >
                  Next
                </Button>
              </div>
              {invoices.length > 0 && (
                <div className="mt-4">
                  <div className="text-center font-medium text-xl mb-5 rounded-md">
                    Generated Invoices
                  </div>
                  <ul className="invoice-list">
                    {invoices.map((invoice) => (
                      <li
                        key={invoice._id}
                        className="flex justify-around items-center mb-2"
                      >
                        <span>{invoice.fbo_name}</span>
                        <span>{invoice.invoice_number}</span>

                        <Button
                          type="link"
                          onClick={() => handleViewInvoice(invoice._id)}
                          className="text-blue-600"
                        >
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6" style={{ backgroundColor: "#F6FAFB" }}>
              <div className="text-center font-medium text-xl mb-5 rounded-md">
                Invoice Details
              </div>
              <Form.Item
                label="FBO name (Business Name)"
                name="fbo_name"
                className="flex-1"
                rules={[{ required: true, message: "Please enter FBO name!" }]}
              >
                <Input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </Form.Item>
              <div className="flex space-x-4">
                <Form.Item
                  label="Invoice date"
                  className="flex-1"
                  name="invoice_date"
                  rules={[
                    {
                      required: true,
                      message: "Please select the Proposal Date!",
                    },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    className="w-full"
                    onChange={(date) => {
                      // Ensure the date is being set correctly in the form
                      form.setFieldValue("proposal_date", date);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Proposal number (Order Ref No.)"
                  className="flex-1"
                  name="proposal_number"
                  rules={[
                    { required: true, message: "Proposal number is required!" },
                  ]}
                >
                  <Input
                    placeholder="Auto Generated"
                    className="w-full p-2 border border-gray-300 rounded"
                    readOnly
                  />
                </Form.Item>
                <Form.Item
                  label="Invoice number"
                  className="flex-1"
                  rules={[
                    { required: true, message: "Invoice number is required!" },
                  ]}
                >
                  <Input
                    value={invoiceNumber}
                    placeholder="Auto Generated"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
              </div>
              <Form.Item label="Address">
                <Input.Group>
                  <Form.Item
                    name={["address", "line1"]}
                    rules={[
                      {
                        required: true,
                        message: "Please enter address line 1!",
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </Form.Item>
                  <Form.Item
                    name={["address", "line2"]}
                    rules={[
                      {
                        required: true,
                        message: "Please enter address line 2!",
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
              <div className="flex space-x-4">
                <Form.Item
                  label="Pincode"
                  name="pincode"
                  className="flex-1"
                  rules={[{ required: true, message: "Please enter pincode!" }]}
                >
                  <Input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
                <Form.Item
                  label="GST Number"
                  name="gst_number"
                  className="flex-1"
                  rules={[
                    { required: true, message: "Please input the GST number!" },
                  ]}
                >
                  <Input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="place_of_supply"
                label="Place of Supply"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    message: "Please select place of supply!",
                  },
                ]}
              >
                <Select placeholder="Select place of supply">
                  {statesAndUTs.map((state) => (
                    <Option key={state} value={state}>
                      {state}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div className="flex space-x-4">
                <Form.Item
                  label="Field Executive Name"
                  name="field_executive_name"
                  className="flex-1"
                  rules={[
                    {
                      required: true,
                      message: "Please enter field executive name!",
                    },
                  ]}
                >
                  <Input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
                <Form.Item
                  label="Team Leader Name"
                  name="team_leader_name"
                  className="flex-1"
                  rules={[
                    {
                      required: true,
                      message: "Please enter team leader name!",
                    },
                  ]}
                >
                  <Input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
              </div>
              <div className="my-4">
                <h3 className="text-lg font-semibold mb-2">Items Table</h3>
                <Table
                  dataSource={items}
                  columns={itemsColumns}
                  pagination={false}
                  rowKey={(item) => item.outlet_name}
                  rowClassName="text-left"
                />
              </div>
              <div className="my-4 p-4 border rounded w-1/2 ml-auto bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Sub Total:</div>
                  <div className="text-sm font-medium">
                    {subTotal.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </div>
                </div>

                {sameState ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">CGST [9%]:</div>
                      <div className="text-sm font-medium">
                        {cgst.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">SGST [9%]:</div>
                      <div className="text-sm font-medium">
                        {sgst.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">IGST [18%]:</div>
                    <div className="text-sm font-medium">
                      {gst.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Total:</div>
                  <div className="text-lg font-bold">
                    {total.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <button
                  className="bg-buttonModalColor px-4 py-2 text-white rounded"
                  htmlType="submit"
                >
                  Generate
                </button>
              </div>
            </div>
          )}
        </Form>
      </Modal>

      <GenreateSuccessSendMailTableModal
        onClose={() => {
          setShowSendMailModal(false);
          setSelectedOutlets([]);
        }}
        id={InvoiceId}
        onOk={handleOk}
        title="Generate Invoice"
        name="invoice"
        route="generateInvoice"
        visible={showSendMailModal}
        buttonTitle="Go to Invoice"
      />
    </>
  );
};

export default GenerateInvoiceModal;
