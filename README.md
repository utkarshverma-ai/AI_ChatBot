# AI Chatbot (Full-Stack)

A production-ready AI chatbot built using React 19, Vite 7, Express, and Google Gemini API.  
The application follows secure backend architecture by routing all AI requests through an Express server, protecting API keys and enabling structured error handling.

The project demonstrates full-stack integration, AI API handling, environment-based configuration, and real-world deployment using Vercel (frontend) and Render (backend).

## ✨ Features

- 🔐 Secure Gemini API integration via backend proxy
- 🧠 Conversation history management (last 10 messages)
- 📅 Dynamic system date injection
- ⚠️ Structured error handling (validation, API, server errors)
- ⏳ Loading and rate-limit handling (429 support)
- 🌐 Production deployment (Vercel + Render)
- 📦 Environment variable configuration
- 🚀 Modern stack: React 19 + Vite 7 + Express

## 🛠 Tech Stack

**Frontend**
- React 19
- Vite 7
- Tailwind CSS v4

**Backend**
- Node.js
- Express.js
- Google Gemini API (@google/generative-ai)
- Express Rate Limit

## 🏗 Architecture Overview

Frontend (React)  
⬇  
Express Backend (/api/chat)  
⬇  
Google Gemini API  

- API key stored securely in backend `.env`
- No direct AI calls from frontend
- Backend handles validation, history truncation, and structured responses

**Deployment**
- Vercel (Frontend)
- Render (Backend)
