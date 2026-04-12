import jwt
from datetime import datetime, timedelta

SECRET = "secret123"
REFRESH_SECRET = "refresh123"

def create_access_token(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=1)
    return jwt.encode(payload, SECRET, algorithm="HS256")

def create_refresh_token(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(payload, REFRESH_SECRET, algorithm="HS256")

def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
        return decoded["user_id"]
    except:
        return None

def verify_refresh_token(token):
    try:
        decoded = jwt.decode(token, REFRESH_SECRET, algorithms=["HS256"])
        return decoded["user_id"]
    except:
        return None