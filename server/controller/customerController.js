const Customer = require("../model/Customer.js");

// Add a new customer
exports.addCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      total_spent = 0,
      visits = 0,
      last_active = new Date(),
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res
        .status(409)
        .json({ message: "Customer with this email already exists" });
    }

    const newCustomer = new Customer({
      name,
      email,
      phone,
      total_spent,
      visits,
      last_active,
    });

    await newCustomer.save();

    res
      .status(201)
      .json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ last_active: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const updates = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!updatedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res
      .status(200)
      .json({ message: "Customer updated", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addMultipleCustomers = async (req, res) => {
  try {
    const customers = req.body.customers;
    if (!Array.isArray(customers)) {
      return res.status(400).json({ message: "Invalid customers format" });
    }

    const savedCustomers = await Customer.insertMany(customers);
    res.status(201).json({
      message: `${savedCustomers.length} customers added successfully`,
      customers: savedCustomers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding multiple customers" });
  }
};
