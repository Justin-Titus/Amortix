import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const GMAIL_USER = env.GMAIL_USER;
const GMAIL_APP_PASSWORD = env.GMAIL_APP_PASSWORD;
const EMAIL_CONFIGURED = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

if (!EMAIL_CONFIGURED) {
  console.warn(
    "Gmail email transport is not fully configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send verification emails."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

if (EMAIL_CONFIGURED) {
  transporter.verify().then(
    () => {
      console.log("Gmail SMTP transport verified successfully.");
    },
    (error) => {
      console.error(
        "Failed to verify Gmail SMTP transport. Check GMAIL_USER and GMAIL_APP_PASSWORD:",
        error
      );
    }
  );
}

const FROM_EMAIL = `"Amortix" <${GMAIL_USER}>`;
const APP_URL = env.APP_URL;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send an email verification link to a new user
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
) {
  if (!EMAIL_CONFIGURED) {
    throw new Error(
      "Email transport is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send verification emails."
    );
  }

  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  const safeName = name ? escapeHtml(name) : "";

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your Amortix account",
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #F8FAFC;">
        <div style="background: white; border-radius: 12px; padding: 40px 32px; border: 1px solid #E2E8F0;">
          <h1 style="font-family: 'Outfit', Arial, sans-serif; color: #0D1F3C; font-size: 24px; font-weight: 500; margin: 0 0 16px;">
            Welcome to Amortix${safeName ? `, ${safeName}` : ""}!
          </h1>
          <p style="color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            Thanks for signing up. Please verify your email address to get started on your journey to smarter debt management.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
            Verify email address
          </a>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Amortix — Turn debt into a deadline.
        </p>
      </div>
    `,
  });
}

/**
 * Send a password reset link
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  if (!EMAIL_CONFIGURED) {
    throw new Error(
      "Email transport is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send password reset emails."
    );
  }

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your Amortix password",
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #F8FAFC;">
        <div style="background: white; border-radius: 12px; padding: 40px 32px; border: 1px solid #E2E8F0;">
          <h1 style="font-family: 'Outfit', Arial, sans-serif; color: #0D1F3C; font-size: 24px; font-weight: 500; margin: 0 0 16px;">
            Reset your password
          </h1>
          <p style="color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            We received a request to reset your password. Click the button below to set a new one.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
            Reset password
          </a>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
            This link expires in 1 hour. If you didn't request this, your account is safe — just ignore this email.
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Amortix — Turn debt into a deadline.
        </p>
      </div>
    `,
  });
}

/**
 * Send an EMI reminder email
 */
export async function sendEmiReminderEmail(
  email: string,
  loanName: string,
  emiAmount: number,
  dueDate: string,
  userName?: string
) {
  if (!EMAIL_CONFIGURED) {
    throw new Error(
      "Email transport is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to send notification emails."
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(emiAmount);

  const safeLoanName = escapeHtml(loanName);
  const safeDueDate = escapeHtml(dueDate);
  const safeUserName = userName ? escapeHtml(userName) : "";

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Reminder: Your ${loanName} EMI of ${formattedAmount} is due in 3 days`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #F8FAFC;">
        <div style="background: white; border-radius: 12px; padding: 40px 32px; border: 1px solid #E2E8F0;">
          <h1 style="font-family: 'Outfit', Arial, sans-serif; color: #0D1F3C; font-size: 24px; font-weight: 500; margin: 0 0 16px;">
            EMI Reminder 🔔
          </h1>
          <p style="color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 8px;">
            Hi${safeUserName ? ` ${safeUserName}` : ""},
          </p>
          <p style="color: #64748B; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            Your <strong style="color: #0D1F3C;">${safeLoanName}</strong> EMI of <strong style="color: #0D1F3C; font-family: 'JetBrains Mono', monospace;">${formattedAmount}</strong> is due on <strong style="color: #0D1F3C;">${safeDueDate}</strong>.
          </p>
          <a href="${APP_URL}/dashboard" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 15px;">
            View dashboard
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Amortix — Turn debt into a deadline.
        </p>
      </div>
    `,
  });
}
