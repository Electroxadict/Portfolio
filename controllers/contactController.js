/* ============================================================
   controllers/contactController.js
   Handles contact form submissions:
     1. Server-side input validation
     2. Sanitize input (strip dangerous chars)
     3. Build HTML + plain-text email templates
     4. Send via Nodemailer (Gmail SMTP)
     5. Return JSON response to frontend
   ============================================================ */

import createTransporter from '../config/mailConfig.js';

/* ─────────────────────────────────────────
   HELPER: sanitizeInput
   Strips HTML tags and trims whitespace to
   prevent XSS content inside email body.
   ───────────────────────────────────────── */
const sanitizeInput = (str = '') =>
  String(str).replace(/<[^>]*>/g, '').trim();

/* ─────────────────────────────────────────
   HELPER: validateEmail
   RFC-style email format check.
   ───────────────────────────────────────── */
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ─────────────────────────────────────────
   HELPER: buildHtmlEmail
   Returns a styled HTML email template
   that matches the GRPHIWAVEMOTION neon brand.
   ───────────────────────────────────────── */
const buildHtmlEmail = ({ name, email, service, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact — GRPHIWAVEMOTION</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <div style="
          border:1px solid rgba(0,212,255,0.3);
          padding:32px;
          margin-bottom:24px;
          background:rgba(0,212,255,0.03);
        ">
          <div style="
            font-size:11px;letter-spacing:0.3em;color:#00d4ff;
            text-transform:uppercase;margin-bottom:12px;
          ">// NEW TRANSMISSION RECEIVED</div>
          <h1 style="
            color:#e8f4ff;font-size:22px;font-weight:900;
            letter-spacing:0.1em;margin:0;
          ">GRPHIWAVEMOTION</h1>
          <div style="
            width:100%;height:1px;
            background:linear-gradient(90deg,#00d4ff,#b400ff,transparent);
            margin-top:16px;
          "></div>
        </div>

        <!-- Fields -->
        <div style="margin-bottom:16px;">
          ${buildField('NAME',    name)}
          ${buildField('EMAIL',   email)}
          ${buildField('SERVICE', service)}
        </div>

        <!-- Message -->
        <div style="
          border:1px solid rgba(0,212,255,0.2);
          padding:24px;
          background:rgba(255,255,255,0.02);
          margin-bottom:24px;
        ">
          <div style="
            font-size:10px;letter-spacing:0.25em;color:#00d4ff;
            text-transform:uppercase;margin-bottom:12px;
          ">// MESSAGE</div>
          <p style="
            color:#e8f4ff;line-height:1.8;font-size:14px;
            margin:0;white-space:pre-wrap;
          ">${message}</p>
        </div>

        <!-- Footer -->
        <div style="
          font-size:10px;color:rgba(232,244,255,0.35);
          letter-spacing:0.15em;text-transform:uppercase;
          text-align:center;padding-top:16px;
          border-top:1px solid rgba(0,212,255,0.1);
        ">
          © 2025 GRPHIWAVEMOTION — AUTO-GENERATED FROM CONTACT FORM
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* Helper to render a single label/value field row */
const buildField = (label, value) => `
  <div style="
    border:1px solid rgba(0,212,255,0.15);
    padding:14px 18px;
    margin-bottom:10px;
    background:rgba(255,255,255,0.02);
    display:flex;gap:16px;align-items:center;
  ">
    <span style="
      font-size:9px;letter-spacing:0.25em;color:#00d4ff;
      text-transform:uppercase;min-width:70px;
    ">${label}</span>
    <span style="color:#e8f4ff;font-size:14px;">${value}</span>
  </div>
`;

/* ─────────────────────────────────────────
   MAIN CONTROLLER: sendContact
   Express route handler for POST /send
   ───────────────────────────────────────── */
export const sendContact = async (req, res) => {
  try {
    /* ── 1. EXTRACT & SANITIZE INPUTS ── */
    const name    = sanitizeInput(req.body.name);
    const email   = sanitizeInput(req.body.email);
    const service = sanitizeInput(req.body.service) || 'Not specified';
    const message = sanitizeInput(req.body.message);

    /* ── 2. SERVER-SIDE VALIDATION ── */
    const errors = [];

    if (!name)                    errors.push('Name is required.');
    if (!email)                   errors.push('Email is required.');
    if (email && !validateEmail(email)) errors.push('Invalid email format.');
    if (!message)                 errors.push('Message cannot be empty.');
    if (message && message.length > 5000)
      errors.push('Message exceeds maximum length of 5000 characters.');

    // Return 400 with all validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' '),
      });
    }

    /* ── 3. BUILD EMAIL OPTIONS ── */
    const mailOptions = {
      // From address shown in Gmail inbox
      from: `"GRPHIWAVEMOTION Contact" <${process.env.EMAIL_USER}>`,

      // Where to deliver the email (your inbox)
      to: process.env.EMAIL_USER,

      // Optional: reply directly to the person who contacted you
      replyTo: `"${name}" <${email}>`,

      // Email subject line
      subject: `[GRPHIWAVEMOTION] New Project Enquiry — ${service} from ${name}`,

      // Plain text fallback (for clients that don't support HTML)
      text: [
        'NEW CONTACT FORM SUBMISSION',
        '============================',
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Service: ${service}`,
        '',
        'MESSAGE:',
        message,
        '',
        '© 2025 GRPHIWAVEMOTION — Auto-generated from contact form',
      ].join('\n'),

      // Branded HTML email
      html: buildHtmlEmail({ name, email, service, message }),
    };

    /* ── 4. CREATE TRANSPORTER & SEND ── */
    const transporter = createTransporter();

    // Verify SMTP connection before sending (optional but helpful for debugging)
    await transporter.verify();

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log(`[MAIL] Message sent: ${info.messageId} | From: ${email}`);

    /* ── 5. SUCCESS RESPONSE ── */
    return res.status(200).json({
      success: true,
      message: 'Message transmitted successfully.',
      id:      info.messageId,
    });

  } catch (err) {
    /* ── 6. ERROR HANDLING ── */
    console.error('[MAIL ERROR]', err.message);

    // Distinguish SMTP auth errors from other errors for clearer messaging
    const isAuthError = err.message?.includes('Invalid login') ||
                        err.message?.includes('Username and Password');

    return res.status(500).json({
      success: false,
      message: isAuthError
        ? 'Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env'
        : 'Failed to send message. Please try again later.',
    });
  }
};
