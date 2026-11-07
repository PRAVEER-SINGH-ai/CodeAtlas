require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

const nodemailer = require("nodemailer");

async function main() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
    throw new Error("One or more SMTP environment variables are missing.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });

  console.log("\n[SMTP] Verifying Gmail SMTP connection...");

  await transporter.verify();

  console.log("[SMTP] PASS: Gmail SMTP authentication successful.");
  console.log("[SMTP] Sender configuration is valid.");
  console.log("[SMTP] No test email was sent.");
  transporter.close();
}

main().catch(error => {
  console.error("\n[SMTP] VERIFICATION FAILED");
  console.error("Error:", error.message);
  process.exitCode = 1;
});
