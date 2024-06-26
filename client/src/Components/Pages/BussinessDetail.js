import React, { useEffect,useState } from "react";
import { Form, Input, Button, Select,Spin} from "antd";
import { NavLink, useNavigate, useLocation, useParams, } from "react-router-dom";
import axios from "axios";


const { Option } = Select;

const BusinessDetail = ({ onSubmit, loading, disabled }) => {
  const [form] = Form.useForm();
  const [checkingFormId, setCheckingFormId] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { formId } = useParams();

  useEffect(() => {
    const checkFormId = async () => {
      try {
        const response = await axios.get(`/checkFormId/${formId}`);
        if (response.data.success) {
          navigate(`/client-success/${formId}`);
        }
      } catch (error) {
        console.error("Error checking form ID:", error);
      } finally {
        setCheckingFormId(false);
      }
    };

    if (formId) {
      checkFormId();
    } else {
      setCheckingFormId(false);
    }
  }, [formId, navigate]);


 
  const handleSubmit = async (values) => {
    if (location.pathname === `/client-onboarding/${formId}`) {
      values.added_by = "Client Form";
      values.form_id = formId;
    } else {
      values.added_by = "Manual";
    }
    onSubmit(values);
  };

  return checkingFormId ? (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" />
    </div>
  ) : (
    <div className="">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="m-6">
          <Form.Item
            className="w-1/2"
            name="name"
            label={
              <span className="text-gray-600 font-semibold">FBO Name</span>
            }
            rules={[{ required: true, message: "Please enter business name" }]}
          >
            <Input
              placeholder="Enter your Business Name"
              className="placeholder-gray-400 p-3 rounded-lg w-full"
            />
          </Form.Item>
          <Form.Item
            name="contact_person"
            className="w-1/2"
            label={
              <span className="text-gray-600 font-semibold">
                Contact Person Name
              </span>
            }
            rules={[
              {
                required: true,
                message: "Please enter contact person name",
              },
            ]}
          >
            <Input
              placeholder="Enter your contact person name"
              className="placeholder-gray-400 p-3 rounded-lg"
            />
          </Form.Item>
          <Form.Item
            name="business_type"
            FSSAI
            License
            Number
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">Business Type</span>
            }
            rules={[{ required: true, message: "Please select business type" }]}
          >
            <Select placeholder="Select Business Name">
              <Option value="Restaurant">Restaurant</Option>
              <Option value="Temple">Temple</Option>
              <Option value="Hotel">Hotel</Option>
              <Option value="Canteen">Canteen</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <span className="text-gray-600 font-semibold">
                FSSAI License Number
              </span>
            }
            className="w-1/4"
            name="fssai_license_number"
            rules={[
              {
                required: true,
                message: "Please enter FSSAI License Number",
              },
            ]}
          >
            <Input
              placeholder="Enter  your License Number"
              className="placeholder-gray-400 p-3 rounded-lg"
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
            required
          >
            <Input
              placeholder="Enter your email address"
              className="placeholder-gray-400 p-3 rounded-lg" // Set the color of the placeholder text
            />
          </Form.Item>
          <Form.Item
            className="w-1/4"
            label={
              <span className="text-gray-600 font-semibold">GST Number</span>
            }
            name="gst_number"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Enter your GST number"
              className="placeholder-gray-400 p-3 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-600 font-semibold">Address</span>}
            name="address.line1"
            className="w-1/2"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Line 1"
              className="placeholder-gray-400 p-3 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="address.line2"
            className="w-1/2"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Line 2"
              className="placeholder-gray-400 p-3 rounded-lg"
            />
          </Form.Item>
          <div className="flex justify-between w-1/2">
            <Form.Item
              name="address.city"
              rules={[{ required: true }]}
              className="w-full mr-2"
            >
              <Input
                placeholder="City"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
              />
            </Form.Item>

            <Form.Item
              name="address.state"
              rules={[{ required: true }]}
              className="w-full mr-2"
            >
              <Input
                placeholder="State"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
              />
            </Form.Item>

            <Form.Item
              name="address.pincode"
              rules={[{ required: true }]}
              className="w-full"
            >
              <Input
                placeholder="Pincode"
                className="placeholder-gray-400 p-3 rounded-lg w-full"
              />
            </Form.Item>
          </div>
        </div>

        <div className="sticky bottom-0 z-50 bg-white w-full py-4 px-6 flex justify-start shadow-top">
          <Form.Item>
            <NavLink to="/client-table">
              <Button className="border-primary  text- border-2 font-semibold">
                Cancel
              </Button>
            </NavLink>
            <Button
              type="primary"
              className="ml-6"
              htmlType="submit"
              loading={loading}
            >
              Save
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default BusinessDetail;
