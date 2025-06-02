import React, { useState } from 'react';
import axios from 'axios';
import './CampaignForm.css';

const CampaignForm = () => {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState([
    { id: 1, name: "Aman" },
    { id: 2, name: "Simran" }
  ]);

  const handleSubmit = async () => {
    await axios.post('/api/campaigns', { message, audience });
    alert('Campaign Sent');
  };

  return (
    <div className="form-container">
      <h2>Create Campaign</h2>
      <textarea 
        className="message-box"
        placeholder="Enter your campaign message here..."
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
      />
      <button className="send-btn" onClick={handleSubmit}>Send</button>
    </div>
  );
};

export default CampaignForm;
