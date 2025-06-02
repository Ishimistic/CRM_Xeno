const express = require('express');
const router = express.Router();
const segmentController = require('../controller/Segment.js'); // Use the updated controller

// GET all segments with customer counts
router.get('/segments', segmentController.getAllSegments);

// POST create new segment
router.post('/segments', segmentController.createSegment);

// GET segment by ID with customer count
router.get('/segments/:id', segmentController.getSegmentById);

// PUT update segment by ID
router.put('/segments/:id', segmentController.updateSegment);

// DELETE segment by ID
router.delete('/segments/:id', segmentController.deleteSegment);

// GET customers matching a specific segment
router.get('/segments/:id/customers', segmentController.getSegmentCustomers);

// GET segment statistics (analytics)
router.get('/segments-stats', segmentController.getSegmentStats);

module.exports = router;