// 🌐 BACKEND URL (LIVE)
const API = "https://ragewire-backend.onrender.com";

// 🔐 TOKEN
let token = localStorage.getItem("token");

// 📦 ELEMENTS
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const landing = document.getElementById("landing");
const content = document.getElementById("content");

const historySidebar = document.getElementById("historySidebar");
const historyList = document.getElementById("historyList");

const articlesDiv = document.getElementById("articles");

const userProfile = document.getElementById("userProfile");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPic = document.getElementById("userPic");


// 🚀 INITIAL STATE
if (token) {
  landing.classList.add("hidden");
  content.classList.remove("hidden");
  historySidebar.classList.remove("hidden");
  loadHistory();
}


// ☰ OPEN SIDEBAR
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.remove("hidden");
};

// ❌ CLOSE SIDEBAR
overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.add("hidden");
};


// 🌐 GOOGLE LOGIN
function handleGoogleLogin(response) {
  const payload = JSON.parse(atob(response.credential.split(".")[1]));

  fetch(`${API}/login`, {
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

    // UI switch
    landing.classList.add("hidden");
    content.classList.remove("hidden");
    historySidebar.classList.remove("hidden");

    // Profile UI
    userProfile.classList.remove("hidden");
    userName.innerText = payload.name;
    userEmail.innerText = payload.email;
    userPic.src = payload.picture;

    loadHistory();
  })
  .catch(err => {
    console.error("Login error:", err);
  });
}


// 📚 LOAD HISTORY (ChatGPT style)
async function loadHistory() {
  try {
    const res = await fetch(`${API}/history`, {
      headers: { Authorization: token }
    });

    const data = await res.json();

    historyList.innerHTML = "";

    data.history.reverse().forEach((h, i) => {
      const title = h.content.slice(0, 50) + "...";

      const div = document.createElement("div");
      div.className = "history-item";
      div.innerText = title;

      // 👉 click to load full article
      div.onclick = () => {
        articlesDiv.innerHTML = renderArticle(h.content);
      };

      historyList.appendChild(div);
    });

  } catch (err) {
    console.error("History error:", err);
  }
}


// 🚀 GENERATE ARTICLES
document.getElementById("generateBtn").onclick = async () => {
  try {
    articlesDiv.innerHTML = `<div class="card">Generating articles...</div>`;

    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    articlesDiv.innerHTML = "";

    data.articles.forEach((a, index) => {
      const preview = a.content.slice(0, 200) + "...";

      const card = document.createElement("div");
      card.className = "card fade-in";

      card.innerHTML = `
        <h3>Article ${index + 1}</h3>
        <p class="preview">${preview}</p>
        <button class="expand-btn">Read More</button>
      `;

      const btn = card.querySelector(".expand-btn");
      const p = card.querySelector(".preview");

      let expanded = false;

      btn.onclick = () => {
        expanded = !expanded;
        p.innerText = expanded ? a.content : preview;
        btn.innerText = expanded ? "Show Less" : "Read More";
      };

      articlesDiv.appendChild(card);
    });

    loadHistory();

  } catch (err) {
    console.error("Generate error:", err);
  }
};


// 🧠 RENDER SINGLE ARTICLE (from history click)
function renderArticle(content) {
  return `
    <div class="card fade-in">
      <p>${content}</p>
    </div>
  `;
}


// 🔓 LOGOUT (optional future button)
function logout() {
  localStorage.removeItem("token");
  location.reload();
}