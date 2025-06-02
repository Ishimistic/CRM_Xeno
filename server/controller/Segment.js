const Segment = require('../model/SegmentSchema');
const Customer = require('../model/Customer'); // Make sure this path matches your Customer model

// Helper function to count customers matching segment conditions
const getCustomerCountForSegment = async (conditions) => {
  try {
    const count = await Customer.countDocuments({
      visits: {
        $gte: conditions.visits.min,
        $lte: conditions.visits.max
      },
      total_spent: {
        $gte: conditions.totalSpent.min,
        $lte: conditions.totalSpent.max
      }
    });
    return count;
  } catch (error) {
    console.error('Error counting customers:', error);
    return 0;
  }
};

// Get all segments with customer counts
const getAllSegments = async (req, res) => {
  try {
    const segments = await Segment.find().sort({ dateCreated: -1 });
    
    // Add customer count to each segment
    const segmentsWithCounts = await Promise.all(
      segments.map(async (segment) => {
        const customerCount = await getCustomerCountForSegment(segment.conditions);
        return {
          ...segment.toObject(),
          customerCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      message: 'Segments fetched successfully',
      data: segmentsWithCounts,
      count: segmentsWithCounts.length
    });
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch segments',
      error: error.message
    });
  }
};

// Create new segment
const createSegment = async (req, res) => {
  try {
    const { name, conditions, campaignName } = req.body;

    // Validation
    if (!name || !conditions || !campaignName) {
      return res.status(400).json({
        success: false,
        message: 'Name, conditions, and campaign name are required'
      });
    }

    if (!conditions.visits || !conditions.totalSpent) {
      return res.status(400).json({
        success: false,
        message: 'Both visits and total spent conditions are required'
      });
    }

    // Validate range values
    if (conditions.visits.min > conditions.visits.max) {
      return res.status(400).json({
        success: false,
        message: 'Visits minimum value cannot be greater than maximum value'
      });
    }

    if (conditions.totalSpent.min > conditions.totalSpent.max) {
      return res.status(400).json({
        success: false,
        message: 'Total spent minimum value cannot be greater than maximum value'
      });
    }

    // Check if segment name already exists
    const existingSegment = await Segment.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingSegment) {
      return res.status(400).json({
        success: false,
        message: 'Segment name already exists. Please choose a different name.'
      });
    }

    // Create new segment
    const newSegment = new Segment({
      name: name.trim(),
      conditions: {
        visits: {
          min: Number(conditions.visits.min),
          max: Number(conditions.visits.max)
        },
        totalSpent: {
          min: Number(conditions.totalSpent.min),
          max: Number(conditions.totalSpent.max)
        }
      },
      campaignName: campaignName.trim()
    });

    const savedSegment = await newSegment.save();

    // Get customer count for the new segment
    const customerCount = await getCustomerCountForSegment(savedSegment.conditions);

    res.status(201).json({
      success: true,
      message: 'Segment created successfully',
      data: {
        ...savedSegment.toObject(),
        customerCount
      }
    });

  } catch (error) {
    console.error('Error creating segment:', error);
    
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Segment name must be unique'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create segment',
      error: error.message
    });
  }
};

// Get segment by ID with customer count
const getSegmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const segment = await Segment.findById(id);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    // Get customer count for this segment
    const customerCount = await getCustomerCountForSegment(segment.conditions);

    res.status(200).json({
      success: true,
      message: 'Segment fetched successfully',
      data: {
        ...segment.toObject(),
        customerCount
      }
    });
  } catch (error) {
    console.error('Error fetching segment:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid segment ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch segment',
      error: error.message
    });
  }
};

// Update segment
const updateSegment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, conditions, campaignName } = req.body;

    // Check if segment exists
    const existingSegment = await Segment.findById(id);
    if (!existingSegment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    // Check if new name already exists (excluding current segment)
    if (name && name.trim() !== existingSegment.name) {
      const duplicateName = await Segment.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: 'Segment name already exists. Please choose a different name.'
        });
      }
    }

    // Update segment
    const updatedSegment = await Segment.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(conditions && { conditions }),
        ...(campaignName && { campaignName: campaignName.trim() })
      },
      { new: true, runValidators: true }
    );

    // Get customer count for the updated segment
    const customerCount = await getCustomerCountForSegment(updatedSegment.conditions);

    res.status(200).json({
      success: true,
      message: 'Segment updated successfully',
      data: {
        ...updatedSegment.toObject(),
        customerCount
      }
    });
  } catch (error) {
    console.error('Error updating segment:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid segment ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update segment',
      error: error.message
    });
  }
};

// Delete segment
const deleteSegment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSegment = await Segment.findByIdAndDelete(id);
    
    if (!deletedSegment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Segment deleted successfully',
      data: deletedSegment
    });
  } catch (error) {
    console.error('Error deleting segment:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid segment ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete segment',
      error: error.message
    });
  }
};

// Get customers matching a segment
const getSegmentCustomers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get segment
    const segment = await Segment.findById(id);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    // Find customers matching segment conditions
    const matchingCustomers = await Customer.find({
      visits: {
        $gte: segment.conditions.visits.min,
        $lte: segment.conditions.visits.max
      },
      total_spent: {
        $gte: segment.conditions.totalSpent.min,
        $lte: segment.conditions.totalSpent.max
      }
    }).sort({ last_active: -1 });

    res.status(200).json({
      success: true,
      message: 'Matching customers fetched successfully',
      segment: segment,
      customers: matchingCustomers,
      count: matchingCustomers.length
    });
  } catch (error) {
    console.error('Error fetching segment customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch segment customers',
      error: error.message
    });
  }
};

// Get segment statistics (additional endpoint for analytics)
const getSegmentStats = async (req, res) => {
  try {
    const segments = await Segment.find();
    const totalCustomers = await Customer.countDocuments();
    
    const stats = await Promise.all(
      segments.map(async (segment) => {
        const customerCount = await getCustomerCountForSegment(segment.conditions);
        const percentage = totalCustomers > 0 ? ((customerCount / totalCustomers) * 100).toFixed(2) : 0;
        
        return {
          segmentId: segment._id,
          segmentName: segment.name,
          campaignName: segment.campaignName,
          customerCount,
          percentage: parseFloat(percentage),
          conditions: segment.conditions
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Segment statistics fetched successfully',
      data: {
        totalCustomers,
        totalSegments: segments.length,
        segmentStats: stats
      }
    });
  } catch (error) {
    console.error('Error fetching segment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch segment statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllSegments,
  createSegment,
  getSegmentById,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  getSegmentStats
};