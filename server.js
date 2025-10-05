const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

// ✅ Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route → show login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Login check
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const AUTH_USER = "Lodhiyatendra";
  const AUTH_PASS = "lodhi882@#";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "❌ Invalid credentials" });
  }
});

// ✅ Launcher route → show launcher.html
app.get("/launcher", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ✅ Bulk Mail Sender
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    if (!senderName || !senderEmail || !appPassword || !subject || !message || !recipients) {
      return res.json({ success: false, message: "⚠️ Please fill all fields" });
    }

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipients" });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    const cleanMessage = message.replace(/^\s*\n/, "");

    const emailPromises = recipientList.map(recipient => {
      let mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: recipient,
        subject,
        text: cleanMessage,
        html: `<div style="font-family: Arial, sans-serif; color:#000; line-height:1.5; white-space:pre-wrap;">
                 ${cleanMessage.replace(/\n/g, "<br>")}
               </div>`
      };

      return transporter.sendMail(mailOptions)
        .then(() => console.log(`✅ Sent to ${recipient}`))
        .catch(err => console.error(`❌ Failed to ${recipient}: ${err.message}`));
    });

    await Promise.all(emailPromises);

    res.json({ success: true, message: `✅ ${recipientList.length} mails sent successfully` });

  } catch (err) {
    console.error("Mail Error:", err);
    res.json({ success: false, message: "❌ " + err.message });
  }
});

// ✅ Fallback route (fix Not Found)
app.get("*", (req, res) => {
  res.redirect("/");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
