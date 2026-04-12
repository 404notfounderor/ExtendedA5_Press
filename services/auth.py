import os
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth

router = APIRouter()

# 🔐 Load env variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")

# 🔧 OAuth setup
oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)

# 🚀 Step 1: Redirect user to Google
@router.get("/auth/google")
async def login_google(request: Request):
    redirect_uri = BACKEND_URL + "/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

# 🔁 Step 2: Callback from Google
@router.get("/auth/google/callback")
async def auth_google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get("userinfo")

    # 🧠 Extract user info
    email = user.get("email")
    name = user.get("name")
    picture = user.get("picture")

    # 🔐 Create your own token (simple example)
    # 👉 Replace this with JWT if needed
    app_token = email  # using email as token (simple for now)

    # 🚀 Redirect to frontend with token
    return RedirectResponse(
        f"{FRONTEND_URL}?token={app_token}"
    )