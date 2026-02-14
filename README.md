# 📹 Twilio Video Call App

A full-stack real-time video calling application built with Next.js and Node.js, integrated with the Twilio Video API.

🌐 **Live Demo:** https://video-app-iota-nine.vercel.app/

---

## 🚀 Project Overview

This project demonstrates real-time video communication with secure token-based authentication, clean frontend-backend separation, and production deployment capabilities.

**Key Features:**
- Real-time video and audio streaming
- Secure token generation
- Media device handling (camera & microphone)
- Participant join/leave notifications
- Live audio/video toggling
- Production deployment on Vercel and Render

---

## 🏗 Architecture
```
Frontend (Next.js - Vercel)
        ↓
Backend API (Node.js + Express - Render)
        ↓
Twilio Video Service
```

---

## 📂 Project Structure
```
video-app/
│
├── client/              # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   └── package.json
│
├── server/              # Node.js Backend
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🛠 Tech Stack

**Frontend:**
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS
- Twilio Video SDK
- Axios

**Backend:**
- Node.js & Express
- Twilio SDK
- CORS & dotenv

**Deployment:**
- Frontend → Vercel
- Backend → Render

---

## 🔐 Backend API

**Endpoint:** `POST /generate-token`

**Request Body:**
```json
{
  "identity": "Aditi",
  "roomName": "room1"
}
```

**Response:**
```json
{
  "token": "twilio_jwt_token"
}
```

---

## 🔑 Environment Variables

Create a `.env` file in the `server` folder:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
```

⚠️ **Never expose these credentials on the frontend.**

---

## ✨ Features

**Core:**
- Room-based video calling
- Secure authentication
- Connect/Leave functionality
- Local and remote video display
- Connection status indicator

**Enhanced:**
- Participant name input
- Real-time participant list
- Join/Leave notification popups
- Live audio/video toggle
- Duplicate connection prevention
- Proper media cleanup

---

## 🧪 Run Locally

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/video-app.git
cd video-app
```

### 2️⃣ Run Backend
```bash
cd server
npm install
node index.js
```
Server runs on: `http://localhost:5000`

### 3️⃣ Run Frontend
```bash
cd client
npm install
npm run dev
```
Open: `http://localhost:3000`

---

## 📸 Screenshots

*(Add screenshots of your application here)*

- Local video view
- Two participants connected
- Join/Leave notifications
- Audio/Video toggle controls

---

## 🎯 Assignment Requirements

| Requirement | Status |
|------------|--------|
| Next.js frontend | ✅ |
| Express backend | ✅ |
| Twilio integration | ✅ |
| Secure token generation | ✅ |
| Environment variables | ✅ |
| Connect/Leave functionality | ✅ |
| Media cleanup | ✅ |
| Status display | ✅ |
| Documentation | ✅ |
| Deployment | ✅ |

---

## 👩‍💻 Author

**Aditi Malik**  
Email : malik2002.aditi@gmail.com
B.Tech CSE | Full Stack & AI Enthusiast

---

