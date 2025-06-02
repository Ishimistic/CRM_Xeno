import { Link } from "react-router-dom";
import "../styles/Home.css"; 
//import { Sparkles } from "lucide-react"; // Optional: lucide-react icon set

const Home = () => (
  <div className="home-container">
    <div className="home-header">
      <h1 className="home-title">
        {/* <Sparkles className="text-purple-600" /> */}
        Welcome to Xeno CRM
      </h1>
      <p className="home-description">
        Streamline your customer management with ease and efficiency.
      </p>
    </div>

    <div className="home-buttons">
      <Link to="/add-customer">
        Add Customer
      </Link>
      <Link to="/customer-list">
        View Customers
      </Link>
      <Link to="/customer-segment" >
        View Customers
      </Link>
    </div>

    {/* <img
      src="https://illustrations.popsy.co/gray/crm-management.svg"
      alt="CRM Illustration"
      className="mt-12 max-w-md w-full rounded-lg shadow-lg animate-fade-in"
    /> */}
  </div>
);

export default Home;