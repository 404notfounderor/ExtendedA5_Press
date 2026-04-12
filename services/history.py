from services.database import get_connection


def save_article(user_id, content, score):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO articles (user_id, content, score)
    VALUES (?, ?, ?)
    """, (user_id, content, score))

    conn.commit()
    conn.close()


def get_user_history(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT content, score, created_at
    FROM articles
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
    """, (user_id,))

    data = cursor.fetchall()
    conn.close()

    return data