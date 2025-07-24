# 🛒 Galeria – Luxury Asset E-Commerce Platform

A next-generation, full-stack e-commerce platform for luxury asset sales (cars, yachts, collectibles, and more).  
Built with **Node.js**, **Express**, **MongoDB**, and **React**.  
This monorepo includes both a backend API and a modern, animated frontend.

![Homepage Screenshot](./screenshot.png)

---

## 🚀 Tech Stack

### 🧠 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- RESTful API

### 🎨 Frontend
- React.js (Context API for state management)
- Modern CSS (custom, responsive, animated)
- GSAP Animations

---

## 🏠 Homepage & Key Features

- **Hero Section:** Luxury branding, animated SVGs, and clear CTAs (“Explore Stores”, “Create Your Store”)
- **Why Galeria:** Unified dashboard, end-to-end management, enterprise security, global compliance
- **Platform Features:** Inventory, digital contracts, logistics, AI price estimation, multi-currency/language, white-label showroom
- **Who Is It For:** Car dealerships, yacht sellers, galleries, brokers, corporate chains
- **Security & Trust:** KYC, audit trails, encryption, testimonials
- **Pricing & Plans:** Flexible plans, onboarding for sellers, billing management
- **Global Network:** International support, cross-border sales, multi-language
- **Showcase:** Modern, responsive, and visually rich UI

---

## 📁 Folder Structure

```
e-commerce/
├── backend/         # Node.js + Express REST API
├── client/          # React frontend
├── .gitignore
├── README.md
└── screenshot.png
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Berkayssy/e-commerce.git
cd e-commerce
```

### 2. Backend Setup

```bash
cd backend
npm install
# Add a .env file with the following:
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
# Default Port: 3000
```

---

## 📮 API Testing

Use Postman to test all endpoints.  
Attach your JWT token as a bearer in the Authorization header for protected routes.

---

## ✨ MVP & Roadmap

- [x] User, seller, and admin flows
- [x] Store creation & onboarding
- [x] Product management & basket
- [x] Plan selection & billing
- [x] Modern, animated homepage
- [ ] TypeScript & Tailwind migration (planned)
- [ ] Performance & code optimization (planned)

---

## 📸 Home Page Preview

> En güncel ana sayfa için `client/src/pages/Home.js` dosyasını ve `screenshot.png` dosyasını inceleyebilirsiniz.

---

## License

MIT

