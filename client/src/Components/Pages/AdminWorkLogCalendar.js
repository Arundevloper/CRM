import React, { useState, useEffect } from "react";
import { Calendar, Card, Typography, Button, Badge, DatePicker, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import AdminDashboard from "../Layout/AdminDashboard";
import dayjs from "dayjs";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminWorkLogCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [workLogDates, setWorkLogDates] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkLogs = async () => {
      try {
        const response = await axios.get(`/api/worklogs/getAllWorkLogs`);
        const logDates = response.data?.map((log) => dayjs(log.date).format("YYYY-MM-DD")) || [];
        setWorkLogDates(logDates);
      } catch (error) {
        console.error("Error fetching work logs:", error);
      }
    };
    fetchWorkLogs();
  }, []);

  // Navigate to selected single date
  const handleDateSelect = (value) => {
    if (value && value.isValid()) {
      const fromDate = value.format("YYYY-MM-DD");
      navigate(`/admin-work-log/${fromDate}`);
    }
  };

  // Navigate with fromDate and toDate when filtering by range
  const handleDateFilter = () => {
    if (dateRange?.[0] && dateRange?.[1]) {
      const fromDate = dateRange[0].format("YYYY-MM-DD");
      const toDate = dateRange[1].format("YYYY-MM-DD");
      navigate(`/admin-work-log/${fromDate}/${toDate}`);
    }
  };

  // Custom cell rendering with badges
  const dateFullCellRender = (value) => {
    const isLogged = workLogDates.includes(value.format("YYYY-MM-DD"));
    return (
      <div className="relative flex justify-center items-center">
        <span>{value.date()}</span>
        {isLogged && (
          <Badge color="blue" className="absolute bottom-1 left-1/2 transform -translate-x-1/2" />
        )}
      </div>
    );
  };

  return (
    <AdminDashboard>
      <div className="top-0 z-50 bg-white border-b shadow-sm">
        <div className="mb-6 px-6 py-4 flex items-center justify-between">
          <Title level={3} className="flex items-center">
            <CalendarOutlined className="mr-2 text-blue-500" /> Auditor Work Log Calendar
          </Title>
          <Button type="primary" onClick={() => setSelectedDate(dayjs())}>Today</Button>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 py-6">
        <Card className="p-6 shadow-lg w-[85%] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">Calendar</Title>
            <Space>
              <RangePicker onChange={(values) => setDateRange(values || [])} />
              <Button type="primary" onClick={handleDateFilter} disabled={dateRange.length !== 2}>
                Filter
              </Button>
            </Space>
          </div>
          <Calendar
            fullscreen
            value={selectedDate}
            onSelect={handleDateSelect}
            
          />
        </Card>
      </div>
    </AdminDashboard>
  );
};

export default AdminWorkLogCalendar;
