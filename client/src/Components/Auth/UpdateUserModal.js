import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Select, Typography, Form, message } from "antd";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const UpdateUserModal = ({ visible, onCancel, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchUserDetails();
    }
  }, [visible, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/auth/getUserById/${userId}`);
      if (response.status === 200) { // Check for HTTP status code 200
        form.setFieldsValue({
          userName: response.data.userName,
          userId: response.data.userId,
          role: response.data.role,
        });
      } else {
        message.error("Failed to fetch user details.");
      }
    } catch (error) {
      message.error("Some error occurred while fetching user details.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/auth/updateUser/${userId}`, {
        userName: values.userName,
        userId: values.userId,
        password: values.password,
        role: values.role,
      });

      if (response.data.success) {
        message.success("User updated successfully!");
        onCancel(); // Close the modal
      } else {
        message.error("Failed to update user.");
      }
    } catch (error) {
      message.error("Some error occurred while updating the user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update User Details"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      className="w-full max-w-sm mx-auto"
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        form={form}
      >
        <Form.Item
          label="User Name"
          name="userName"
          rules={[{ required: true, message: "Please input the user name!" }]}
        >
          <Input placeholder="User Name" />
        </Form.Item>
        <Form.Item
          label="User ID"
          name="userId"
          rules={[{ required: true, message: "Please input the user ID!" }]}
        >
          <Input placeholder="User ID" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
        
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select placeholder="Select Role">
            <Option value="SUPER_ADMIN">Super Admin</Option>
            <Option value="ACCOUNT_ADMIN">Account Admin</Option>
            <Option value="AUDIT_ADMIN">Audit Admin</Option>
            <Option value="AUDITOR">Auditor</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
            Update User
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateUserModal;
