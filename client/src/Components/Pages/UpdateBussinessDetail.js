import React, { useEffect, useState } from "react";
import { Form, Input, Select, Spin, Button, Checkbox, message } from "antd";
import { useNavigate, useLocation, useParams, NavLink } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

const indianStatesAndUTs = [
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
  "Ladakh",
  "Jammu and Kashmir",
];

const UpdateBusinessDetail = ({
  loading,
  setLoading,
  setBusinessId,
  onNext,
}) => {
  const [initialValues, setInitialValues] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [showUpdateButtons, setShowUpdateButtons] = useState(false);
  const [isGstEnabled, setIsGstEnabled] = useState(true); // New state for GST checkbox
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const handleCancel = () => {
    setIsEditable(false);
    setShowUpdateButtons(false);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBusinessData = async () => {
      try {
        console.log(`Fetching data for business ID: ${id}`);

        const response = await axios.get(`/api/getBusinessDataById/${id}`);
        console.log(response.data?.success);
        if (response.data?.success && isMounted) {
          const businessData = response.data.data;
          setBusinessId(businessData._id);
          console.log(response.data.data);

          setInitialValues({
            name: businessData.name,
            contact_person: businessData.contact_person,
            fssai_license_number: businessData.fssai_license_number,
            phone: businessData.phone,
            email: businessData.email,
            gst_number: businessData.gst_number,
            type_of_industry: businessData.type_of_industry || [],
            vertical_of_industry: businessData.vertical_of_industry || [],
            "address.line1": businessData.address?.line1 || "",
            "address.line2": businessData.address?.line2 || "",
            "address.city": businessData.address?.city || "",
            "address.state": businessData.address?.state || "",
            "address.pincode": businessData.address?.pincode || "",
            enable_gst: !!businessData.gst_number, // Set initial state for GST checkbox
            place_of_supply: businessData.place_of_supply,
            customer_type: businessData.customer_type,
          });
          setIsGstEnabled(!!businessData.gst_number); // Set state based on initial data
        } else {
          message.error("Failed to fetch business data");
          console.error("Response data: ", response.data);
        }
      } catch (error) {
        message.error("Error fetching business data");
        console.error("Error: ", error);
      }
    };

    if (id) fetchBusinessData();

    return () => {
      isMounted = false;
    };
  }, [id, setBusinessId]);

  const handleSubmit = async (values) => {
    setButtonLoading(true);
    try {
      const requestData = { ...values };

      if (!requestData.enable_gst) {
        requestData.gst_number = "";
      }

      const idFromPath = location.pathname.split("/").pop();
      if (idFromPath && idFromPath !== "update-business") {
        requestData._id = idFromPath;
      }

      let response;
      if (requestData._id || requestData.form_id) {
        response = await axios.put("/api/updateClientData", requestData);
      }

      if (response.data?.success) {
        message.success("Business data updated successfully");
        setIsEditable(false);
        setShowUpdateButtons(false);
      } else {
        message.error("An Error Occurred");
        console.error("Update response: ", response.data);
      }
    } catch (error) {
      message.error("Error updating business data");
      console.error("Error: ", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleGstCheckboxChange = (e) => {
    setIsGstEnabled(e.target.checked);
  };

  if (!initialValues) {
    return (
      <div className="flex justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <div className="m-6">
          <div className="flex justify-between">
            <Form.Item
              className="w-1/2"
              name="name"
              label={
                <span className="text-gray-600 font-semibold">FBO Name</span>
              }
              rules={[
                { required: true, message: "Please enter business name" },
              ]}
            >
              <Input
                placeholder="Enter your Business Name"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
                disabled={!isEditable}
              />
            </Form.Item>

            {!isEditable && (
              <Button
                type="primary"
                onClick={() => {
                  setIsEditable(true);
                  setShowUpdateButtons(true);
                }}
              >
                Edit
              </Button>
            )}
          </div>

          <Form.Item
            name="contact_person"
            className="w-1/2"
            label={
              <span className="text-gray-600 font-semibold">
                Contact Person Name
              </span>
            }
            rules={[
              { required: true, message: "Please enter contact person name" },
            ]}
          >
            <Input
              placeholder="Enter your contact person name"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable}
            />
          </Form.Item>

          <Form.Item
            className="w-1/2"
            label={
              <span className="text-gray-600 font-semibold">Email ID</span>
            }
            name="email"
            rules={[
              { required: true, message: "Please enter email ID" },
              { type: "email", message: "Please enter a valid email ID" },
            ]}
          >
            <Input
              placeholder="Enter your email address"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">Phone Number</span>
            }
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input
              placeholder="Enter your phone number"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable}
            />
          </Form.Item>

          <Form.Item
            name="enable_gst"
            valuePropName="checked"
            className="w-1/4"
            initialValue={initialValues.enable_gst || true}
          >
            <Checkbox onChange={handleGstCheckboxChange} disabled={!isEditable}>
              <span className="text-gray-600 font-semibold">
                Do you have GST Number?
              </span>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="gst_number"
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">GST Number</span>
            }
            rules={[
              {
                required: isGstEnabled,
                message: "Please enter GST number",
              },
              {
                pattern: /^[A-Za-z0-9]{15}$/,
                message: "GST number must be 15 alphanumeric characters",
              },
            ]}
          >
            <Input
              placeholder="Enter your GST number"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable || !isGstEnabled}
            />
          </Form.Item>
          <Form.Item
            label="Customer Type"
            className="w-1/4"
            name="customer_type"
            initialValue={initialValues?.customer_type}
            rules={[
              { required: true, message: "Please select the customer type" },
            ]}
          >
            <Select disabled={!isEditable}>
              <Option value="MOU">MOU</Option>
              <Option value="Non-MOU">Non-MOU</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="place_of_supply"
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">
                Place of Supply
              </span>
            }
            // rules={[{ required: true, message: 'Please select the state or union territory' }]}
          >
            <Select
              placeholder="Select state or union territory"
              disabled={!isEditable}
            >
              {indianStatesAndUTs.map((state) => (
                <Option key={state} value={state}>
                  {state}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type_of_industry"
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">
                Type of Industry
              </span>
            }
          >
            <Select
              placeholder="Select Type of Industry"
              size="large"
              mode="multiple"
              disabled={!isEditable}
            >
              <Option value="Catering">Catering</Option>
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Trade and retail">Trade and Retail</Option>
              <Option value="Transportation">Transportation</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="vertical_of_industry"
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">
                Vertical of Industry
              </span>
            }
          >
            <Select
              placeholder="Select Industry Vertical"
              size={"large"}
              mode="multiple"
              disabled={!isEditable}
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
            label={<span className="text-gray-600 font-semibold">Address</span>}
            name="address.line1"
            className="w-1/2"
          >
            <Input
              placeholder="Line 1"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable}
            />
          </Form.Item>
          <Form.Item name="address.line2" className="w-1/2">
            <Input
              placeholder="Line 2 (Optional)"
              className="placeholder-gray-400 p-3 rounded-lg"
              disabled={!isEditable}
            />
          </Form.Item>
          <div className="flex justify-between w-1/2">
            <Form.Item name="address.city" className="w-full mr-2">
              <Input
                placeholder="City"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
                disabled={!isEditable}
              />
            </Form.Item>
            <Form.Item name="address.state" className="w-full mr-2">
              <Input
                placeholder="State"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
                disabled={!isEditable}
              />
            </Form.Item>
            <Form.Item name="address.pincode" className="w-full">
              <Input
                placeholder="Pincode"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
                disabled={!isEditable}
              />
            </Form.Item>
          </div>
        </div>
        <div
          className={`sticky bottom-0 z-50 bg-white w-full py-4 px-6 flex justify-start shadow-top transition-transform duration-500 ${
            showUpdateButtons
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <Form.Item>
            <Button type="primary" className="ml-6" loading={buttonLoading} htmlType="submit">
              Update
            </Button>
            <Button type="primary" className="ml-6"disabled={buttonLoading} onClick={handleCancel}>
              Cancel
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default UpdateBusinessDetail;
