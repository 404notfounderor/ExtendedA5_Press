import sys
import os
import random
import json

# Fix import paths
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.news_fetcher import fetch_news
from agents.writer import generate_article
from agents.editor import rank_articles
from services.reward_engine import calculate_total_points
from models.article import Article

from services.database import init_db
from services.wallet import (
    create_user,
    update_points,
    update_level,
    get_user,
    get_leaderboard,
)


def main():
    # 🔧 Initialize DB
    init_db()

    # 👥 Multiple users
    users = ["user_1", "user_2", "user_3"]

    for user in users:
        create_user(user)

    # 📰 Fetch news
    news = fetch_news("AI")

    article_objects = []

    # ✍️ Generate articles + assign users
    for item in news:
        content = generate_article(item)
        article = Article(item["title"], content)

        # simulate engagement
        article.views = random.randint(100, 500)
        article.likes = random.randint(10, 50)
        article.shares = random.randint(1, 5)

        # assign author
        article.author = random.choice(users)

        article_objects.append(article)

    # 🧠 Rank articles
    ranked = rank_articles([a.content for a in article_objects])

    # map scores back
    for score, content in ranked:
        for article in article_objects:
            if article.content == content:
                article.score = score

    # sort by score
    article_objects.sort(key=lambda x: x.score, reverse=True)

    print("\n📰 AI Newsletter with Rewards:\n")

    # 💰 Assign points
    for i, article in enumerate(article_objects[:5], 1):
        points = calculate_total_points(article, i)

        update_points(article.author, points)
        update_level(article.author)

        print(f"\n--- Rank {i} ---")
        print(f"Author: {article.author}")
        print(f"Score: {article.score}")
        print(f"Points Earned: {points}")
        print(article.content)

    # 🏆 Leaderboard
    print("\n🏆 LEADERBOARD:\n")

    leaderboard = get_leaderboard()

    for i, user in enumerate(leaderboard, 1):
        print(f"{i}. {user[0]} — {user[1]} pts ({user[2]})")

    # 📦 Prepare JSON output
    output = {
        "articles": [],
        "leaderboard": []
    }

    # Top articles
    for i, article in enumerate(article_objects[:5], 1):
        output["articles"].append({
            "rank": i,
            "author": article.author,
            "score": article.score,
            "points": article.points,
            "content": article.content
        })

    # Leaderboard data
    for user in leaderboard:
        output["leaderboard"].append({
            "user": user[0],
            "points": user[1],
            "level": user[2]
        })

    # 💾 Save JSON to frontend
    os.makedirs("frontend", exist_ok=True)

    with open("frontend/data.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)

    print("\n✅ Data exported to frontend/data.json")


if __name__ == "__main__":
    main()