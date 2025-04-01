import React, { useState, useEffect } from "react";
import { Calendar, Card, Typography, Button, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined } from "@ant-design/icons";
import AdminDashboard from "../Layout/AdminDashboard";
import dayjs from "dayjs";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const { Title } = Typography;

const WorkLogCalendarAuditor = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [workLogDates, setWorkLogDates] = useState([]);
  const { user } = useAuth(); 

  const handleDateSelect = (value) => {
    if (value && value.isValid()) {
      const formattedDate = value.format("DD-MM-YYYY");
      setSelectedDate(value); // Ensure state updates before navigation
      navigate(`/work-log/${formattedDate}`);
    }
  };

  const handlePanelChange = (value) => {
    setSelectedDate(value);
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  // Fetch work log dates from backend
  useEffect(() => {
    const fetchWorkLogs = async () => {
      if (!user?._id) return; // Prevent fetching if user ID is undefined
      try {
        const response = await axios.get(
          `/api/worklogs/fetchWorkLogDates/${user._id}`
        );
        const logDates = Array.isArray(response.data)
          ? response.data.map((log) => dayjs(log.date).format("YYYY-MM-DD"))
          : [];
        setWorkLogDates(logDates);
      } catch (error) {
        console.error("Error fetching work logs:", error);
      }
    };

    fetchWorkLogs();
  }, [user?._id]); // Dependency updated to re-run when user ID changes

  const dateFullCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const hasWorkLog = workLogDates.includes(dateStr);

    return (
      <div className="relative">
        <div>{value.date()}</div>
        {hasWorkLog && (
          <Badge
            color="blue"
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
          />
        )}
      </div>
    );
  };

  return (
    <AdminDashboard>
      {/* Page Header */}
      <div className="top-0 z-50 bg-white">
        <div className="mb-10 border shadow-bottom px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            Auditor Work Log Calendar
          </h2>
          <Button type="primary" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex justify-center py-4">
        <Card className="p-8 shadow-lg w-[80%] rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CalendarOutlined className="mr-2 text-lg text-blue-500" />
            Calendar
          </h3>
          <Calendar
            fullscreen
            value={selectedDate}
            onSelect={handleDateSelect}
            onPanelChange={handlePanelChange}
            className="mt-4 border rounded-lg shadow-sm"
            // dateFullCellRender={dateFullCellRender}
          />
        </Card>
      </div>
    </AdminDashboard>
  );
};

export default WorkLogCalendarAuditor;
