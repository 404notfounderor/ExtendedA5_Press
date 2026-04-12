from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import random

from services.auth import (
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_refresh_token
)

from services.wallet import (
    create_user,
    verify_user,
    update_points,
    update_level,
    get_leaderboard
)

from services.database import init_db, get_connection
from services.history import save_article, get_user_history
from services.bookmarks import save_bookmark, get_bookmarks

from services.news_fetcher import fetch_news
from agents.writer import generate_article
from services.reward_engine import calculate_total_points
from models.article import Article

app = FastAPI()

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 LOGIN
@app.post("/login")
async def login(request: Request):
    try:
        init_db()

        data = await request.json()
        user_id = data.get("user_id")
        password = data.get("password")

        if not user_id or not password:
            return {"error": "Missing username or password"}

        # Check if user exists
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        conn.close()

        # Existing user
        if result:
            if verify_user(user_id, password):
                return {
                    "access_token": create_access_token({"user_id": user_id}),
                    "refresh_token": create_refresh_token({"user_id": user_id})
                }
            else:
                return {"error": "Invalid password"}

        # New user → create
        create_user(user_id, password)

        return {
            "access_token": create_access_token({"user_id": user_id}),
            "refresh_token": create_refresh_token({"user_id": user_id})
        }

    except Exception as e:
        print("LOGIN ERROR:", e)
        return {"error": "Server error during login"}


# 🔁 REFRESH TOKEN
@app.post("/refresh")
async def refresh(request: Request):
    try:
        data = await request.json()
        refresh_token = data.get("refresh_token")

        user = verify_refresh_token(refresh_token)

        if not user:
            return {"error": "Invalid refresh token"}

        return {"access_token": create_access_token({"user_id": user})}

    except Exception as e:
        print("REFRESH ERROR:", e)
        return {"error": "Server error during refresh"}


# 🚀 GENERATE NEWSLETTER
@app.post("/generate")
async def generate(request: Request):
    try:
        init_db()

        data = await request.json()
        token = data.get("token")

        user = verify_token(token)

        if not user:
            return {"error": "Invalid token"}

        news = fetch_news("AI")
        articles = []

        for item in news:
            content = generate_article(item)
            article = Article(item["title"], content)

            article.score = random.uniform(6, 10)
            article.author = user

            articles.append(article)

        articles.sort(key=lambda x: x.score, reverse=True)

        for i, a in enumerate(articles[:5], 1):
            pts = calculate_total_points(a, i)
            update_points(user, pts)
            update_level(user)

            save_article(user, a.content, a.score)

        return {
            "articles": [
                {"content": a.content}
                for a in articles[:5]
            ],
            "leaderboard": get_leaderboard()
        }

    except Exception as e:
        print("GENERATE ERROR:", e)
        return {"error": "Server error during generation"}


# 📚 USER HISTORY
@app.get("/history")
async def history(request: Request):
    try:
        token = request.headers.get("Authorization")
        user = verify_token(token)

        if not user:
            return {"error": "Invalid token"}

        history_data = get_user_history(user)

        return {
            "history": [
                {
                    "content": h[0],
                    "score": h[1],
                    "time": h[2]
                }
                for h in history_data
            ]
        }

    except Exception as e:
        print("HISTORY ERROR:", e)
        return {"error": "Server error fetching history"}


# ⭐ SAVE BOOKMARK
@app.post("/bookmark")
async def bookmark(request: Request):
    try:
        data = await request.json()
        token = data.get("token")
        content = data.get("content")

        user = verify_token(token)

        if not user:
            return {"error": "Invalid token"}

        save_bookmark(user, content)

        return {"message": "Saved"}

    except Exception as e:
        print("BOOKMARK ERROR:", e)
        return {"error": "Server error saving bookmark"}


# ⭐ GET BOOKMARKS
@app.get("/bookmarks")
async def bookmarks(request: Request):
    try:
        token = request.headers.get("Authorization")
        user = verify_token(token)

        if not user:
            return {"error": "Invalid token"}

        data = get_bookmarks(user)

        return {
            "bookmarks": [
                {
                    "content": b[0],
                    "time": b[1]
                }
                for b in data
            ]
        }

    except Exception as e:
        print("BOOKMARK FETCH ERROR:", e)
        return {"error": "Server error fetching bookmarks"}