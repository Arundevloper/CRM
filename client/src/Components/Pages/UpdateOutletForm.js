import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Button, message, Spin, Select } from "antd";
import axios from "axios";
import "../css/outletForm.css";

const { Option } = Select;

const UpdateOutletForm = ({
  isModalVisible,
  handleOk,
  handleCancel,
  outletId,
  businessId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [industryType, setIndustryType] = useState(null);

  const fetchOutletDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/getParticularOutletDetails/${outletId}`
      );
      const outlet = response.data;

      // Set initial values for the form
      form.setFieldsValue({
        branch_name: outlet.branch_name,
        contact_number: outlet.contact_number,
        contact_person: outlet.contact_person,
        fssai_license_number: outlet.fssai_license_number,
        gst_number: outlet.gst_number,
        type_of_industry: outlet.type_of_industry,
        unit: outlet.unit,
        no_of_production_line: outlet.no_of_production_line,
        vertical_of_industry: outlet.vertical_of_industry,
      });

      // Initialize industryType based on the fetched data
      setIndustryType(outlet.type_of_industry);

      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching outlet details:", error);
      message.error("Failed to fetch outlet details. Please try again later.");
      setLoading(false); // Set loading to false even if there's an error
    }
  }, [outletId, form]);

  useEffect(() => {
    if (isModalVisible) {
      setLoading(true); // Set loading to true when modal is visible
      if (outletId) {
        fetchOutletDetails();
      } else {
        form.resetFields(); // Reset form fields if there's no outletId
        setIndustryType(null); // Reset industry type
        setLoading(false); // Set loading to false immediately
      }
    }
  }, [isModalVisible, outletId, form, fetchOutletDetails]);

  const handleSubmit = async () => {
    try {
      // Validate form fields and get values
      const values = await form.validateFields();
      // Include business ID in the outlet data
      const outletData = { ...values, business: businessId };

      // Check if outletId is present to determine create or update
      if (outletId) {
        // Update existing outlet
        await axios.put(`/api/updateOutlet/${outletId}`, outletData);
        message.success("Outlet data updated successfully");
      } else {
        // Create new outlet
        await axios.post("/api/saveOutlet", outletData);
        message.success("Outlet data saved successfully");
      }

      // Handle success actions
      handleOk();
      form.resetFields();
      setIsEditMode(false); // Exit edit mode after submission
    } catch (error) {
      // Check if the error is from form validation
      if (error.name === "ValidationError") {
        console.error("Validation error:", error);
        message.error("Please correct the validation errors.");
      } else {
        // Log the error and show a generic error message
        console.error("Error saving outlet data:", error);
        message.error("Failed to save outlet data. Please try again later.");
      }
    }
  };

  const handleIndustryChange = (value) => {
    setIndustryType(value);
  };

  const getUnitLabel = () => {
    switch (industryType) {
      case "Transportation":
        return "No of Vehicle";
      case "Manufacturing":
        return "No of Food Handlers";
      case "Trade and Retail":
        return "Area (Sq. ft)";
      case "Catering":
        return "No of Food Handlers";
      default:
        return "Enter the Unit";
    }
  };

  return (
    <Modal
      className="h-80vh overflow-hidden"
      title={
        <div className="flex justify-between items-center">
          <span className="text-xl">
            {outletId ? "View/Edit Outlet" : "Add Outlet"}
          </span>
          <div className="mr-8">
            {outletId && !isEditMode && (
              <Button type="primary" onClick={() => setIsEditMode(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      }
      visible={isModalVisible}
      onCancel={() => {
        handleCancel();
        setIsEditMode(false); // Exit edit mode on cancel
      }}
      footer={null}
    >
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">Outlet Name</span>
            }
            name="branch_name"
            rules={[{ required: true, message: "Please enter branch name" }]}
          >
            <Input
              placeholder="Enter the name of the branch"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
              disabled={!isEditMode}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">
                FSSAI License Number
              </span>
            }
            name="fssai_license_number"
            rules={[
              {
                required: true,
                message: "Please enter the FSSAI License Number",
              },
              {
                pattern: /^[0-9]{14}$/,
                message:
                  "FSSAI License No. must be exactly 14 numeric characters.",
              },
            ]}
          >
            <Input
              placeholder="Enter FSSAI License"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
              disabled={!isEditMode}
              maxLength={14} // Prevent input beyond 14 characters
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">
                Type Of Industry
              </span>
            }
            name="type_of_industry"
            rules={[
              { required: true, message: "Please select an industry Type" },
            ]}
          >
            <Select
              placeholder="Select industry Type"
              className="w-full"
              size="large"
              onChange={handleIndustryChange}
              disabled={!isEditMode}
            >
              <Option value="Catering">Catering</Option>
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Trade and Retail">Trade and Retail</Option>
              <Option value="Transportation">Transportation</Option>
            </Select>
          </Form.Item>

          {(industryType || form.getFieldValue("type_of_industry")) && (
            <>
              <Form.Item
                label={
                  <span className="text-gray-600 font-semibold">
                    {getUnitLabel()}
                  </span>
                }
                name="unit"
                rules={[{ required: true, message: "Please enter the unit" }]}
              >
                <Input
                  placeholder="Enter the unit"
                  className="placeholder-gray-400 p-3 rounded-lg w-full"
                  disabled={!isEditMode}
                />
              </Form.Item>

              {industryType === "Manufacturing" ||
              form.getFieldValue("type_of_industry") === "Manufacturing" ? (
                <Form.Item
                  label={
                    <span className="text-gray-600 font-semibold">
                      No. Of Production Line
                    </span>
                  }
                  name="no_of_production_line"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the number of production lines",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter the number of production lines"
                    className="placeholder-gray-400 p-3 rounded-lg w-full"
                    disabled={!isEditMode}
                  />
                </Form.Item>
              ) : null}
            </>
          )}
          <Form.Item
            name="vertical_of_industry"
            label={
              <span className="text-gray-600 font-semibold">
                Vertical of Industry
              </span>
            }
          >
            <Select
              placeholder="Select Industry Vertical"
              size={"large"}
              disabled={!isEditMode}
            >
              <Option value="Sweet Shop">Sweet Shop</Option>
              <Option value="Meat Retail">Meat Retail</Option>
              <Option value="Hub">Hub</Option>
              <Option value="Market">Market</Option>
              <Option value="General Manufacturing">
                General Manufacturing
              </Option>
              <Option value="Meat & Meat Processing">
                Meat & Meat Processing
              </Option>
              <Option value="Dairy Processing">Dairy Processing</Option>
              <Option value="Catering">Catering</Option>
              <Option value="Transportation">Transportation</Option>
              <Option value="Storage/Warehouse">Storage/Warehouse</Option>
              <Option value="Institute Canteen">Institute Canteen</Option>
              <Option value="Industrial Canteen">Industrial Canteen</Option>
              <Option value="Temple Kitchen">Temple Kitchen</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">GST Number</span>
            }
            name="gst_number"
            rules={[
              {
                message: "Please enter GST number",
              },
              {
                pattern: /^[A-Za-z0-9]{15}$/,
                message: "GST number must be 15 alphanumeric characters",
              },
            ]}
          >
            <Input
              placeholder="Enter GST number"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
              disabled={!isEditMode}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">
                Contact Number
              </span>
            }
            name="contact_number"
          >
            <Input
              placeholder="Enter contact number"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
              disabled={!isEditMode}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">
                Contact Person
              </span>
            }
            name="contact_person"
          >
            <Input
              placeholder="Enter contact person"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
              disabled={!isEditMode}
            />
          </Form.Item>

          <Form.Item>
            {isEditMode && (
              <div className="flex justify-center">
                <div className="flex justify-between space-x-2">
                  <Button className="mr-5" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    className="ml-5"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateOutletForm;
