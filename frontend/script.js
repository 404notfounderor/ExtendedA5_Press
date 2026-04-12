let token = localStorage.getItem("token");
let refreshToken = localStorage.getItem("refresh_token");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const generateBtn = document.getElementById("generateBtn");

const username = document.getElementById("username");
const password = document.getElementById("password");

const loader = document.getElementById("loader");
const articlesDiv = document.getElementById("articles");
const leaderboardDiv = document.getElementById("leaderboard");
const historyDiv = document.getElementById("history");
const bookmarksDiv = document.getElementById("bookmarks");

// AUTO LOGIN
if (token) {
  document.getElementById("loginSection").style.display = "none";
  logoutBtn.classList.remove("hidden");
  generateBtn.disabled = false;
}

// LOGIN
loginBtn.onclick = async () => {
  const res = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: username.value.trim(),
      password: password.value.trim()
    })
  });

  const data = await res.json();

  if (!data.access_token) {
    alert("Login failed");
    return;
  }

  token = data.access_token;
  refreshToken = data.refresh_token;

  localStorage.setItem("token", token);
  localStorage.setItem("refresh_token", refreshToken);

  location.reload();
};

// GOOGLE LOGIN
function handleGoogleLogin(response) {
  const payload = JSON.parse(atob(response.credential.split(".")[1]));

  fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: payload.email,
      password: "google_oauth"
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    location.reload();
  });
}

// LOGOUT
logoutBtn.onclick = () => {
  localStorage.clear();
  location.reload();
};

// RENDER
function render(data) {
  articlesDiv.innerHTML = "";
  leaderboardDiv.innerHTML = "";

  data.articles.forEach((a, i) => {
    articlesDiv.innerHTML += `
      <div class="card">
        <div>Rank ${i+1}</div>
        <div>${a.content}</div>
        <button onclick="bookmark('${a.content.replace(/'/g, "\\'")}')">⭐</button>
      </div>
    `;
  });

  data.leaderboard.forEach((u, i) => {
    leaderboardDiv.innerHTML += `
      <div>${i+1}. ${u[0]} - ${u[1]}</div>
    `;
  });
}

// BOOKMARK
async function bookmark(content) {
  await fetch("http://127.0.0.1:8000/bookmark", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ token, content })
  });

  loadBookmarks();
}

// LOAD BOOKMARKS
async function loadBookmarks() {
  const res = await fetch("http://127.0.0.1:8000/bookmarks", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  bookmarksDiv.innerHTML = "";

  data.bookmarks.forEach(b => {
    bookmarksDiv.innerHTML += `<div class="card">${b.content}</div>`;
  });
}

// LOAD HISTORY
async function loadHistory() {
  const res = await fetch("http://127.0.0.1:8000/history", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  historyDiv.innerHTML = "";

  data.history.forEach(h => {
    historyDiv.innerHTML += `<div class="card">${h[0]}</div>`;
  });
}

// GENERATE
generateBtn.onclick = async () => {
  loader.classList.remove("hidden");

  let res = await fetch("http://127.0.0.1:8000/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ token })
  });

  let data = await res.json();

  if (data.error) {
    await fetch("http://127.0.0.1:8000/refresh", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    .then(res => res.json())
    .then(d => {
      token = d.access_token;
      localStorage.setItem("token", token);
    });

    res = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ token })
    });

    data = await res.json();
  }

  render(data);
  await loadBookmarks();
  await loadHistory();

  loader.classList.add("hidden");
};