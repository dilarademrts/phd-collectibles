const nodemailer = require("nodemailer");

const enabled =
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS &&
  process.env.SMTP_PASS !== "app_password"; // placeholder ise kapat


const transporter = enabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

async function sendMail({ subject, text }) {
  if (!enabled) {
    console.log("📧 [MAIL MOCK]", subject, "-", text);
    return { mocked: true };
  }

  try {
    return await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject,
      text
    });
  } catch (err) {
    console.log("📧 [MAIL FAILED -> MOCK]", err.message);
    console.log("📧 [MAIL MOCK]", subject, "-", text);
    return { mocked: true, error: err.message };
  }
}


module.exports = { sendMail };
