import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/CustomerList.css";

const path = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${path}/api/customers`);
      console.log("Response data:", res.data);
      setCustomers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Delete customer by ID
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await axios.delete(`${path}/api/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalCustomers = customers.length;
  const totalSpent = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  const totalVisits = customers.reduce((sum, customer) => sum + (customer.visits || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  if (error) {
    return (
      <div className="customer-list-page">
        <div className="customer-list-container">
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-list-page">
      <div className="customer-list-container">
        {/* Header Section */}
        <div className="customer-list-header">
          <h1 className="customer-list-title">Customer Management</h1>
          <p className="customer-list-subtitle">
            Manage and track your customer relationships
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-value">{totalCustomers}</span>
            <span className="stat-label">Total Customers</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">Rs.{totalSpent.toFixed(2)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalVisits}</span>
            <span className="stat-label">Total Visits</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">${avgSpent.toFixed(2)}</span>
            <span className="stat-label">Avg per Customer</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-container">
          {/* Search Bar */}
          <div className="search-filter-bar">
            <div className="search-container">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search customers..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Results Summary */}
          {searchTerm && (
            <div className="results-summary">
              Showing {filteredCustomers.length} of {totalCustomers} customers
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="empty-title">
                {searchTerm ? "No customers found" : "No customers yet"}
              </h3>
              <p className="empty-text">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Start by adding your first customer"
                }
              </p>
              {!searchTerm && (
                <a href="/add-customer" className="add-customer-link">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Customer
                </a>
              )}
            </div>
          ) : (
            /* Table */
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Total Spent</th>
                    <th>Visits</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="fade-in">
                      <td data-label="Name">
                        <div className="customer-name">{customer.name}</div>
                      </td>
                      <td data-label="Email">
                        <div className="customer-email">{customer.email}</div>
                      </td>
                      <td data-label="Phone">
                        <div className="customer-phone">{customer.phone || "-"}</div>
                      </td>
                      <td data-label="Total Spent">
                        <div className="customer-spent">Rs.{(customer.total_spent || 0).toFixed(2)}</div>
                      </td>
                      <td data-label="Visits">
                        <span className="customer-visits">{customer.visits || 0}</span>
                      </td>
                      <td data-label="Last Active">
                        <div className="customer-date">
                          {customer.last_active 
                            ? new Date(customer.last_active).toLocaleDateString()
                            : "Never"
                          }
                        </div>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => deleteCustomer(customer._id)}
                            className="delete-button"
                          >
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;