import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerSegment from "./pages/CustomerSegment";
import Home from "./pages/Home";
import AddCustomer from "./pages/AddCustomer";
import CustomerList from "./pages/CustomerList";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <nav className="sidebar">
          <h2 className="sidebar-title">Xeno CRM</h2>
          <Link to="/" className="sidebar-link">
            Home
          </Link>
          <Link to="/add-customer" className="sidebar-link">
            Add Customer
          </Link>
          <Link to="/customer-list" className="sidebar-link">
            Customer List
          </Link>
          <Link to="/customer-segment" className="sidebar-link">
            Customer Segment
          </Link>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/customer-list" element={<CustomerList />} />
            <Route path="/customer-segment" element={<CustomerSegment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;