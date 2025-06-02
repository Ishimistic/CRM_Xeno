# 🧠 Customer Relationship Management (CRM) Tool

A full-featured CRM web application built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js). This tool enables users to manage customer data, segment customers, and track campaign performance with ease.

---

## 🚀 Features

- ✅ **Add New Customers**: Input and store customer details including name, email, phone number, total spend, and more.
- 📋 **Customer List Page**: View, edit, and delete customer records with a clean and responsive UI.
- 📊 **Customer Segmentation**: Create custom segments based on customer metrics like total spend, last activity, etc.
- 🎯 **Campaign Tracking**: View campaign performance details and analyze which segments engage most.
- 🔍 **Search & Filter**: Quickly search or filter customers and segments.

---

## 🛠 Tech Stack

**Frontend:**
- React.js
- CSS 
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB 
---


---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Ishimistic/CRM_Xeno.git
cd your-repo-name
```
### 2. Backend Setup
```bash
cd server
npm install
# Create .env file
touch .env
```

 Create .env file
```bash
MONGO_URI=mongodb://localhost:27017/crm
```

Start the backend
```bash
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create.env file
```bash
VITE_API_URL=backend_url
```

Start the frontend
```bash
npm run dev
```

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve the CRM tool.
