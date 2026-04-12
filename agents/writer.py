import os
from groq import Groq
from dotenv import load_dotenv

# ✅ Force load .env
load_dotenv(dotenv_path=".env")

def generate_article(news_item):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return "❌ GROQ_API_KEY not found. Check your .env file."

    client = Groq(api_key=api_key)  # ✅ create client AFTER loading env

    title = news_item["title"]
    description = news_item["description"]

    prompt = f"""
    You are an AI journalist.

    Convert the following news into a short, engaging newsletter article.

    Title: {title}
    Description: {description}

    Output format:
    - Title
    - Summary (2-3 lines)
    - Insight (why it matters)
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional tech journalist."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error generating article: {str(e)}"