# 🔥 RageWire — AI-Powered News Feed

> *Sign On. Rage On.*
> A full-stack AI news platform that fetches real-time news, generates structured articles using LLMs, and delivers a clean, interactive reading experience.

---

## 🚀 Live Demo

* 🌐 Frontend: https://rishiksragewire.vercel.app
* ⚙️ Backend: https://ragewire-backend.onrender.com

---

## ✨ Features

### 🔐 Authentication

* Google OAuth login
* JWT-based session handling

### 🧠 AI-Powered Articles

* Fetches live news using News API
* Generates structured articles using Groq (LLM)
* Clean formatting: headline → summary → full content

### 📰 Smart UI

* Highlighted **Top Article**
* Expandable “Read More” cards
* Smooth hover interactions
* Clean dark-themed interface

### 📊 User History

* Stores previously generated articles
* Clickable history sidebar

---

## 🧱 Tech Stack

### Frontend

* HTML, CSS, JavaScript (Vanilla)
* Responsive UI with modern styling

### Backend

* FastAPI (Python)
* JWT Authentication
* REST APIs

### Database

* SQLite (user data, history, points)

### AI + APIs

* 🧠 Groq API (LLM article generation)
* 📰 News API (real-time news)

### Deployment

* Frontend → Vercel
* Backend → Render

---

## 🧠 Architecture

```text
User → Frontend (Vercel)
        ↓
   FastAPI Backend (Render)
        ↓
 ┌───────────────┬───────────────┐
 │   News API    │    Groq API   │
 └───────────────┴───────────────┘
        ↓
     SQLite DB
```

---

## ⚙️ Setup (Local Development)

### 1. Clone repo

```bash
git clone https://github.com/your-username/ragewire.git
cd ragewire
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env`:

```env
NEWS_API_KEY=your_news_api_key
GROQ_API_KEY=your_groq_api_key
```

Run server:

```bash
uvicorn app:app --reload
```

---

### 3. Frontend

Just open:

```bash
index.html
```

---

## 🔐 Environment Variables (Production)

Set these in Render:

```
NEWS_API_KEY=...
GROQ_API_KEY=...
```

---

## 🧪 Future Improvements

* 🧠 Personalized “For You” feed
* 📊 User engagement analytics
* 🧱 Grid-based layout
* 🔄 Auto-refresh news feed
* 🏷️ Category filters (AI, Tech, Business)

---

## 💡 What Makes This Project Stand Out

* End-to-end full-stack system (frontend + backend + AI)
* Real-world API integration
* Authentication + state management
* Production deployment
* Clean, product-level UI

---

## 👤 Author

**Rishik Singh**
