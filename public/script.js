document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");
  const sendBtn = document.getElementById("sendBtn");

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());

      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (result.success) {
        window.location.href = "/launcher";
      } else {
        alert("❌ " + result.message);
      }
    });
  }

  // Mail send
  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(mailForm).entries());

      // 🔴 Button status → Pink + Sending
      sendBtn.disabled = true;
      sendBtn.style.background = "pink";
      sendBtn.style.color = "#000";
      sendBtn.innerText = "Sending...";

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        sendBtn.innerText = "Sent ✅";
        sendBtn.style.background = "green";
        sendBtn.style.color = "#fff";
      } else {
        sendBtn.innerText = "Failed ❌";
        sendBtn.style.background = "gray";
        sendBtn.style.color = "#fff";
      }

      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.style.background = "#4285f4";
        sendBtn.style.color = "#fff";
        sendBtn.innerText = "Send All";
      }, 3000);
    });
  }
});

function logout() {
  window.location.href = "/logout";
}
