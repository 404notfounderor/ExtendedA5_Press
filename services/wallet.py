from services.database import get_connection
from passlib.hash import bcrypt


def create_user(user_id, password):
    conn = get_connection()
    cursor = conn.cursor()

    hashed = bcrypt.hash(password)

    cursor.execute("""
    INSERT OR IGNORE INTO users (user_id, password, points, level)
    VALUES (?, ?, 0, 'Bronze')
    """, (user_id, hashed))

    conn.commit()
    conn.close()


def verify_user(user_id, password):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT password FROM users WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()

    conn.close()

    if result:
        return bcrypt.verify(password, result[0])

    return False


def update_points(user_id, points):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE users SET points = points + ? WHERE user_id = ?
    """, (points, user_id))

    conn.commit()
    conn.close()


def calculate_level(points):
    if points >= 4000:
        return "Diamond"
    elif points >= 1500:
        return "Platinum"
    elif points >= 600:
        return "Gold"
    elif points >= 200:
        return "Silver"
    return "Bronze"


def update_level(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT points FROM users WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()

    if result:
        level = calculate_level(result[0])
        cursor.execute("UPDATE users SET level = ? WHERE user_id = ?", (level, user_id))
        conn.commit()

    conn.close()


def get_leaderboard():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT user_id, points, level
    FROM users
    ORDER BY points DESC
    LIMIT 10
    """)

    users = cursor.fetchall()
    conn.close()
    return users