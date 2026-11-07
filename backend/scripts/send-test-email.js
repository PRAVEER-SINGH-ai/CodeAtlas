require("dotenv").config();
const nodemailer = require("nodemailer");

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER,
    subject: "CodeAtlas - Email Delivery Test",
    text: "Congratulations! Your CodeAtlas email delivery is working.",
    html: "<h2>CodeAtlas email is working!</h2><p>Your email verification infrastructure is ready.</p>"
  });

  console.log("PASS: Test email accepted by SMTP server.");
  console.log("Message ID:", result.messageId);
  console.log("Recipient:", process.env.SMTP_USER);
  transporter.close();
}

main().catch(error => {
  console.error("EMAIL DELIVERY FAILED:", error.message);
  process.exitCode = 1;
});
