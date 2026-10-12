import nodemailer from 'nodemailer';

interface SendPasswordResetEmailParams {
  to: string;
  name?: string;
  resetUrl: string;
  code: string;
}

let transporter: nodemailer.Transporter | null = null;

const initTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;

  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  if (email && password) {
    try {
      // Gmail App Passwords are shown with spaces but must be used without
      const cleanPassword = password.replace(/\s+/g, '');

      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: cleanPassword
        }
      });
      console.log('✅ Email transporter initialized for Qirb Alga (Gmail)');
      return transporter;
    } catch (err: any) {
      console.error('❌ Failed to create email transporter:', err?.message);
      return null;
    }
  }

  console.warn('⚠️ SMTP credentials not fully configured in environment. Using console email simulator.');
  return null;
};

/**
 * Generates an email template for Password Reset
 */
const getPasswordResetHtml = (name: string, resetUrl: string, code: string): string => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Qirb Alga Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
      font-weight: 500;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .reset-btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
    }
    .code-box {
      background-color: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .code-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1e40af;
      margin: 0;
    }
    .expiry-note {
      font-size: 13px;
      color: #e11d48;
      font-weight: 600;
      text-align: center;
      margin-top: 12px;
    }
    .divider {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 28px 0;
    }
    .fallback-link {
      font-size: 13px;
      color: #64748b;
      word-break: break-all;
      line-height: 1.5;
    }
    .fallback-link a {
      color: #2563eb;
      text-decoration: underline;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .security-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">Qirb Alga • ቅርብ አልጋ</div>
      <div class="brand-subtitle">Pension & Accommodation Booking Platform</div>
    </div>
    
    <div class="content">
      <div class="security-badge">
        🔒 Secure Password Reset Request
      </div>
      
      <div class="greeting">Hello ${name || 'Valued User'},</div>
      
      <p class="text">
        We received a request to reset the password for your account. Click the button below to choose a new password:
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" target="_blank" class="reset-btn">Reset My Password</a>
      </div>

      <div class="code-box">
        <div class="code-label">Or Enter This 6-Digit Code on the Reset Page</div>
        <div class="code-value">${code}</div>
        <div class="expiry-note">⏱️ Code and link expire in 15 minutes</div>
      </div>

      <p class="text" style="font-size: 13px; color: #64748b; margin-top: 20px;">
        If you did not request a password reset, you can safely ignore this email. Your current password remains secure and will not change.
      </p>

      <hr class="divider" />

      <div class="fallback-link">
        Button not working? Copy and paste this URL into your browser:<br>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">This email was sent by Qirb Alga Platform to secure your account.</p>
      <p style="margin: 0;">© ${currentYear} Qirb Alga. All rights reserved. Ethiopia.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async ({
  to,
  name = 'User',
  resetUrl,
  code
}: SendPasswordResetEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> => {
  const mailTransporter = initTransporter();

  console.log(`\n======================================================`);
  console.log(`🔑 PASSWORD RESET INITIATED FOR: ${to}`);
  console.log(`🔢 6-Digit Verification Code: [ ${code} ]`);
  console.log(`🔗 Direct Reset URL: ${resetUrl}`);
  console.log(`======================================================\n`);

  if (!mailTransporter) {
    console.warn(`[EMAIL SIMULATOR] Transporter unavailable. Password reset details logged to console above.`);
    return { success: true, simulated: true };
  }

  try {
    const sender = process.env.SMTP_EMAIL || 'no-reply@qirbalga.com';
    const info = await mailTransporter.sendMail({
      from: `"Qirb Alga Support" <${sender}>`,
      to,
      subject: `[Qirb Alga] Reset Your Password (Code: ${code})`,
      html: getPasswordResetHtml(name, resetUrl, code)
    });

    console.log(`✅ Password reset email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error: any) {
    console.error(`❌ Failed to send password reset email via SMTP:`, error?.message || error);
    // Don't fail the entire user flow if SMTP temporarily encounters network error,
    // as the reset token and code have been logged in the console.
    return { success: true, simulated: true };
  }
};

interface SendBookingVerificationEmailParams {
  to: string;
  name?: string;
  code: string;
}

const getBookingVerificationHtml = (name: string, code: string): string => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Booking Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .brand-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
      font-weight: 500;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .code-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px dashed #22c55e;
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .code-value {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #15803d;
      font-family: monospace;
      margin: 0;
    }
    .expiry-note {
      font-size: 13px;
      color: #16a34a;
      margin-top: 10px;
      font-weight: 500;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand-title">Qirb Alga - ቅርብ አልጋ</h1>
      <p class="brand-subtitle">Pension & Room Booking Platform</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name || 'Valued Guest'},</div>
      <p class="text">
        You are booking a room on Qirb Alga. Please use the verification code below to verify your email and complete your booking:
      </p>
      <div class="code-box">
        <div class="code-label">Your Verification Code</div>
        <div class="code-value">${code}</div>
        <div class="expiry-note">⏱️ Code valid for 10 minutes</div>
      </div>
      <p class="text" style="font-size: 13px; color: #64748b;">
        If you did not request this booking code, you can safely disregard this email.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">This email was sent by Qirb Alga Platform to verify your booking.</p>
      <p style="margin: 0;">© ${currentYear} Qirb Alga. All rights reserved. Ethiopia.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send booking verification email with OTP code
 */
export const sendBookingVerificationEmail = async ({
  to,
  name = 'Guest',
  code
}: SendBookingVerificationEmailParams): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> => {
  const mailTransporter = initTransporter();

  console.log(`\n======================================================`);
  console.log(`📩 BOOKING EMAIL OTP VERIFICATION FOR: ${to}`);
  console.log(`🔢 6-Digit Code: [ ${code} ]`);
  console.log(`======================================================\n`);

  if (!mailTransporter) {
    console.warn(`[EMAIL SIMULATOR] Transporter unavailable. Verification code logged to console above.`);
    return { success: true, simulated: true };
  }

  try {
    const sender = process.env.SMTP_EMAIL || 'no-reply@qirbalga.com';
    const info = await mailTransporter.sendMail({
      from: `"Qirb Alga" <${sender}>`,
      to,
      subject: `[Qirb Alga] Your Booking Verification Code: ${code}`,
      html: getBookingVerificationHtml(name, code)
    });

    console.log(`✅ Booking verification email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error: any) {
    console.error(`❌ Failed to send booking verification email via SMTP:`, error?.message || error);
    return { success: true, simulated: true };
  }
};

