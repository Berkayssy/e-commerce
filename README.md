# 🛒 E-Commerce Full-Stack Project

A full-stack e-commerce application built with **Node.js**, **Express**, **MongoDB**, and **React**.  
This monorepo includes both a backend API and a frontend client.

![Homepage Screenshot](./screenshot.png)

---

## 🚀 Tech Stack

### 🧠 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Postman (for testing)

### 🎨 Frontend
- React.js
- CSS (vanilla)
- **Context API** for global state management

---

## 📁 Folder Structure

e-commerce/
├── backend/         # Node.js + Express REST API
├── client/          # React frontend
├── .gitignore
└── README.md

---

## ⚙️ Setup Instructions

### 🔌 Clone the repository

## Backend Setup

```bash
git clone https://github.com/Berkayssy/e-commerce.git
cd e-commerce
cd backend
npm install
# Add a .env file
npm run dev

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

## Frontend Setup
cd client
npm install
npm start

•	Default Port: 3000

📮 API Testing

Use Postman to test all endpoints.
Attach your JWT token as a bearer in the Authorization header for protected routes.

