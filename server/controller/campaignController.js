const db = require('../utils/db');
const { sendCampaignMessage } = require('../services/vendorAPI');

exports.createCampaign = async (req, res) => {
  const { audience, message } = req.body;
  audience.forEach(user => {
    const status = sendCampaignMessage(user, message);
    db.query('INSERT INTO communication_log SET ?', {
      user_id: user.id,
      message,
      status,
    });
  });
  res.status(201).json({ message: 'Campaign triggered' });
};

exports.getCampaigns = (req, res) => {
  db.query('SELECT * FROM communication_log ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
};
