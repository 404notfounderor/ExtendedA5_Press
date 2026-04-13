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

const API = "https://ragewire-backend.onrender.com";

/* INITIAL LOAD */
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

/* SIDEBAR */
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* IMAGE FALLBACK */
userPic.onerror = () => {
  userPic.src = "https://via.placeholder.com/36";
};

/* GOOGLE LOGIN */
window.handleGoogleLogin = function(response) {
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
    .then(res => {
      console.log("STATUS:", res.status);   // ADD THIS
      return res.text();                       // 👈 IMPORTANT CHANGE
    })
    .then(text => {
      console.log("RAW RESPONSE:", text);   // ADD THIS
      return JSON.parse(text);
    })
    .then(data => {
      console.log("PARSED:", data);

      // 🔥 IMPORTANT CHECK
      if (!data.access_token) {
        console.error("No token received:", data);
        alert("Login failed");
        return;
      }

      token = data.access_token;
      localStorage.setItem("token", data.access_token);

      // 🔥 DEBUG
      console.log("SAVED TOKEN:", data.access_token);
      console.log("LOCALSTORAGE TOKEN:", localStorage.getItem("token"));

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
    .catch(err => {
      console.error("Login error:", err);
      alert("Login failed");
    });

  } catch (err) {
    console.error("Google decode error:", err);
    alert("Login failed");
  }
};

/* HISTORY */
async function loadHistory() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/history`, {
      headers: { Authorization: token }
    });

    if (!res.ok) throw new Error("History failed");

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

/* GENERATE */
document.getElementById("generateBtn").onclick = async () => {
  const btn = document.getElementById("generateBtn"); // 🔥 FIX
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  if (!token) {
    alert("Login first");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Generating...";

  try {
    const res = await fetch(`${API}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    console.log("STATUS:", res.status);

    const text = await res.text();
    console.log("RESPONSE:", text);

    if (!res.ok) throw new Error("Generate failed");

    const data = JSON.parse(text);

    // 🔥 SAFETY CHECK
    if (!data.articles) {
      console.error("Invalid response:", data);
      alert("Something went wrong");
      return;
    }

    articlesDiv.innerHTML = "";

    data.articles.forEach(a => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${a.title || "AI News"}</h3>
        <p>${a.content.slice(0,120)}...</p>
        <button class="expand-btn">Read more</button>
        <div class="full hidden">${a.content}</div>
      `;

      const btn = card.querySelector(".expand-btn");
      const full = card.querySelector(".full");

      btn.onclick = () => full.classList.toggle("hidden");

      articlesDiv.appendChild(card);
    });

    loadHistory();

  } catch (err) {
    console.error("Generate error:", err);
    alert("Generate failed");
  }

  btn.disabled = false;
  btn.innerText = "Generate News";
};