let token = localStorage.getItem("token");

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

// LOGIN
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
    token = data.access_token;
    localStorage.setItem("token", token);

    showPage("app");

    userProfile.classList.remove("hidden");
    userName.innerText = payload.name;
    userEmail.innerText = payload.email;
    userPic.src = payload.picture;

    loadHistory();
  });
}

// GENERATE
document.getElementById("generateBtn").onclick = async () => {
  const res = await fetch("http://127.0.0.1:8000/generate", {
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
  const res = await fetch("http://127.0.0.1:8000/history", {
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