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

const generateBtn = document.getElementById("generateBtn");

const API = "https://ragewire-backend.onrender.com";


// =====================
// INITIAL LOAD
// =====================
window.onload = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");

  if (token) {
    landing.classList.add("hidden");
    content.classList.remove("hidden");

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        userProfile.classList.remove("hidden");
        userName.innerText = user.name || "User";
        userEmail.innerText = user.email || "";
        userPic.src = user.picture || "";

        document.getElementById("loginSidebar").classList.add("hidden");
      }
    } catch (e) {
      console.warn("User parse error");
    }

    loadHistory();
  }
};


// =====================
// SIDEBAR
// =====================
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};


// =====================
// IMAGE FALLBACK
// =====================
userPic.onerror = () => {
  userPic.src = "https://via.placeholder.com/36";
};


// =====================
// GOOGLE LOGIN
// =====================
window.handleGoogleLogin = function (response) {
  try {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: payload.email
      })
    })
      .then(res => res.text())
      .then(text => JSON.parse(text))
      .then(data => {
        if (!data.access_token) {
          alert("Login failed");
          return;
        }

        token = data.access_token;
        localStorage.setItem("token", token);

        localStorage.setItem("user", JSON.stringify({
          name: payload.name,
          email: payload.email,
          picture: payload.picture
        }));

        landing.classList.add("hidden");
        content.classList.remove("hidden");

        userProfile.classList.remove("hidden");
        userName.innerText = payload.name;
        userEmail.innerText = payload.email;
        userPic.src = payload.picture;

        document.getElementById("loginSidebar").classList.add("hidden");

        sidebar.classList.remove("open");
        overlay.classList.remove("show");

        loadHistory();
      })
      .catch(() => alert("Login failed"));

  } catch (err) {
    alert("Login failed");
  }
};


// =====================
// LOAD HISTORY
// =====================
async function loadHistory() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.history) return;

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
generateBtn.onclick = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login first");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerText = "Generating...";

  try {
    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    const text = await res.text();
    const data = JSON.parse(text);

    if (!data.articles) {
      alert("Something went wrong");
      return;
    }

    articlesDiv.innerHTML = "";

    data.articles.slice(0, 3).forEach((a, index) => {
      const card = document.createElement("div");
      card.className = "card";

      // Highlight top article
      if (index === 0) card.classList.add("top-card");

      const cleanText = a.content.replace(/\*\*/g, "");
      const sentences = cleanText.split(".");
      const summary = sentences[0] ? sentences[0] + "." : cleanText;

      card.innerHTML = `
        <h3 class="headline">${a.title || "AI News"}</h3>
        <p class="summary">${summary}</p>
        <button class="expand-btn">Read more</button>
        <div class="full hidden">
          <p>${cleanText}</p>
        </div>
      `;

      const expandBtn = card.querySelector(".expand-btn");
      const full = card.querySelector(".full");

      expandBtn.onclick = () => {
        full.classList.toggle("hidden");
      };

      articlesDiv.appendChild(card);
    });

    loadHistory();

  } catch (err) {
    console.error("Generate error:", err);
    alert("Generate failed");
  }

  generateBtn.disabled = false;
  generateBtn.innerText = "Generate News";
};