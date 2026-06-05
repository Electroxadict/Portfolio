/* ============================================================
   GRPHIWAVEMOTION — main.js
   All original animations preserved + upgraded contact form
   that POSTs to Express backend /send endpoint.
   ============================================================ */

/* ─────────────────────────────────────────
   CUSTOM CURSOR
   Tracks mouse position and animates three
   layered cursor rings with hover effects.
   ───────────────────────────────────────── */
const dot   = document.getElementById('cursor-dot');
const ring  = document.getElementById('cursor-ring');
const trail = document.getElementById('cursor-trail');

document.addEventListener('mousemove', e => {
  const mx = e.clientX;
  const my = e.clientY;
  // Inner dot follows instantly
  dot.style.transform   = `translate(${mx - 4}px,  ${my - 4}px)`;
  // Ring follows with CSS transition delay
  ring.style.transform  = `translate(${mx - 18}px, ${my - 18}px)`;
  // Trail follows slowest (via longer CSS transition)
  trail.style.transform = `translate(${mx - 30}px, ${my - 30}px)`;
});

// Hover effect on interactive elements
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.transform  += ' scale(1.5)';
    ring.style.borderColor = 'var(--neon-pink)';
    ring.style.boxShadow   = '0 0 16px var(--neon-pink)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.borderColor = 'var(--neon-blue)';
    ring.style.boxShadow   = '0 0 12px var(--neon-blue)';
  });
});


/* ─────────────────────────────────────────
   LOADER
   Hides the loading screen after 2.4s
   giving the animation time to complete.
   ───────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 2400);
});


/* ─────────────────────────────────────────
   HERO CANVAS — PARTICLE + WAVE SYSTEM
   Renders animated particles, connection
   lines, and sine wave overlays on a canvas.
   ───────────────────────────────────────── */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];

// Keep canvas full-size on resize
function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* Particle class — each floats with random velocity,
   color, and size. Resets when it leaves the canvas. */
class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x       = Math.random() * canvas.width;
    this.y       = Math.random() * canvas.height;
    this.vx      = (Math.random() - 0.5) * 0.5;
    this.vy      = (Math.random() - 0.5) * 0.5;
    this.size    = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.6 + 0.1;
    // Randomly assign neon color
    this.color   = Math.random() > 0.6
      ? `rgba(0,212,255,${this.opacity})`
      : Math.random() > 0.5
        ? `rgba(180,0,255,${this.opacity})`
        : `rgba(255,0,110,${this.opacity})`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Wrap back when out of bounds
    if (this.x < 0 || this.x > canvas.width  ||
        this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle  = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
  }
}

// Spawn 150 particles
for (let i = 0; i < 150; i++) particles.push(new Particle());

// Animated sine-wave time offset
let waveT = 0;

/* Three layered sine waves at different frequencies,
   amplitudes, and neon colors. */
function drawWave() {
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const amp    = 30 + i * 20;
    const freq   = 0.006 - i * 0.001;
    const yBase  = canvas.height * (0.4 + i * 0.15);
    const colors = [
      'rgba(0,212,255,0.06)',
      'rgba(180,0,255,0.05)',
      'rgba(255,0,110,0.04)'
    ];
    ctx.strokeStyle = colors[i];
    ctx.lineWidth   = 1;

    for (let x = 0; x <= canvas.width; x += 2) {
      const y = yBase
        + Math.sin(x * freq + waveT + i)            * amp
        + Math.sin(x * freq * 2 + waveT * 1.3)      * (amp * 0.4);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/* Draw faint connection lines between nearby particles
   — opacity based on proximity. */
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 80)})`;
        ctx.lineWidth   = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// Main animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWave();
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  waveT        += 0.015;
  ctx.shadowBlur = 0; // Reset shadow after particles
  requestAnimationFrame(animate);
}
animate();


/* ─────────────────────────────────────────
   SCROLL ANIMATIONS
   IntersectionObserver adds .visible class
   to .fade-in elements when they enter view.
   ───────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


/* ─────────────────────────────────────────
   PORTFOLIO FILTER
   Tabs filter cards by data-cat attribute.
   ───────────────────────────────────────── */
function filterPortfolio(btn, cat) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show / hide cards
  const cards = document.querySelectorAll('.portfolio-card');
  cards.forEach(card => {
    const match = cat === 'all' || card.dataset.cat === cat;
    card.style.display     = match ? 'block' : 'none';
    card.style.gridColumn  = '';
  });

  // Restore span-2 on first card when showing all
  if (cat === 'all') {
    const first = document.querySelector('.portfolio-card');
    if (first) first.style.gridColumn = 'span 2';
  }
}


/* ─────────────────────────────────────────
   NAV SHRINK ON SCROLL
   Reduces nav padding once user scrolls.
   ───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.padding = window.scrollY > 40
    ? '12px 60px'
    : '20px 60px';
});


/* ─────────────────────────────────────────
   CONTACT FORM — AJAX SUBMISSION
   Collects validated form data and POSTs
   it to the Express /send endpoint.
   Shows neon success/error messages inline.
   ───────────────────────────────────────── */

const contactForm = document.getElementById('contact-form');
const contactMsg  = document.getElementById('form-message');

/**
 * showMessage — displays feedback message below the form.
 * @param {string} text    - Message to show
 * @param {string} type    - 'success' | 'error'
 */
function showMessage(text, type) {
  contactMsg.textContent = text;
  contactMsg.className   = `show ${type}`;
  // Auto-hide after 5 seconds
  setTimeout(() => { contactMsg.classList.remove('show'); }, 5000);
}

/**
 * validateEmail — simple RFC-style email check.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('contact-submit');
    
    // Grab all field values
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const service = document.getElementById('contact-service').value;
    const message = document.getElementById('contact-message').value.trim();

    // Clear previous error highlights
    ['contact-name','contact-email','contact-message'].forEach(id => {
      document.getElementById(id).classList.remove('error-field');
    });

    // ── CLIENT-SIDE VALIDATION ──
    if (!name) {
      document.getElementById('contact-name').classList.add('error-field');
      showMessage('⚠ NAME FIELD IS REQUIRED', 'error');
      return;
    }
    if (!email || !validateEmail(email)) {
      document.getElementById('contact-email').classList.add('error-field');
      showMessage('⚠ VALID EMAIL ADDRESS REQUIRED', 'error');
      return;
    }
    if (!message) {
      document.getElementById('contact-message').classList.add('error-field');
      showMessage('⚠ MESSAGE FIELD CANNOT BE EMPTY', 'error');
      return;
    }

    // ── LOADING STATE ──
    const origText          = btn.innerHTML;
    btn.innerHTML           = '◈ TRANSMITTING...';
    btn.disabled            = true;
    btn.style.background    = 'linear-gradient(135deg, var(--neon-purple), var(--neon-pink))';

    try {
      // ── POST TO BACKEND ──
      // Using absolute URL to ensure it hits the Express server even if served via Live Server
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/send'
        : '/send';

      const response = await fetch(backendUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, service, message })
      });

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON response (e.g. server crash or HTML error page)
        const text = await response.text();
        throw new Error(`Server at ${response.url} returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (response.ok && data.success) {
        // ── SUCCESS STATE ──
        btn.innerHTML        = '✓ MESSAGE SENT — WE\'LL BE IN TOUCH';
        btn.style.background = 'linear-gradient(135deg, #00a86b, #00d4a0)';
        showMessage('✓ MESSAGE TRANSMITTED SUCCESSFULLY — EXPECT A REPLY WITHIN 24 HOURS', 'success');

        // Clear form fields
        contactForm.reset();

        // Reset button after 4 seconds
        setTimeout(() => {
          btn.innerHTML        = origText;
          btn.style.background = '';
          btn.disabled         = false;
        }, 4000);

      } else {
        // ── SERVER ERROR ──
        throw new Error(data.message || 'Server error');
      }

    } catch (err) {
      // ── NETWORK / UNKNOWN ERROR ──
      console.error('Form submission error:', err);
      btn.innerHTML        = '✕ TRANSMISSION FAILED';
      btn.style.background = 'linear-gradient(135deg, #7a0000, #c80000)';
      showMessage(`✕ ERROR: ${err.message || 'COULD NOT SEND MESSAGE. TRY AGAIN.'}`, 'error');

      // Reset button after 3 seconds
      setTimeout(() => {
        btn.innerHTML        = origText;
        btn.style.background = '';
        btn.disabled         = false;
      }, 3000);
    }
  });
}
