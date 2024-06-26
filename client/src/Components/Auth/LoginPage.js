import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Select,
  Typography,
  Form,
  message,
  Checkbox,
} from "antd";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import "../css/login.css";

const { Title } = Typography;
const { Option } = Select;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState("");

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("/auth/login", {
        userId: values.userID,
        password: values.password,
        businessType: values.businessType,
      });

      if (response.data.success) {
        message.success("Login Successful!");
        login(response.data.token);
        navigate("/dashboard");
      } else {
        message.error("incorrect email or password.");
      }
    } catch (error) {
      message.error("some error occured.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full ml-5 flex max-w-sm py-3">
        <img src="logo.png" alt="Company Logo" className="h-12 w-12" />

        <label className="text-400 ml-3 text-2xl font-semibold">
          Unavar Admin Dashboard
        </label>
      </div>
      <div className="w-full max-w-sm p-6 bg-white rounded-md shadow-md">
        <Title level={3} className="text-gray-600 font-semibold">
          Sign in to your account
        </Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Business Type"
            name="businessType"
            className="text-gray-400 font-semibold"
            rules={[
              {
                required: true,
                message: "Please select your business type!",
              },
            ]}
          >
            <Select
              value={businessType}
              className="boldGrey"
              onChange={(value) => setBusinessType(value)}
              placeholder="Select Business Type"
            >
              <Option className="boldGrey" value="Super Admin">
                Super Admin
              </Option>
              <Option className="boldGrey" value="Account Admin">
                Account Admin
              </Option>
              <Option className="boldGrey" value="Audit Admin">
                Audit Admin
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<span className=" font-semibold">User ID</span>}
            name="userID"
            rules={[{ required: true, message: "Please input your user id!" }]}
          >
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="flex justify-around items-center font-semibold">
                Password
              </span>
            }
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <NavLink
              to="/forgot-password"
              className="text-sm text-blue-600 ml-2 login-form-forgot"
            >
              Forgot password
            </NavLink>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-BlueGlobal"
            >
              Continue
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
