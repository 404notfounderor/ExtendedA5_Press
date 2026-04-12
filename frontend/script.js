let token = localStorage.getItem("token");

// 🔥 ADD THIS (IMPORTANT)
const API_URL = "https://your-backend.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get("token");

if (urlToken) {
  token = urlToken;
  localStorage.setItem("token", token);
  window.history.replaceState({}, document.title, "/");
}

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const articlesDiv = document.getElementById("articles");
const historyThreads = document.getElementById("historyThreads");
const historyContent = document.getElementById("historyContent");

const userProfile = document.getElementById("userProfile");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPic = document.getElementById("userPic");

// ROUTING
const pages = {
  home: document.getElementById("page-home"),
  app: document.getElementById("page-app"),
  history: document.getElementById("page-history")
};

function showPage(p) {
  Object.values(pages).forEach(pg => pg.classList.add("hidden"));
  pages[p].classList.remove("hidden");
}

// INITIAL
if (token) showPage("app");
else showPage("home");

// SIDEBAR
document.getElementById("menuBtn").onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.remove("hidden");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.add("hidden");
};

// 🔥 GOOGLE LOGIN (UPDATED)
document.getElementById("googleLoginBtn").onclick = () => {
  window.location.href = `${API_URL}/auth/google`;
};

document.getElementById("googleLoginSidebar").onclick = () => {
  window.location.href = `${API_URL}/auth/google`;
};

// GENERATE
document.getElementById("generateBtn").onclick = async () => {
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ token })
  });

  const data = await res.json();

  articlesDiv.innerHTML = "";

  data.articles.forEach(a => {
    const preview = a.content.slice(0, 120);

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<b>Article</b><br>${preview}...`;

    div.onclick = () => {
      div.classList.toggle("expanded");
      div.innerHTML = div.classList.contains("expanded")
        ? a.content
        : `<b>Article</b><br>${preview}...`;
    };

    articlesDiv.appendChild(div);
  });

  loadHistory();
};

// HISTORY THREADS
async function loadHistory() {
  const res = await fetch(`${API_URL}/history`, {
    headers: { Authorization: token }
  });

  const data = await res.json();

  historyThreads.innerHTML = "";
  historyContent.innerHTML = "";

  data.history.forEach((h, i) => {
    const title = h.content.slice(0, 30) + "...";

    const btn = document.createElement("div");
    btn.className = "card";
    btn.innerText = title;

    btn.onclick = () => {
      historyContent.innerHTML = `<div class="card">${h.content}</div>`;
    };

    historyThreads.appendChild(btn);
  });
}