const nodemailer = require("nodemailer");

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST);

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: user && pass ? { user, pass } : undefined,
  });
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  const transporter = getTransporter();
  const displayName = fullName || "";

  if (!transporter) {
    console.info(`[password-reset] ${to}: ${resetUrl}`);
    return { delivered: false, resetUrl };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "STB Interns <no-reply@stb.local>",
    to,
    subject: "Reset your STB Interns password",
    text: [
      `Hello ${displayName},`.trim(),
      "",
      "We received a request to reset your STB Interns password.",
      "Use this link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hello ${escapeHtml(displayName)},</p>
      <p>We received a request to reset your STB Interns password.</p>
      <p><a href="${resetUrl}">Choose a new password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });

  return { delivered: true };
};

module.exports = {
  sendPasswordResetEmail,
};
