const nodemailer = require("nodemailer");

const isMock = process.env.MAIL_MODE !== "real";

let transporter = null;

if (!isMock) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true", // 465 için true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, attachments }) {
  const recipient =
    (to && String(to).trim()) ||
    (process.env.ADMIN_EMAIL && String(process.env.ADMIN_EMAIL).trim());

  if (!recipient) {
    console.log("📧 [MAIL] SKIP: recipient missing (to/ADMIN_EMAIL yok)");
    return;
  }

  if (isMock) {
    console.log(`📧 [MAIL MOCK] ${subject} - ${text}`);
    if (attachments?.length) {
      console.log(
        `📎 [MAIL MOCK] attachments: ${attachments.map(a => a.filename).join(", ")}`
      );
    }
    return;
  }

  await transporter.sendMail({
    from: `"PHD Collectibles" <${process.env.SMTP_USER}>`,
    to: recipient,
    subject,
    text,
    attachments: attachments || [],
  });

  console.log(`📧 Mail sent → ${recipient}`);
}

module.exports = { sendMail };
