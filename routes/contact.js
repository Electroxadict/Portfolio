/* ============================================================
   routes/contact.js
   Defines the contact form API route.
   Route:  POST /send
   Handler imported from contactController.js
   ============================================================ */

import { Router }       from 'express';
import { sendContact }  from '../controllers/contactController.js';

const router = Router();

/* ─────────────────────────────────────────
   POST /send
   Accepts JSON body: { name, email, service, message }
   Validates, sanitizes, and sends via Nodemailer.
   Returns: { success: boolean, message: string }
   ───────────────────────────────────────── */
router.post('/send', sendContact);

export default router;
