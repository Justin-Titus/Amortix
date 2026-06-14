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
 * Send an EMI reminder email
 */
export async function sendEmiReminderEmail(
  email: string,
  loanName: string,
  emiAmount: number,
  dueDate: string,
  daysLeft: number,
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

  // Dynamic values based on days remaining
  let badgeBg = "#D1FAE5";
  let badgeColor = "#10B981";
  let badgeText = "🔔 Upcoming Due";
  let statusText = "Due in 3 days";
  let subjectPrefix = "Upcoming";
  let urgencyText = "in 3 days";

  if (daysLeft === 0) {
    badgeBg = "#FFE4E6";
    badgeColor = "#E11D48";
    badgeText = "🚨 Due Today";
    statusText = "Due today";
    subjectPrefix = "Action Required";
    urgencyText = "today";
  } else if (daysLeft === 1) {
    badgeBg = "#FEE2E2";
    badgeColor = "#EF4444";
    badgeText = "⚠️ Due Tomorrow";
    statusText = "Due tomorrow";
    subjectPrefix = "Urgent Reminder";
    urgencyText = "tomorrow";
  } else if (daysLeft === 2) {
    badgeBg = "#FEF3C7";
    badgeColor = "#F59E0B";
    badgeText = "⏰ Due in 2 Days";
    statusText = "Due in 2 days";
    subjectPrefix = "Reminder";
    urgencyText = "in 2 days";
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `${subjectPrefix}: Your ${loanName} EMI of ${formattedAmount} is due ${urgencyText}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background-color: #F8FAFC; color: #1E293B;">
        <div style="background: white; border-radius: 16px; padding: 40px 32px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
          <!-- Logo / Header -->
          <div style="margin-bottom: 28px; text-align: left;">
            <span style="font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
              Amortix<span style="color: #10B981;">.</span>
            </span>
          </div>

          <!-- Alert Badge -->
          <div style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 24px;">
            ${badgeText}
          </div>

          <!-- Greeting -->
          <h2 style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 12px; line-height: 1.4;">
            Hi${safeUserName ? ` ${safeUserName}` : ""},
          </h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            This is a friendly reminder that the monthly installment for your loan is coming up soon. Please ensure your account has sufficient funds to avoid any automated transaction failures or late fees.
          </p>

          <!-- Loan Details Card -->
          <div style="background-color: #F8FAFC; border-radius: 12px; border: 1px solid #F1F5F9; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 12px; font-size: 14px; color: #64748B;">Loan Account</td>
                <td style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #0F172A; text-align: right;">${safeLoanName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 14px; color: #64748B; border-top: 1px solid #E2E8F0;">EMI Amount</td>
                <td style="padding: 12px 0; font-size: 16px; font-weight: 700; color: #10B981; text-align: right; border-top: 1px solid #E2E8F0; font-family: monospace;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 14px; color: #64748B; border-top: 1px solid #E2E8F0;">Due Date</td>
                <td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #0F172A; text-align: right; border-top: 1px solid #E2E8F0;">${safeDueDate}</td>
              </tr>
              <tr>
                <td style="padding-top: 12px; font-size: 14px; color: #64748B; border-top: 1px solid #E2E8F0;">Status</td>
                <td style="padding-top: 12px; font-size: 14px; font-weight: 600; color: ${badgeColor}; text-align: right; border-top: 1px solid #E2E8F0;">${statusText}</td>
              </tr>
            </table>
          </div>

          <!-- Button -->
          <div style="text-align: center; margin-bottom: 8px;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; background-color: #0F172A; color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
              Manage Payments
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0 0 4px; line-height: 1.5;">
            Amortix — Turn debt into a deadline.
          </p>
          <p style="color: #CBD5E1; font-size: 11px; margin: 0;">
            You are receiving this automated transaction alert because notifications are enabled on your account.
          </p>
        </div>
      </div>
    `,
  });
}
