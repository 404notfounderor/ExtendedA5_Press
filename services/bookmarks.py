from services.database import get_connection


def save_bookmark(user_id, content):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO bookmarks (user_id, content)
    VALUES (?, ?)
    """, (user_id, content))

    conn.commit()
    conn.close()


def get_bookmarks(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT content, created_at
    FROM bookmarks
    WHERE user_id = ?
    ORDER BY created_at DESC
    """, (user_id,))

    data = cursor.fetchall()
    conn.close()

    return data