import React, { useState, useEffect } from 'react';
import { Plus, Save, Users, Calendar, Filter, X, Search } from 'lucide-react';
import "./CustomerSegment.css"; 

const CustomerSegmentPage = () => {
  const [segments, setSegments] = useState([]);
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campaignName: '',
    conditions: {
      visits: { min: '', max: '' },
      totalSpent: { min: '', max: '' }
    }
  });
  const [errors, setErrors] = useState({});

  // Filter state
  const [filters, setFilters] = useState({
    campaignName: '',
    dateFrom: '',
    dateTo: ''
  });

  // API Base URL - adjust according to your backend
  const API_BASE =   import.meta.env.VITE_API_URL  || 'http://localhost:5000';


  // Fetch all segments
  const fetchSegments = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/segments`);
      const data = await response.json();
      
      if (data.success) {
        setSegments(data.data);
        setFilteredSegments(data.data);
      } else {
        console.error('Failed to fetch segments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...segments];

    // Filter by campaign name
    if (filters.campaignName.trim()) {
      filtered = filtered.filter(segment =>
        segment.campaignName.toLowerCase().includes(filters.campaignName.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(segment => {
        const segmentDate = new Date(segment.dateCreated);
        return segmentDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(segment => {
        const segmentDate = new Date(segment.dateCreated);
        return segmentDate <= toDate;
      });
    }

    setFilteredSegments(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      campaignName: '',
      dateFrom: '',
      dateTo: ''
    });
    setFilteredSegments(segments);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Get unique campaign names for filter dropdown
  const getUniqueCampaigns = () => {
    const campaigns = segments.map(segment => segment.campaignName);
    return [...new Set(campaigns)].sort();
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.campaignName || filters.dateFrom || filters.dateTo;
  };

  // Create new segment
  const createSegment = async () => {
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/api/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          campaignName: formData.campaignName,
          conditions: {
            visits: {
              min: parseInt(formData.conditions.visits.min),
              max: parseInt(formData.conditions.visits.max)
            },
            totalSpent: {
              min: parseFloat(formData.conditions.totalSpent.min),
              max: parseFloat(formData.conditions.totalSpent.max)
            }
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and refresh segments
        setFormData({
          name: '',
          campaignName: '',
          conditions: {
            visits: { min: '', max: '' },
            totalSpent: { min: '', max: '' }
          }
        });
        setShowForm(false);
        fetchSegments();
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      setErrors({ general: 'Failed to create segment. Please try again.' });
      console.error('Error creating segment:', error);
    } finally {
      setSaving(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Segment name is required';
    if (!formData.campaignName.trim()) newErrors.campaignName = 'Campaign name is required';
    
    if (!formData.conditions.visits.min) newErrors.visitsMin = 'Min visits is required';
    if (!formData.conditions.visits.max) newErrors.visitsMax = 'Max visits is required';
    if (!formData.conditions.totalSpent.min) newErrors.spentMin = 'Min spent is required';
    if (!formData.conditions.totalSpent.max) newErrors.spentMax = 'Max spent is required';

    if (formData.conditions.visits.min && formData.conditions.visits.max) {
      if (parseInt(formData.conditions.visits.min) > parseInt(formData.conditions.visits.max)) {
        newErrors.visits = 'Min visits cannot be greater than max visits';
      }
    }

    if (formData.conditions.totalSpent.min && formData.conditions.totalSpent.max) {
      if (parseFloat(formData.conditions.totalSpent.min) > parseFloat(formData.conditions.totalSpent.max)) {
        newErrors.totalSpent = 'Min spent cannot be greater than max spent';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      createSegment();
    }
  };

  // Handle input changes
  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [nested]: {
            ...prev.conditions[nested],
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format customer count with proper styling
  const formatCustomerCount = (count) => {
    if (count === 0) return '0';
    if (count === 1) return '1';
    return count.toLocaleString();
  };

  // Load segments on component mount
  useEffect(() => {
    fetchSegments();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [filters, segments]);

  // Check if form is valid for save button
  const isFormValid = formData.name.trim() && 
                     formData.campaignName.trim() && 
                     formData.conditions.visits.min && 
                     formData.conditions.visits.max && 
                     formData.conditions.totalSpent.min && 
                     formData.conditions.totalSpent.max;

  return (
    <div className="customer-segment-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="main-title">Customer Segments</h1>
          <p className="subtitle">Create and manage customer segments for targeted campaigns</p>
        </div>

        {/* Create New Segment Button */}
        <div className="create-button-container">
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-button"
          >
            <Plus className="icon" />
            <span>Create New Segment</span>
          </button>
        </div>

        {/* Create Segment Form */}
        {showForm && (
          <div className="form-container">
            <h2 className="form-title">Create New Segment</h2>
            
            {errors.general && (
              <div className="error-alert">
                {errors.general}
              </div>
            )}

            <div className="form-content">
              {/* Basic Information */}
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter unique segment name"
                  />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) => handleInputChange('campaignName', e.target.value)}
                    className={`form-input ${errors.campaignName ? 'error' : ''}`}
                    placeholder="Enter campaign name"
                  />
                  {errors.campaignName && <p className="field-error">{errors.campaignName}</p>}
                </div>
              </div>

              {/* Conditions */}
              <div className="conditions-section">
                <h3 className="conditions-title">Segment Conditions</h3>
                
                {/* Visits Condition */}
                <div className="condition-block visits">
                  <h4 className="condition-title">Visits in Last Month</h4>
                  <div className="condition-grid">
                    <div className="form-field">
                      <label className="form-label">
                        Minimum Visits *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.conditions.visits.min}
                        onChange={(e) => handleInputChange('min', e.target.value, 'visits')}
                        className={`form-input ${errors.visitsMin || errors.visits ? 'error' : ''}`}
                        placeholder="0"
                      />
                      {errors.visitsMin && <p className="field-error">{errors.visitsMin}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        Maximum Visits *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.conditions.visits.max}
                        onChange={(e) => handleInputChange('max', e.target.value, 'visits')}
                        className={`form-input ${errors.visitsMax || errors.visits ? 'error' : ''}`}
                        placeholder="100"
                      />
                      {errors.visitsMax && <p className="field-error">{errors.visitsMax}</p>}
                    </div>
                  </div>
                  {errors.visits && <p className="field-error">{errors.visits}</p>}
                </div>

                {/* Total Spent Condition */}
                <div className="condition-block spending">
                  <h4 className="condition-title">Total Amount Spent</h4>
                  <div className="condition-grid">
                    <div className="form-field">
                      <label className="form-label">
                        Minimum Spent (Rs.) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.conditions.totalSpent.min}
                        onChange={(e) => handleInputChange('min', e.target.value, 'totalSpent')}
                        className={`form-input ${errors.spentMin || errors.totalSpent ? 'error' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.spentMin && <p className="field-error">{errors.spentMin}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        Maximum Spent (Rs.) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.conditions.totalSpent.max}
                        onChange={(e) => handleInputChange('max', e.target.value, 'totalSpent')}
                        className={`form-input ${errors.spentMax || errors.totalSpent ? 'error' : ''}`}
                        placeholder="1000.00"
                      />
                      {errors.spentMax && <p className="field-error">{errors.spentMax}</p>}
                    </div>
                  </div>
                  {errors.totalSpent && <p className="field-error">{errors.totalSpent}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      name: '',
                      campaignName: '',
                      conditions: {
                        visits: { min: '', max: '' },
                        totalSpent: { min: '', max: '' }
                      }
                    });
                    setErrors({});
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || saving}
                  className={`save-button ${(!isFormValid || saving) ? 'disabled' : ''}`}
                >
                  <Save className="icon" />
                  <span>{saving ? 'Saving...' : 'Save Segment'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Segments Table */}
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">Existing Segments</h2>
            <div className="table-controls">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle-button ${hasActiveFilters() ? 'active' : ''}`}
              >
                <Filter className="icon" />
                <span>Filters</span>
                {hasActiveFilters() && <span className="filter-badge">{
                  [filters.campaignName, filters.dateFrom, filters.dateTo].filter(Boolean).length
                }</span>}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel">
              <div className="filter-content">
                <div className="filter-grid">
                  {/* Campaign Name Filter */}
                  <div className="filter-field">
                    <label className="filter-label">Campaign Name</label>
                    <div className="filter-input-wrapper">
                      <Search className="filter-input-icon" />
                      <input
                        type="text"
                        value={filters.campaignName}
                        onChange={(e) => handleFilterChange('campaignName', e.target.value)}
                        className="filter-input"
                        placeholder="Search by campaign name..."
                      />
                    </div>
                  </div>

                  {/* Date From Filter */}
                  <div className="filter-field">
                    <label className="filter-label">Created From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="filter-input"
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="filter-field">
                    <label className="filter-label">Created To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="filter-actions">
                  <button
                    onClick={clearFilters}
                    className="clear-filters-button"
                    disabled={!hasActiveFilters()}
                  >
                    <X className="icon" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {hasActiveFilters() && (
            <div className="results-summary">
              <p>
                Showing {filteredSegments.length} of {segments.length} segments
                {hasActiveFilters() && ' (filtered)'}
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Loading segments...</p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <p className="empty-text">
                {hasActiveFilters() 
                  ? "No segments match your current filters. Try adjusting your search criteria."
                  : "No segments created yet. Create your first segment above!"
                }
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="segments-table">
                <thead>
                  <tr>
                    <th>Segment Name</th>
                    <th>Campaign</th>
                    <th>Visits Range</th>
                    <th>Spending Range</th>
                    <th>Number of Customers</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSegments.map((segment, index) => (
                    <tr key={segment._id} className={index % 2 === 0 ? 'even' : 'odd'}>
                      <td>
                        <div className="segment-name">{segment.name}</div>
                      </td>
                      <td>
                        <div className="campaign-name">{segment.campaignName}</div>
                      </td>
                      <td>
                        <div className="range-text">
                          {segment.conditions.visits.min} - {segment.conditions.visits.max} visits
                        </div>
                      </td>
                      <td>
                        <div className="range-text">
                          Rs.{segment.conditions.totalSpent.min} - Rs.{segment.conditions.totalSpent.max}
                        </div>
                      </td>
                      <td>
                        <div className="customer-count">
                          <span className="customer-count-number">
                            {formatCustomerCount(segment.customerCount || 0)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar className="date-icon" />
                          {formatDate(segment.dateCreated)}
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

export default CustomerSegmentPage;