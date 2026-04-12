// =====================
// GLOBAL STATE
// =====================
let token = localStorage.getItem("token");

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

// 🔗 BACKEND
const API = "https://ragewire-backend.onrender.com";


// =====================
// INITIAL LOAD FIX
// =====================
window.onload = () => {
  // force sidebar closed
  sidebar.classList.remove("open");
  overlay.classList.add("hidden");

  if (token) {
    landing.classList.add("hidden");
    content.classList.remove("hidden");
    loadHistory();
  }
};


// =====================
// SIDEBAR CONTROLS
// =====================
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.remove("hidden");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.add("hidden");
};


// =====================
// GOOGLE LOGIN
// =====================
function handleGoogleLogin(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: payload.email,
        password: "google_oauth"
      })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.access_token) {
        throw new Error("Login failed");
      }

      token = data.access_token;
      localStorage.setItem("token", token);

      // UI switch
      landing.classList.add("hidden");
      content.classList.remove("hidden");

      // profile UI
      userProfile.classList.remove("hidden");
      userName.innerText = payload.name;
      userEmail.innerText = payload.email;
      userPic.src = payload.picture;

      loadHistory();
    });

  } catch (err) {
    console.error("Google login error:", err);
    alert("Login failed");
  }
}


// =====================
// LOAD HISTORY
// =====================
async function loadHistory() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/history`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error("History fetch failed");

    const data = await res.json();

    historySidebar.classList.remove("hidden");
    historyList.innerHTML = "";

    data.history.forEach(h => {
      const item = document.createElement("div");
      item.className = "card history-item";
      item.innerText = h.content.slice(0, 40) + "...";

      item.onclick = () => {
        articlesDiv.innerHTML = `<div class="card">${h.content}</div>`;
      };

      historyList.appendChild(item);
    });

  } catch (err) {
    console.error("History error:", err);
  }
}


// =====================
// GENERATE ARTICLES
// =====================
document.getElementById("generateBtn").onclick = async () => {
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    if (!res.ok) throw new Error("Generate failed");

    const data = await res.json();

    articlesDiv.innerHTML = "";

    data.articles.forEach(a => {
      const card = document.createElement("div");
      card.className = "card article";

      card.innerHTML = `
        <h3>${a.title || "AI News"}</h3>
        <p>${a.content.slice(0, 120)}...</p>
        <button class="expand-btn">Read more</button>
        <div class="full hidden">${a.content}</div>
      `;

      const btn = card.querySelector(".expand-btn");
      const full = card.querySelector(".full");

      btn.onclick = () => {
        full.classList.toggle("hidden");
      };

      articlesDiv.appendChild(card);
    });

    loadHistory();

  } catch (err) {
    console.error("Generate error:", err);
    alert("Generate failed — check backend");
  }
};