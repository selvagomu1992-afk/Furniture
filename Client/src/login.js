/* =============================================
   JANGID — Login Page JavaScript
   Sign In / Register / Forgot Password
   ============================================= */

import './login.css';

// ─── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initPanelImage();
  initViewSwitching();
  initSignInForm();
  initRegisterForm();
  initForgotForm();
  initPasswordToggles();
  initPasswordStrength();
  initSocialButtons();
});

// ─── CURSOR ─────────────────────────────────────
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  (function tick() {
    fx += (parseFloat(cursor.style.left || 0) - fx) * 0.12;
    fy += (parseFloat(cursor.style.top  || 0) - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .social-btn, .check-label').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ─── PANEL IMAGE ────────────────────────────────
function initPanelImage() {
  const img = document.getElementById('panel-bg-img');
  if (!img) return;
  if (img.complete) img.classList.add('loaded');
  else img.addEventListener('load', () => img.classList.add('loaded'));
}

// ─── VIEW SWITCHING ─────────────────────────────
const VIEWS = ['signin', 'register', 'forgot', 'forgot-success'];

function showView(id) {
  document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${id}`);
  if (target) target.classList.add('active');
  // Scroll form panel to top
  document.getElementById('auth-panel')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function initViewSwitching() {
  document.getElementById('go-register')?.addEventListener('click',   () => showView('register'));
  document.getElementById('go-signin')?.addEventListener('click',     () => showView('signin'));
  document.getElementById('forgot-link')?.addEventListener('click',   () => showView('forgot'));
  document.getElementById('back-to-signin')?.addEventListener('click',() => showView('signin'));
  document.getElementById('back-signin-from-success')?.addEventListener('click', () => showView('signin'));
}

// ─── SIGN IN FORM ───────────────────────────────
function initSignInForm() {
  const form = document.getElementById('signin-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('signin');

    const email = document.getElementById('signin-email')?.value.trim();
    const pwd   = document.getElementById('signin-password')?.value;
    let valid = true;

    if (!email || !isValidEmail(email)) {
      showFieldError('signin-email', 'signin-email-err', 'Please enter a valid email address');
      valid = false;
    }

    if (!pwd || pwd.length < 6) {
      showFieldError('signin-password', 'signin-pwd-err', 'Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) return;

    setLoading('signin-submit-btn', true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || 'Invalid email or password');
        setLoading('signin-submit-btn', false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setLoading('signin-submit-btn', false);
      showToast('✓ Welcome back! Redirecting…');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 800);
    } catch (err) {
      showToast('Connection error. Please try again.');
      setLoading('signin-submit-btn', false);
    }
  });

  // Real-time validation
  document.getElementById('signin-email')?.addEventListener('blur', e => {
    if (e.target.value && !isValidEmail(e.target.value)) {
      showFieldError('signin-email', 'signin-email-err', 'Invalid email address');
    } else {
      clearFieldError('signin-email', 'signin-email-err');
    }
  });
}

// ─── REGISTER FORM ──────────────────────────────
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('reg');

    const fn      = document.getElementById('reg-firstname')?.value.trim();
    const ln      = document.getElementById('reg-lastname')?.value.trim();
    const email   = document.getElementById('reg-email')?.value.trim();
    const pwd     = document.getElementById('reg-password')?.value;
    const confirm = document.getElementById('reg-confirm')?.value;
    const terms   = document.getElementById('reg-terms')?.checked;
    let valid = true;

    if (!fn) { showFieldError('reg-firstname', 'reg-fn-err', 'First name is required'); valid = false; }
    if (!ln) { showFieldError('reg-lastname',  'reg-ln-err', 'Last name is required');  valid = false; }
    if (!email || !isValidEmail(email)) { showFieldError('reg-email', 'reg-email-err', 'Valid email required'); valid = false; }
    if (!pwd || pwd.length < 8)         { showFieldError('reg-password', 'reg-pwd-err', 'Min. 8 characters required'); valid = false; }
    if (pwd !== confirm)                 { showFieldError('reg-confirm', 'reg-confirm-err', 'Passwords do not match');  valid = false; }
    if (!terms) { showToast('Please accept the Terms of Service to continue'); valid = false; }

    if (!valid) return;

    setLoading('register-submit-btn', true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fn,
          lastName: ln,
          email,
          password: pwd,
          newsletter: document.getElementById('reg-newsletter')?.checked || false,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || 'Registration failed');
        setLoading('register-submit-btn', false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setLoading('register-submit-btn', false);
      showToast('✓ Account created! Welcome to Jangid.');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 800);
    } catch (err) {
      showToast('Registration failed. Please try again.');
      setLoading('register-submit-btn', false);
    }
  });

  // Real-time: confirm password match
  document.getElementById('reg-confirm')?.addEventListener('input', e => {
    const pwd = document.getElementById('reg-password')?.value;
    if (e.target.value && e.target.value !== pwd) {
      showFieldError('reg-confirm', 'reg-confirm-err', 'Passwords do not match');
    } else {
      clearFieldError('reg-confirm', 'reg-confirm-err');
    }
  });
}

// ─── FORGOT PASSWORD FORM ───────────────────────
function initForgotForm() {
  const form = document.getElementById('forgot-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim();

    if (!email || !isValidEmail(email)) {
      showFieldError('forgot-email', 'forgot-email-err', 'Please enter a valid email address');
      return;
    }

    setLoading('forgot-submit-btn', true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (_) { /* always show success to prevent email enumeration */ }

    setLoading('forgot-submit-btn', false);

    const displayEl = document.getElementById('reset-email-display');
    if (displayEl) displayEl.textContent = email;
    showView('forgot-success');
  });
}

// ─── PASSWORD TOGGLES ───────────────────────────
function initPasswordToggles() {
  setupToggle('toggle-signin-pwd', 'signin-password');
  setupToggle('toggle-reg-pwd',    'reg-password');
}

function setupToggle(btnId, inputId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.classList.toggle('active', !isText);
    // Swap icon opacity as visual cue
    const icon = btn.querySelector('.eye-icon');
    if (icon) icon.style.opacity = isText ? '1' : '0.35';
  });
}

// ─── PASSWORD STRENGTH ──────────────────────────
function initPasswordStrength() {
  const input   = document.getElementById('reg-password');
  const fill    = document.getElementById('strength-fill');
  const label   = document.getElementById('strength-label');
  const wrapper = document.getElementById('pwd-strength');
  if (!input || !fill || !label || !wrapper) return;

  input.addEventListener('input', () => {
    const val = input.value;
    if (!val) {
      wrapper.style.opacity = '0';
      return;
    }
    wrapper.style.opacity = '1';

    const score = calcStrength(val);
    const levels = [
      { pct: '20%', color: '#C44A4A', text: 'Weak' },
      { pct: '45%', color: '#D98B66', text: 'Fair' },
      { pct: '70%', color: '#D4A853', text: 'Good' },
      { pct: '100%',color: '#5A9B6F', text: 'Strong' },
    ];
    const lvl = levels[Math.min(score, 3)];
    fill.style.width      = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent     = lvl.text;
    label.style.color     = lvl.color;
  });
}

function calcStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(Math.floor(score * 4 / 5), 3);
}

// ─── SOCIAL BUTTONS ─────────────────────────────
function initSocialButtons() {
  ['google-signin-btn', 'google-register-btn', 'apple-signin-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      showToast('Social login coming soon — use email for now.');
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setLoading(btnId, loading) {
  const btn    = document.getElementById(btnId);
  if (!btn) return;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  if (loading) {
    btn.classList.add('loading');
    if (text)   text.style.display   = 'none';
    if (loader) loader.style.display = '';
  } else {
    btn.classList.remove('loading');
    if (text)   text.style.display   = '';
    if (loader) loader.style.display = 'none';
  }
}

function showFieldError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  if (input) input.classList.add('error');
  if (errEl) errEl.textContent = message;

  // Auto-clear on next input
  input?.addEventListener('input', () => {
    clearFieldError(inputId, errId);
  }, { once: true });
}

function clearFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  input?.classList.remove('error');
  if (errEl) errEl.textContent = '';
}

function clearErrors(prefix) {
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => {
    if (el.classList.contains('auth-input')) el.classList.remove('error');
    if (el.id.endsWith('-err')) el.textContent = '';
  });
}

function showToast(msg) {
  let toast = document.getElementById('lp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lp-toast';
    toast.style.cssText = `
      position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(80px);
      background:var(--walnut); color:var(--cream); padding:0.85rem 1.75rem;
      border-radius:100px; font-size:0.85rem; z-index:9999;
      box-shadow:0 8px 32px rgba(44,24,16,0.25);
      transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);
      white-space:nowrap; font-family:'Inter',sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, 3000);
}
