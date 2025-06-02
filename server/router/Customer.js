const express = require("express");
const router = express.Router();
const customerController = require("../controller/customerController");

// POST /api/customers/add - Add a new customer
router.post("/add", customerController.addCustomer);

// GET /api/customers/ - Get all customers
router.get("/", customerController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get("/:id", customerController.getCustomerById);

// PUT /api/customers/:id - Update customer by ID
router.put("/:id", customerController.updateCustomer);

// DELETE /api/customers/:id - Delete customer by ID
router.delete("/:id", customerController.deleteCustomer);

router.post("/add-bulk", customerController.addMultipleCustomers);


module.exports = router;
