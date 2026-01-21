import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports (587 uses STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false, // Sometimes needed for local dev/self-signed certs compatibility
    },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export const sendInviteEmail = async (email: string, token: string) => {
    const inviteLink = `${domain}/auth/new-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "You've been invited to Connect Group",
        html: `<p>You have been invited to join the Connect Group app.</p>
             <p>Click <a href="${inviteLink}">here</a> to set your password and activate your account.</p>`,
    };

    await transporter.sendMail(mailOptions);
};
