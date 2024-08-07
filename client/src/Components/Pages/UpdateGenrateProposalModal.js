import React, { useState, useEffect } from "react";
import {
  Modal,
  DatePicker,
  Form,
  InputNumber,
  Input,
  Select,
  Table,
  Button,
  message,
} from "antd";
import moment from "moment";
import axios from "axios";


const { Option } = Select;

const UpdateGenerateProposalModal = ({ visible, onOk, onCancel, proposalId }) => {
  const [form] = Form.useForm();
  const [outletItem, setItems] = useState([
    {
      outletId: "",
      outlet_name: "",
      no_of_food_handlers: 0,
      man_days: 0,
      unit_cost: 0,
      discount: 0,
      amount: 0,
    },
  ]);

  const [proposal_date, setProposalDate] = useState(moment());
  const [proposal_number, setProposalNumber] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [total, setTotal] = useState(0);
  const handleCancel = () => {
    setSubTotal(0);
    setSgst(0);
    setCgst(0);
    setTotal(0);
    onCancel();
  };

useEffect(() => {
  fetchProposalDetails();
}, [proposalId]);

const fetchProposalDetails = async () => {
  try {
    const response = await axios.get(
      `/api/proposal/getProposalById/${proposalId}`
    );
    const proposalData = response.data;
 console.log(outletItem);
    // Initialize form fields with fetched data
    form.setFieldsValue({
      fbo_name: proposalData.fbo_name,
      address: {
        line1: proposalData.address.line1,
        line2: proposalData.address.line2,
      },
      pincode: proposalData.pincode,
      gst_number: proposalData.gst_number,
      contact_person: proposalData.contact_person,
      phone: proposalData.phone,
      email: proposalData.email || "",
      proposal_number: proposalData.proposal_number,
    });
     
      // Set items state with outlets from the fetched proposal data
      const initializedItems = proposalData.outlets.map((outlet) => ({
        outletId: outlet._id || "",
        outlet_name: outlet.outlet_name || "",
        no_of_food_handlers: outlet.no_of_food_handlers || 50,
        man_days: outlet.man_days || 0,
        unit_cost: outlet.unit_cost || 0,
        discount: outlet.discount || 0,
        amount: outlet.amount || 0,
      }));

      setItems(initializedItems); 
      console.log("Initialized outlet items:", initializedItems); 
      calculateTotals(initializedItems); 
     console.log(outletItem);
  } catch (error) {
    console.error("Error fetching proposal details", error);
  }
};








  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const formData = form.getFieldsValue();

      const proposalData = {
        ...formData,
        proposalId: proposalId,
        proposal_date: proposal_date.format("YYYY-MM-DD"),
        outlets: outletItem,
      };

      const response = await axios.post(
        "/api/proposal/createProposalAndOutlet",
        proposalData
      );
      onOk();
      message.success("Proposal updated successfully!");
    } catch (error) {
      message.error("Failed to update proposal.");
    }
  };

  const addItem = () => {
    setItems((prevItems) => {
      const newItems = [
        ...prevItems,
        {
          outletId: "",
          outlet_name: "",
          no_of_food_handlers: 0,
          man_days: 0,
          unit_cost: 0,
          discount: 0,
          amount: 0,
        },
      ];
      calculateTotals(newItems);
      return newItems;
    });
  };

  const removeItem = (index) => {
    const newItems = outletItem.filter((item, i) => i !== index);
    setItems(newItems);
  };

  const calculateManDays = (foodHandlers) => {
    if (foodHandlers <= 50) return 0.5;
    if (foodHandlers <= 100) return 1;
    if (foodHandlers <= 300) return 1.5;
    if (foodHandlers <= 600) return 2.5;
    if (foodHandlers <= 1000) return 3;
    return 3;
  };

  const handleInputChange = (index, field, value) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      if (field === "outletId") {
        const selectedOutlet = outlets.find((outlet) => outlet._id === value);
        const man_days = calculateManDays(
          selectedOutlet ? selectedOutlet.no_of_food_handlers : 0
        );
        newItems[index] = {
          ...newItems[index],
          outletId: value,
          outlet_name: selectedOutlet ? selectedOutlet.branch_name : "",
          no_of_food_handlers: selectedOutlet
            ? selectedOutlet.no_of_food_handlers
            : 0,
          man_days,
          unit_cost: 0, // Set unit_cost to 0 when an outlet is selected
        };
      } else {
        newItems[index][field] = value;
        if (field === "no_of_food_handlers") {
          newItems[index].man_days = calculateManDays(value);
        }
      }
      newItems[index].amount =
        newItems[index].no_of_food_handlers *
          newItems[index].man_days *
          newItems[index].unit_cost -
        newItems[index].discount;

      calculateTotals(newItems); // Update totals when items change
      return newItems;
    });
  };

  const calculateTotals = () => {
    if (!Array.isArray(outletItem) || outletItem.length === 0) {
      setSubTotal(0);
      setSgst(0);
      setCgst(0);
      setTotal(0);
      return;
    }

    const calculatedSubTotal = outletItem.reduce((sum, item) => {
      const amount = typeof item.amount === "number" ? item.amount : 0;
      return sum + amount;
    }, 0);

    const calculatedIgst = calculatedSubTotal * 0.09;
    const calculatedCgst = calculatedSubTotal * 0.09;
    const calculatedTotal =
      calculatedSubTotal + calculatedIgst + calculatedCgst;

    setSubTotal(calculatedSubTotal);
    setSgst(calculatedIgst);
    setCgst(calculatedCgst);
    setTotal(calculatedTotal);

    // Update each outletItem with the totals
    const updatedItems = outletItem.map((item) => ({
      ...item,
      sgst: calculatedIgst,
      cgst: calculatedCgst,
      subTotal: calculatedSubTotal,
      total: calculatedTotal,
    }));
    setItems(updatedItems);
  };

  const columns = [
    {
      title: "Outlet name",
      dataIndex: "outletId",
      render: (text, record, index) => (
        <Select
          value={text}
          onChange={(value) => handleInputChange(index, "outletId", value)}
          className="w-full"
          style={{ width: 120 }}
        >
          {outlets.map((outlet) => (
            <Option key={outlet._id} value={outlet.branch_name}>
              {outlet.branch_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "No of Food Handlers",
      dataIndex: "no_of_food_handlers",
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) =>
            handleInputChange(index, "no_of_food_handlers", value)
          }
          className="w-full"
        />
      ),
    },
    {
      title: "Man Days",
      dataIndex: "man_days",
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleInputChange(index, "man_days", value)}
          className="w-full"
        />
      ),
    },
    {
      title: "Unit Cost(₹) ",
      dataIndex: "unit_cost",
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleInputChange(index, "unit_cost", value)}
          className="w-full"
        />
      ),
    },
    {
      title: "Discount(₹)",
      dataIndex: "discount",
      render: (text, record, index) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(value) => handleInputChange(index, "discount", value)}
          className="w-full"
        />
      ),
    },
    {
      title: "Amount(₹)",
      dataIndex: "amount",
      render: (text) =>
        text.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
        }),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, __, index) => (
        <Button onClick={() => removeItem(index)} type="link" danger>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        style={{ padding: "0 !important" }}
        className="acc-modal"
      >
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <div
            className="text-center align-middle font-medium text-xl title-div bg-blue-50 p-7"
            style={{ boxShadow: "0 4px 2px -2px lightgrey" }}
          >
            Edit Generate Proposal
          </div>
          <div
            className="px-8 pt-4 pb-8"
            style={{ backgroundColor: "#F6FAFB" }}
          >
            <div className="text-center font-medium text-xl mb-5 rounded-md">
              Edit Document
            </div>
            <div className="flex space-x-4">
              <Form.Item
                label="FBO name (Business Name)"
                name="fbo_name"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    message: "Please input the business name!",
                  },
                ]}
              >
                <Input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </Form.Item>
              <Form.Item label="Proposal date" className="flex-1" size="large">
                <DatePicker className="w-full" value={proposal_date} disabled />
              </Form.Item>
              <Form.Item
                label="Proposal number"
                name="proposal_number"
                className="flex-1"
              >
                <Input
                  placeholder="Auto Generated"
                  className="w-full p-2 border border-gray-300 rounded"
                  readOnly
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
                      message: "Please input the address line 1!",
                    },
                  ]}
                >
                  <Input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </Form.Item>
                <Form.Item name={["address", "line2"]}>
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
                rules={[
                  { required: true, message: "Please input the pincode!" },
                ]}
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
            <div className="flex space-x-4">
              <Form.Item
                label="Contact Person Name"
                name="contact_person"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    message: "Please input the contact person name!",
                  },
                ]}
              >
                <Input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </Form.Item>
              <Form.Item
                label="Contact Person Number"
                name="phone"
                className="flex-1"
                rules={[
                  {
                    required: true,
                    message: "Please input the contact person number!",
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
              <h3 className="text-lg font-semibold mb-2">Items table</h3>
              <Table
                dataSource={outletItem}
                columns={columns}
                pagination={false}
              />

              <button
                type="button"
                onClick={addItem}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                + Add New Row
              </button>
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
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">IGST (9%):</div>
                <div className="text-sm font-medium">
                  {sgst.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">CGST (9%):</div>
                <div className="text-sm font-medium">
                  {cgst.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </div>
              </div>
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
        </Form>
      </Modal>
    </>
  );
};

export default UpdateGenerateProposalModal;
