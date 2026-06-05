/* ============================================================
   config/mailConfig.js
   Nodemailer transporter configured for Gmail SMTP.
   Credentials are read from environment variables via dotenv.
   Never hard-code credentials here — use the .env file.
   ============================================================ */

import nodemailer from 'nodemailer';

/**
 * createTransporter — builds and returns a Nodemailer transport
 * object pre-configured for Gmail SMTP.
 *
 * Requirements:
 *  - Gmail account with 2-Step Verification enabled
 *  - An App Password (NOT your regular Gmail password)
 *    Generated at: https://myaccount.google.com/apppasswords
 *
 * Environment variables required (set in .env):
 *  EMAIL_USER — your Gmail address (e.g. you@gmail.com)
 *  EMAIL_PASS — your 16-character App Password
 */
const createTransporter = () => {
  // Validate that env vars are present before creating transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      'Missing EMAIL_USER or EMAIL_PASS in environment variables. ' +
      'Please configure your .env file.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',          // Gmail SMTP shorthand (host: smtp.gmail.com)
    port:    587,              // TLS port — use 465 for SSL
    secure:  false,            // false = STARTTLS (recommended for port 587)
    auth: {
      user: process.env.EMAIL_USER,   // Gmail address from .env
      pass: process.env.EMAIL_PASS,   // App Password from .env
    },
    tls: {
      // Allow self-signed certs in development; remove in strict production
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

export default createTransporter;
