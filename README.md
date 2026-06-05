# GRPHIWAVEMOTION — Backend Documentation

> Production Node.js + Express backend for the GRPHIWAVEMOTION portfolio.  
> Contact form → Nodemailer → Gmail SMTP → Your inbox.

---

## Project Structure

```
grphiwavemotion/
├── public/                    ← Static frontend (served by Express)
│   ├── index.html             ← Main HTML (forms upgraded with IDs + AJAX)
│   ├── css/
│   │   └── style.css          ← All styles (extracted from original inline CSS)
│   ├── js/
│   │   └── main.js            ← All JS (extracted + AJAX form submission added)
│   ├── images/                ← Place your images here
│   └── videos/                ← Place your videos here
│
├── routes/
│   └── contact.js             ← Express router: POST /send
│
├── controllers/
│   └── contactController.js   ← Validation, sanitization, Nodemailer logic
│
├── config/
│   └── mailConfig.js          ← Nodemailer Gmail SMTP transporter
│
├── .env                       ← Environment variables (NEVER commit to Git)
├── .gitignore
├── package.json
├── server.js                  ← Express app entry point
└── README.md
```

---

## Quick Start

### Step 1 — Install Dependencies

```bash
cd grphiwavemotion
npm install
```

### Step 2 — Configure Gmail App Password

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to: https://myaccount.google.com/apppasswords
4. Select **Mail** → **Other (Custom name)** → Name it `GRPHIWAVEMOTION`
5. Copy the 16-character password generated

### Step 3 — Set Environment Variables

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop   # paste your App Password here
```

### Step 4 — Run the Server

**Development (with auto-restart on file changes):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Open your browser at: **http://localhost:3000**

---

## API Reference

### `POST /send`

Sends a contact form email to your Gmail inbox.

**Request Body (JSON):**
```json
{
  "name":    "Alex Smith",
  "email":   "alex@example.com",
  "service": "Motion Graphics",
  "message": "I need a brand video for my startup..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message transmitted successfully.",
  "id":      "<messageId@gmail.com>"
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Name is required. Invalid email format."
}
```

**Server Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to send message. Please try again later."
}
```

### `GET /health`

Health check endpoint for deployment platforms.

```json
{ "status": "OK", "service": "GRPHIWAVEMOTION Backend", "time": "..." }
```

---

## Validation Rules

| Field   | Rule                                         |
|---------|----------------------------------------------|
| name    | Required, non-empty                          |
| email   | Required, must match email format            |
| service | Optional, defaults to "Not specified"        |
| message | Required, max 5000 characters                |

Both client-side (frontend JS) and server-side (Express controller) validation run independently for maximum security.

---

## Deployment

### Render.com (Free tier available)

1. Push project to GitHub (ensure `.env` is in `.gitignore`)
2. Go to https://render.com → New Web Service
3. Connect your repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Under **Environment Variables**, add:
   - `EMAIL_USER` = your Gmail
   - `EMAIL_PASS` = your App Password
   - `NODE_ENV`   = production
6. Deploy — Render provides a free `.onrender.com` URL

### Railway.app

1. Push to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add environment variables in the Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`

### VPS (Ubuntu/Debian)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone https://github.com/yourname/grphiwavemotion.git
cd grphiwavemotion
npm install --production

# Create .env with your credentials
nano .env

# Install PM2 (process manager — keeps server alive)
sudo npm install -g pm2
pm2 start server.js --name grphiwavemotion
pm2 startup        # auto-start on server reboot
pm2 save
```

Then configure Nginx as a reverse proxy to port 3000.

### Vercel (Serverless — limited)

Vercel is optimized for serverless functions. For a full Express server:

1. Install Vercel CLI: `npm i -g vercel`
2. Add `vercel.json` to root:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
3. Set environment variables in Vercel Dashboard
4. Run `vercel --prod`

> **Note:** For Vercel, the `/send` endpoint works great.  
> Static files in `/public` are also served correctly via the Express fallback.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Missing EMAIL_USER or EMAIL_PASS` | Edit `.env` and add your credentials |
| `Invalid login` SMTP error | Use an App Password, not your Gmail password |
| `EAUTH` error | Make sure 2-Step Verification is ON |
| Form shows "Transmission Failed" | Open browser DevTools → Network tab → check `/send` response |
| Port 3000 already in use | Change `PORT=3001` in `.env` |
| Emails going to spam | Add SPF/DKIM records or warm up Gmail account |

---

## Security Notes

- `.env` is in `.gitignore` — never commit it
- Input is sanitized server-side (HTML tags stripped)
- Request body limited to 10kb
- CORS restricted to your domain in production
- Basic security headers set on all responses
