import React, { useEffect, useState } from "react";
import { Modal, Table, Typography, Button, message } from "antd";
import axios from "axios";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const LeaveManagementModal = ({ visible, onClose, userId, workLogId }) => {
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  // Fetch leave data when modal is opened
  useEffect(() => {
    if (visible && userId) {
      fetchLeaveData();
    }
  }, [visible, userId]);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/worklogs/calculateLeaveData/${userId}`);
      setLeaveData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch leave data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!workLogId) {
      message.error("Invalid Work Log ID.");
      return;
    }

    confirm({
      title: "Approve Leave Request?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to approve this leave request?",
      okText: "Approve",
      cancelText: "Cancel",
      onOk: async () => {
        setApproving(true);
        try {
          await axios.put(`/api/worklogs/approveLeaveRequest/${workLogId}`);
          message.success("Leave approved successfully.");
          fetchLeaveData(); // Optional: refresh balance
          onClose(); // Optionally close modal after approval
        } catch (error) {
          console.error("Approval error:", error);
          message.error(
            error.response?.data?.message || "Failed to approve leave."
          );
        } finally {
          setApproving(false);
        }
      },
    });
  };

  const nonLOPColumns = [
    { title: "Leave Type", dataIndex: "type", key: "type" },
    { title: "This Month(Taken)", dataIndex: "thisMonth", key: "thisMonth" },
    { title: "Overall(Available)", dataIndex: "overall", key: "overall" },
  ];

  const totalLeavesColumns =
  [
    { title: "Leave Type", dataIndex: "type", key: "type" },
    { title: "This Month(Taken)", dataIndex: "thisMonth", key: "thisMonth" },
    { title: "Overall(Taken)", dataIndex: "overall", key: "overall" },
  ];
  const nonLOPData = [
    {
      key: "1",
      type: "Sick",
      thisMonth: leaveData?.nonLOPLeavesAvailable?.sick?.thisMonth ?? 0,
      overall: leaveData?.nonLOPLeavesAvailable?.sick?.overall ?? 0,
    },
    {
      key: "2",
      type: "Casual",
      thisMonth: leaveData?.nonLOPLeavesAvailable?.casual?.thisMonth ?? 0,
      overall: leaveData?.nonLOPLeavesAvailable?.casual?.overall ?? 0,
    },
  ];
  
  const totalLeavesData = [
    {
      key: "1",
      type: "LOP",
      thisMonth: leaveData?.totalLeavesTaken?.lop?.thisMonth ?? 0,
      overall: leaveData?.totalLeavesTaken?.lop?.overall ?? 0,
    },
    {
      key: "2",
      type: "Sick",
      thisMonth: leaveData?.totalLeavesTaken?.sick?.thisMonth ?? 0,
      overall: leaveData?.totalLeavesTaken?.sick?.overall ?? 0,
    },
    {
      key: "3",
      type: "Casual",
      thisMonth: leaveData?.totalLeavesTaken?.casual?.thisMonth ?? 0,
      overall: leaveData?.totalLeavesTaken?.casual?.overall ?? 0,
    },
  ];
  
  return (
    <Modal
      title="Leave Management"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} disabled={approving}>
          Close
        </Button>,
        <Button
          key="approve"
          type="primary"
          loading={approving}
          onClick={handleApprove}
          disabled={!workLogId}
        >
          Approve
        </Button>,
      ]}
      width={700}
      centered
      destroyOnClose
    >
      <Typography.Title level={5}>Non-LOP Leaves Available</Typography.Title>
      <Table
        bordered
        size="small"
        loading={loading}
        pagination={false}
        columns={nonLOPColumns}
        dataSource={nonLOPData}
        rowKey="key"
      />

      <Typography.Title level={5} style={{ marginTop: 20 }}>
        Total Leaves Taken
      </Typography.Title>
      <Table
        bordered
        size="small"
        loading={loading}
        pagination={false}
        columns={totalLeavesColumns}
        dataSource={totalLeavesData}
        rowKey="key"
      />
    </Modal>
  );
};

export default LeaveManagementModal;
