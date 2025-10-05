const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PUBLIC_DIR = path.resolve("public");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

// Serve static files
app.use(express.static(PUBLIC_DIR));

// Root → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const AUTH_USER = "Lodhiyatendra";
  const AUTH_PASS = "lodhi882@#";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "❌ Invalid credentials" });
});

// Launcher
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(PUBLIC_DIR, "launcher.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ✅ Bulk Mail Sender (parallel, super fast)
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipients" });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: appPassword }
    });

    // जस का तस template
    const cleanMessage = message.replace(/^\s+/, "");

    // ✅ All mails parallel in Promise.all
    await Promise.all(
      recipientList.map(recipient => {
        const mailOptions = {
          from: `"${senderName}" <${senderEmail}>`,
          to: recipient,
          subject,
          text: cleanMessage,
          html: `<div style="font-family: Arial; line-height:1.5; white-space:pre-wrap;">
                   ${cleanMessage.replace(/\n/g, "<br>")}
                 </div>`
        };
        return transporter.sendMail(mailOptions)
          .then(() => console.log(`✅ Sent to ${recipient}`))
          .catch(err => console.error(`❌ ${recipient}: ${err.message}`));
      })
    );

    return res.json({ success: true, message: `✅ ${recipientList.length} mails sent successfully in ~1 second` });
  } catch (err) {
    return res.json({ success: false, message: "❌ " + err.message });
  }
});

// Fallback
app.get("*", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "login.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
