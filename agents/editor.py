import os
import re
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env")


def extract_score(text):
    match = re.search(r"Final Score:\s*(\d+(\.\d+)?)", text)
    if match:
        score = float(match.group(1))

        # ✅ Clamp between 1 and 10
        return max(1.0, min(score, 10.0))

    return 5.0


def rank_articles(articles):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return [(5.0, article) for article in articles]

    client = Groq(api_key=api_key)

    ranked_articles = []

    for article in articles:
        prompt = f"""
        Score this article on:

        1. Importance (1-10)
        2. Relevance (1-10)
        3. Impact (1-10)

        Return EXACTLY in this format:
        Importance: X
        Relevance: X
        Impact: X
        Final Score: X (can be decimal)

        Article:
        {article}
        """

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a strict news editor."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0,
            )

            output = response.choices[0].message.content.strip()

            score = extract_score(output)

        except Exception as e:
            print("Error:", e)
            score = 5.0  # fallback

        ranked_articles.append((score, article))

    # sort by score descending
    ranked_articles.sort(reverse=True, key=lambda x: x[0])

    return ranked_articles