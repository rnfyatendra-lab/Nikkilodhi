// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Nikkilodhi" && password === "Lodhi882@#") {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "❌ Invalid credentials" });
});

// Launcher page
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(PUBLIC_DIR, "launcher.html"));
});
