import React, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import "../styles/AddCustomer.css";

const path =  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AddCustomer = ({ onCustomerAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    total_spent: "",
    visits: "",
    last_active: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "total_spent" || name === "visits" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(
        `${path}/api/customers/add`,
        formData
      );

      setSuccess(res.data.message || "Customer added successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        total_spent: "",
        visits: "",
        last_active: new Date().toISOString().slice(0, 10),
      });

      if (onCustomerAdded) onCustomerAdded(res.data.customer);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to add customer"
      );
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    setCsvSuccess(null);
    setError(null);

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const customers = results.data.map((c) => ({
              name: c.name,
              email: c.email,
              phone: c.phone,
              total_spent: Number(c.total_spent),
              visits: Number(c.visits),
              last_active:
                c.last_active || new Date().toISOString().slice(0, 10),
            }));

            const res = await axios.post(
              `${path}/api/customers/add-bulk`,
              { customers }
            );
            setCsvSuccess(res.data.message || "Customers added successfully!");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Failed to upload CSV"
            );
          }
        },
      });
    }
  };

  return (
    <div className="add-customer-container">
      <h2 className="add-customer-title">Add Customers</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {csvSuccess && <p className="csv-success-message">{csvSuccess}</p>}

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="customer-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="text"
          name="total_spent"
          placeholder="Total Spent"
          value={formData.total_spent}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setFormData({ ...formData, total_spent: value });
            }
          }}
          inputMode="numeric"
          className="form-input"
        />

        <input
          type="text"
          name="visits"
          placeholder="Visits"
          value={formData.visits}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setFormData({ ...formData, visits: value });
            }
          }}
          inputMode="numeric"
          className="form-input"
        />

        <label className="form-label">
          Last Active:
          <input
            type="date"
            name="last_active"
            value={formData.last_active}
            onChange={handleChange}
            className="form-input"
          />
        </label>
        <button type="submit" className="submit-button">
          Add Customer
        </button>
      </form>

      <hr className="divider" />

      {/* Bulk Upload CSV
      <div className="csv-upload-section">
        <label className="upload-label">Upload CSV (bulk add customers):</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="file-input"
        />
        <p className="csv-info">
          CSV columns:{" "}
          <code>name,email,phone,total_spent,visits,last_active</code>
        </p>
      </div> */}
    </div>
  );
};

export default AddCustomer;
