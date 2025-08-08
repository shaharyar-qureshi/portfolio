(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const yearEl = document.getElementById('year');
  const progress = document.getElementById('progress');
  const bgCanvas = document.getElementById('bg-canvas');
  const glow = document.getElementById('cursor-glow');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navIndicator = document.getElementById('nav-indicator');

  // Apply persisted theme
  const root = document.documentElement;
  const persistedTheme = localStorage.getItem('theme');
  if (persistedTheme) root.setAttribute('data-theme', persistedTheme);

  // Theme switcher
  const themeToggle = document.getElementById('theme-toggle');
  const themeMenu = document.getElementById('theme-menu');
  if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', () => {
      const expanded = themeToggle.getAttribute('aria-expanded') === 'true';
      themeToggle.setAttribute('aria-expanded', String(!expanded));
      themeMenu.hidden = expanded;
    });
    themeMenu.querySelectorAll('.theme-swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-theme');
        if (t) {
          root.setAttribute('data-theme', t);
          localStorage.setItem('theme', t);
          themeMenu.hidden = true;
          themeToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('click', (e) => {
      if (!themeMenu.hidden && !themeMenu.contains(e.target) && e.target !== themeToggle) {
        themeMenu.hidden = true;
        themeToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Footer year
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click (mobile)
    if (nav) {
      nav.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.tagName === 'A') {
          header.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // Smooth anchor scroll with offset
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = (header?.getBoundingClientRect().height || 0) + 12;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Split text into animated spans
  document.querySelectorAll('[data-split] h1, [data-split] h2').forEach((el) => {
    const text = el.textContent || '';
    el.textContent = '';
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = (i ? ' ' : '') + word;
      span.style.animationDelay = (i * 80) + 'ms';
      el.appendChild(span);
    });
  });

  // Scroll reveal animations
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // scramble-once
          if (entry.target.matches('.scramble')) scramble(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.reveal, .scramble').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal, .scramble').forEach((el) => el.classList.add('is-visible'));
  }

  // Contact form -> mailto
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('name');
      const emailEl = document.getElementById('email');
      const messageEl = document.getElementById('message');
      const name = nameEl && 'value' in nameEl ? String(nameEl.value).trim() : '';
      const email = emailEl && 'value' in emailEl ? String(emailEl.value).trim() : '';
      const message = messageEl && 'value' in messageEl ? String(messageEl.value).trim() : '';

      const targetEmail = 'sr54390@gmail.com';
      const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'someone'}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    });
  }

  // Copy to clipboard (email/phone)
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy'), 1500);
      } catch (err) {
        console.error('Clipboard failed', err);
        btn.textContent = 'Copy failed';
        setTimeout(() => (btn.textContent = 'Copy'), 1500);
      }
    });
  });

  // Scroll progress bar & scrollspy
  const sections = ['about', 'skills', 'experience', 'projects', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  function updateProgressAndSpy() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = progressPct + '%';

    // Active link
    let activeId = '';
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.3) {
        activeId = '#' + sec.id;
        break;
      }
    }
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === activeId));

    // Move nav indicator under active link (desktop)
    if (navIndicator && activeId) {
      const activeLink = navLinks.find(l => l.getAttribute('href') === activeId);
      if (activeLink) {
        const r = activeLink.getBoundingClientRect();
        const parentR = activeLink.parentElement.parentElement.getBoundingClientRect();
        const x = r.left - parentR.left;
        navIndicator.style.transform = `translateX(${x}px)`;
        navIndicator.style.width = r.width + 'px';
      }
    }
  }
  window.addEventListener('scroll', updateProgressAndSpy, { passive: true });
  window.addEventListener('resize', updateProgressAndSpy);
  updateProgressAndSpy();

  // Ambient starfield canvas (uses neutral white; works on all themes)
  if (bgCanvas && bgCanvas.getContext && !prefersReducedMotion) {
    const ctx = bgCanvas.getContext('2d');
    let w = bgCanvas.width = window.innerWidth;
    let h = bgCanvas.height = window.innerHeight;

    const stars = [];
    const STAR_COUNT = Math.min(220, Math.floor((w * h) / 7000));
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.8 + 0.2, r: Math.random() * 1.4 + 0.2 });
    }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.z * 0.1;
        if (s.x > w + 20) s.x = -20;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.992 ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.5)';
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.07)';
        ctx.fillRect(s.x - 12 * s.z, s.y, 14 * s.z, 1);
      }
      requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
      w = bgCanvas.width = window.innerWidth;
      h = bgCanvas.height = window.innerHeight;
    });
  }

  // 3D tilt on elements with data-tilt
  const tiltEls = document.querySelectorAll('[data-tilt]');
  function applyTilt(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const max = 10; // deg
    el.style.transform = `rotateY(${dx * max}deg) rotateX(${-dy * max}deg)`;
  }
  function resetTilt(e) { e.currentTarget.style.transform = ''; }
  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', applyTilt);
    el.addEventListener('mouseleave', resetTilt);
  });

  // Parallax elements
  const parallaxEls = document.querySelectorAll('.parallax');
  function parallax() {
    const sy = window.scrollY;
    parallaxEls.forEach((el) => {
      const factor = parseFloat(el.getAttribute('data-parallax') || '0.1');
      el.style.transform = `translateY(${sy * factor * -1}px)`;
    });
  }
  window.addEventListener('scroll', parallax, { passive: true });
  parallax();

  // Magnetic buttons
  const magneticEls = document.querySelectorAll('.magnetic');
  function magnetize(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${mx * 0.12}px, ${my * 0.12}px)`;
  }
  function magnetReset(e) { e.currentTarget.style.transform = ''; }
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', magnetize);
    el.addEventListener('mouseleave', magnetReset);
  });

  // Cursor glow follower
  if (glow && !prefersReducedMotion) {
    window.addEventListener('pointermove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // Ripple effect on buttons
  document.querySelectorAll('.ripple').forEach((el) => {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const rx = (e.clientX - rect.left) + 'px';
      const ry = (e.clientY - rect.top) + 'px';
      el.style.setProperty('--rx', rx);
      el.style.setProperty('--ry', ry);
      el.classList.remove('is-rippling');
      // trigger reflow
      void el.offsetWidth;
      el.classList.add('is-rippling');
      setTimeout(() => el.classList.remove('is-rippling'), 600);
    });
  });

  // Text scramble effect
  function scramble(el) {
    const to = el.getAttribute('data-text') || el.textContent || '';
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let frame = 0;
    let output = '';
    const queue = [];
    for (let i = 0; i < to.length; i++) {
      const from = (el.textContent || '')[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      queue.push({ from, to: to[i], start, end });
    }
    function update() {
      output = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end } = queue[i];
        if (frame >= end) { complete++; output += to; }
        else if (frame >= start) { output += chars[Math.floor(Math.random() * chars.length)]; }
        else { output += from; }
      }
      el.textContent = output;
      frame++;
      if (complete < queue.length) requestAnimationFrame(update);
    }
    update();
  }

  // Spotlight mouse tracking
  document.querySelectorAll('.spotlight').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100 + '%';
      const my = ((e.clientY - r.top) / r.height) * 100 + '%';
      el.style.setProperty('--mx', mx);
      el.style.setProperty('--my', my);
    });
  });

  // Typing animation
  (function initTyping(){
    const el = document.querySelector('.type');
    if (!el) return;
    let words = [];
    try { words = JSON.parse(el.getAttribute('data-typing') || '[]'); } catch {}
    if (!words.length) return;
    let idx = 0, pos = 0, dir = 1; // dir: 1 typing, -1 deleting
    function tick(){
      const word = words[idx % words.length];
      pos += dir;
      if (pos < 0) { dir = 1; idx++; pos = 0; }
      if (pos > word.length) {
        if (words.length === 1) { el.textContent = word; return; }
        dir = -1; setTimeout(tick, 1100); return;
      }
      el.textContent = word.slice(0, pos);
      const speed = dir === 1 ? 60 + Math.random()*40 : 35 + Math.random()*30;
      setTimeout(tick, speed);
    }
    setTimeout(tick, 400);
  })();
})(); 