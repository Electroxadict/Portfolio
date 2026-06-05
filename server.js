/* ============================================================
   server.js — GRPHIWAVEMOTION Backend
   Main Express application entry point.

   Responsibilities:
     - Load environment variables from .env
     - Configure middleware (CORS, JSON parsing, static files)
     - Mount API routes
     - SPA fallback (serve index.html for any unmatched route)
     - Start HTTP server
   ============================================================ */

/* ── 1. ENVIRONMENT VARIABLES ──
   Must be the very first import so all subsequent modules
   can access process.env values immediately. */
import 'dotenv/config';

import express        from 'express';
import cors           from 'cors';
import path           from 'path';
import { fileURLToPath } from 'url';

// Route module
import contactRouter  from './routes/contact.js';

/* ── 2. ES MODULE __dirname SHIM ──
   ES Modules don't expose __dirname by default.
   We recreate it from import.meta.url. */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ── 3. EXPRESS APP ── */
const app  = express();
const PORT = process.env.PORT || 3000;

/* ── 4. CORS CONFIGURATION ──
   Allows requests from any origin in development.
   In production, restrict to your actual domain:
     origin: 'https://grphiwavemotion.com'
*/
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGIN || '*')  // Set ALLOWED_ORIGIN in your host env
    : '*',                                  // Allow all in development
  methods:            ['GET', 'POST'],
  allowedHeaders:     ['Content-Type'],
};
app.use(cors(corsOptions));

/* ── 5. BODY PARSING ──
   Parse incoming JSON request bodies.
   Limit set to 10kb — more than enough for a contact form. */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── 6. SECURITY HEADERS (basic) ──
   Sets useful HTTP headers without requiring helmet. */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options',        'DENY');
  res.setHeader('X-XSS-Protection',       '1; mode=block');
  next();
});

/* ── 7. REQUEST LOGGER (development only) ──
   Logs each incoming request so you can debug in your terminal. */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* ── 8. STATIC FILES ──
   Serve everything inside /public as static assets:
     index.html → /
     css/style.css → /css/style.css
     js/main.js → /js/main.js
   Express automatically handles caching headers. */
app.use(express.static(path.join(__dirname, 'public')));

/* ── 9. API ROUTES ──
   All contact-form endpoints live under /
   (the router itself defines POST /send) */
app.use('/', contactRouter);

/* ── 10. HEALTH CHECK ENDPOINT ──
   Useful for deployment platforms (Render, Railway)
   to verify the server is running. */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status:  'OK',
    service: 'GRPHIWAVEMOTION Backend',
    time:    new Date().toISOString(),
  });
});

/* ── 11. 404 HANDLER ──
   Any unknown API route returns a JSON 404. */
app.use('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

/* ── 12. SPA FALLBACK ──
   All other GET requests (browser navigation) serve index.html.
   This lets the frontend handle its own scroll anchors (#contact etc.) */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── 13. GLOBAL ERROR HANDLER ──
   Catches any errors passed via next(err) from route handlers. */
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
  });
});

/* ── 14. START SERVER ── */
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║      GRPHIWAVEMOTION — SERVER ONLINE      ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  URL   : http://localhost:${PORT}            ║`);
  console.log(`  ║  ENV   : ${(process.env.NODE_ENV || 'development').padEnd(32)}║`);
  console.log(`  ║  MAIL  : ${(process.env.EMAIL_USER || 'NOT SET — check .env').padEnd(32)}║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});

export default app;
