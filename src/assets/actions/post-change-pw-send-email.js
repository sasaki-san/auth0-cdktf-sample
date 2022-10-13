/**
 * After a password change, send an email to let the user know that changing a password was successful.
 */
exports.onExecutePostChangePassword = async (event) => {

  const nodemailer = require("nodemailer")

  const transporter = nodemailer.createTransport({
    host: event.secrets.SMTP_HOST,
    port: event.secrets.SMTP_PORT,
    ssl: false,
    tls: true,
    auth: {
      user: event.secrets.SMTP_AUTH_USER,
      pass: event.secrets.SMTP_AUTH_PASS,
    }
  });

  const info = await transporter.sendMail({
    from: '"Post Change Password Action" <foo@example.com>',
    to: event.user.email,
    subject: "Hello ✔",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  });

  console.log(`Message sent: ${info.messageId}`);

};
