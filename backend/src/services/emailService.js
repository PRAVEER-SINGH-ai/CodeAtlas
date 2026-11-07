const nodemailer = require("nodemailer");

function isEmailConfigured() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.EMAIL_FROM
    );
}

async function sendVerificationEmail(email, name, token) {
    if (!isEmailConfigured()) {
        throw new Error("Email SMTP is not configured.");
    }

    const port = Number(process.env.SMTP_PORT);
    const backendUrl = (
        process.env.BACKEND_URL || "http://localhost:5000"
    ).replace(/\/+$/, "");

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const safeName = String(name).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your CodeAtlas email",
        text:
            `Hi ${name},\n\n` +
            `Verify your CodeAtlas account using this link:\n${verificationUrl}\n\n` +
            `This link expires in 15 minutes.\n\n` +
            `If you did not create this account, ignore this email.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
                <h2>Welcome to CodeAtlas!</h2>
                <p>Hi ${safeName},</p>
                <p>Please verify your email address to activate your account.</p>
                <p>
                    <a href="${verificationUrl}"
                       style="display:inline-block;padding:12px 22px;background:#45B6E8;color:white;text-decoration:none;border-radius:8px">
                       Verify my email
                    </a>
                </p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not create this account, you can ignore this email.</p>
            </div>
        `
    });
}

module.exports = {
    isEmailConfigured,
    sendVerificationEmail
};

