const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  total_spent: Number,
  visits: Number,
  last_active: Date,
});

module.exports = mongoose.model("Customer", customerSchema);
