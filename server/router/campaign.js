const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns } = require('../controllers/campaignController');

router.post('/campaigns', createCampaign);
router.get('/campaigns', getCampaigns);

module.exports = router;
