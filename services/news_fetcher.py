import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("NEWS_API_KEY")


def fetch_news(query="technology", page_size=10):
    if not API_KEY:
        print("❌ ERROR: NEWS_API_KEY not found in .env file")
        return []

    url = "https://newsapi.org/v2/everything"

    params = {
        "q": query,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": page_size,
        "apiKey": API_KEY,
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        # 🔍 Debug (optional — you can remove later)
        if data.get("status") != "ok":
            print("❌ API Error:", data)
            return []

        articles = []

        for item in data.get("articles", []):
            articles.append({
                "title": item.get("title") or "No Title",
                "description": item.get("description") or "No description available",
                "url": item.get("url")
            })

        if not articles:
            print("⚠️ No articles found. Try a different query.")

        return articles

    except Exception as e:
        print("❌ Request failed:", str(e))
        return []