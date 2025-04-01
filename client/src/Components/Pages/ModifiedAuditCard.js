import React, { useState, useEffect, useCallback } from "react";
import { Input, Select, Spin } from "antd";
import { SearchOutlined, FileOutlined } from "@ant-design/icons";
import AdminDashboard from "../Layout/AdminDashboard";
import axios from "axios";
import AuditCard from "../Layout/AuditCard";
import { useAuth } from "../Context/AuthContext";

const AuditDetails = () => {
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [audits, setAudits] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [selectedAuditor, setSelectedAuditor] = useState("none");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [intialLoading, setIntialLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Scroll to the top of the page whenever this component is rendered
    window.scrollTo(0, 0);
  }, []);

  // Fetch audit data
  const fetchAudits = useCallback(
    (filters = {}, page = 1, perPage = 9) => {
      setLoading(true); // Set loading to true when fetching more data

      const isAdmin =
        user.role === "SUPER_ADMIN" || user.role === "AUDIT_ADMIN";

      const queryParams = new URLSearchParams({
        status: "modified",
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.userId &&
          filters.userId !== "none" && { userId: filters.userId }),
        ...(isAdmin ? {} : { userId: user._id }), // If not admin, filter by user ID
        page,
        perPage,
      }).toString();

      const url = `/api/auditor/getAllAudits?${queryParams}`;

      axios
        .get(url)
        .then((response) => {
          // Ensure the structure of the response is correct
          if (response && response.data && response.data.success) {
            if (page === 1) {
              setAudits(response.data.data); // Set the audits data for the first page
            } else {
              setAudits((prev) => [...prev, ...response.data.data]); // Append the new data for pagination
            }

            // Determine if more pages exist and update `hasMore`
            setHasMore(
              response.data.pagination.page <
                response.data.pagination.totalPages
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching audits:", error); // Log the error if the API call fails
        })
        .finally(() => {
          setLoading(false); // Set loading to false once data fetching is complete
        });
    },
    [user.role, user._id]
  );

  // Fetch auditors
  const fetchAuditors = useCallback(() => {
    axios
      .get("/api/auditor/getAuditAdmins")
      .then((response) => {
        if (response.data.success) {
          setAuditors(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching auditors:", error))
      .finally(() => {
        setIntialLoading(false); // Reset the loading state here
      });
  }, []);

  useEffect(() => {
    fetchAudits();
    fetchAuditors();
  }, [fetchAudits, fetchAuditors]);

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setSelectedAuditor("none");
    fetchAudits({ searchQuery: value }, 1);
    setPage(1);
    setHasMore(true);
  };

  // Handle auditor selection change
  const handleAuditorChange = (value) => {
    setSelectedAuditor(value);
    const userId = value === "none" ? null : value;
    fetchAudits({ userId }, 1);
    setPage(1);
    setHasMore(true);
  };

  // Handle scroll event
  const handleScroll = (e) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target;

    // Check if we're at the bottom of the scroll container and if there's more data
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1); // Increment page to trigger loading next data
    }
  };

  // Fetch next page when `page` changes
  useEffect(() => {
    if (page > 1) {
      fetchAudits(
        { searchQuery: searchKeyword, userId: selectedAuditor },
        page
      );
    }
  }, [page, searchKeyword, selectedAuditor, fetchAudits]);

  // After fetching audits, set loading back to false
  useEffect(() => {
    if (!loading) {
      setLoading(false);
    }
  }, [audits]);

  return (
    <AdminDashboard>
      <div className="bg-blue-50 m-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Modified Audits</h2>
        </div>

        <Spin spinning={intialLoading}>
          <div className="flex justify-end my-4">
            <div className="flex items-center space-x-4">
              {(user.role === "SUPER_ADMIN" || user.role === "AUDIT_ADMIN") && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">Filters</h2>
                  </div>
                  <div className="ml-5">
                    <Select
                      showSearch
                      placeholder="Select an Auditor"
                      optionFilterProp="label"
                      options={[
                        { value: "none", label: "None" },
                        ...auditors.map((auditor) => ({
                          value: auditor._id,
                          label: auditor.userName,
                        })),
                      ]}
                      value={selectedAuditor}
                      onChange={handleAuditorChange}
                      style={{ width: 200 }}
                    />
                  </div>
                </>
              )}
              <Input
                size="default"
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={handleInputChange}
                style={{ width: 300 }}
              />
            </div>
          </div>

          {audits.length === 0 ? (
            <div className="flex flex-col justify-center items-center text-center text-xl font-semibold text-gray-500 h-screen">
              <FileOutlined style={{ fontSize: 40, marginBottom: 8 }} />
              <div>No data available</div>
            </div>
          ) : (
            <div>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
                style={{
                  minHeight: "400px",
                  maxHeight: "calc(100vh - 200px)", // Adjust this based on your layout
                  overflowY: "auto", // Ensure the container is scrollable
                }}
                onScroll={handleScroll}
              >
                {audits.map((audit) => (
                  <div key={audit._id}>
                    <AuditCard
                      status={audit.status}
                      auditorName={audit.userName}
                      fboName={audit.fbo_name}
                      outletName={audit.outlet_name}
                      location={audit.location}
                      date={new Date(audit.assigned_date).toLocaleDateString("en-GB")}
                      proposalNumber={audit.proposal_number}
                      auditNumber={audit.audit_number}
                      id={audit._id}
                      customer_type={audit.customer_type}
                      route="modified"
                      service={audit.service}
                    />
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-center items-center py-4 col-span-4">
                    <Spin size="medium" />
                  </div>
                )}
              </div>
            </div>
          )}
        </Spin>
      </div>
    </AdminDashboard>
  );
};

export default AuditDetails;
