/* ==========================================================================
   NADEEN & MARCO — WEDDING INVITATION
   Vanilla JS: loader, countdown, reveal-on-scroll, gallery + lightbox,
   RSVP, floating hearts, confetti, ambient sound toggle.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------------
     0. CONFIG — edit these two lines when you're ready to go live
     --------------------------------------------------------------------- */
  const WEDDING_DATE = new Date('2026-10-11T19:00:00');
  const GOOGLE_MAPS_LINK = ''; // paste a Google Maps share link here, e.g. "https://maps.google.com/?q=El+Qasr+Mall"

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     1. LOADING SCREEN
     --------------------------------------------------------------------- */
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    loader.classList.add('hide');
    document.body.style.overflow = '';
  };
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    // let the monogram + shimmer play out for a beat before revealing the page
    setTimeout(hideLoader, prefersReducedMotion ? 200 : 1900);
  });
  // safety net in case 'load' is delayed by slow assets
  setTimeout(hideLoader, 5000);

  /* ---------------------------------------------------------------------
     2. SCROLL PROGRESS RAIL
     --------------------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const updateScrollRail = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  };
  document.addEventListener('scroll', updateScrollRail, { passive: true });
  updateScrollRail();

  /* ---------------------------------------------------------------------
     3. SECTION CONTENT — no scroll-triggered entrance animation.
     Sections render in place; the only scroll effect on this site is the
     native CSS `scroll-behavior: smooth` set in style.css. (Previously this
     used an IntersectionObserver to fade/slide each section in as it
     entered the viewport — removed for a calmer, more stable scroll.)
     --------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
     4. LIVE COUNTDOWN
     --------------------------------------------------------------------- */
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  const tickCountdown = () => {
    const now = new Date().getTime();
    const distance = WEDDING_DATE.getTime() - now;

    if (distance <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      clearInterval(countdownTimer);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);
  };

  tickCountdown();
  const countdownTimer = setInterval(tickCountdown, 1000);

  /* ---------------------------------------------------------------------
     5. "OPEN INVITATION" BUTTON — ripple + smooth scroll (already anchor)
     --------------------------------------------------------------------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.remove('rippling');
      // force reflow so the animation can restart on repeated clicks
      void btn.offsetWidth;
      btn.classList.add('rippling');
    });
  });

  /* ---------------------------------------------------------------------
     6. GOOGLE MAPS BUTTON
     --------------------------------------------------------------------- */
  const mapButton = document.getElementById('mapButton');
  if (mapButton) {
    if (GOOGLE_MAPS_LINK) {
      mapButton.href = GOOGLE_MAPS_LINK;
    } else {
      // no link configured yet — fall back to a text search for the venue
      mapButton.href = 'https://www.google.com/maps/search/?api=1&query=El+Qasr+Mall';
    }
  }

  /* ---------------------------------------------------------------------
     7. GALLERY — horizontal track dots + lightbox
     --------------------------------------------------------------------- */
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const galleryDotsWrap = document.getElementById('galleryDots');

  galleryItems.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      galleryItems[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    galleryDotsWrap.appendChild(dot);
  });
  const galleryDots = Array.from(galleryDotsWrap.children);

  const updateActiveDot = () => {
    let closestIdx = 0;
    let closestDist = Infinity;
    const trackCenter = galleryTrack.scrollLeft + galleryTrack.clientWidth / 2;
    galleryItems.forEach((item, i) => {
      const itemCenter = item.offsetLeft + item.clientWidth / 2;
      const dist = Math.abs(itemCenter - trackCenter);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    galleryDots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
  };
  galleryTrack.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveDot);
  }, { passive: true });

  // Auto slider: gently advance the gallery every few seconds, pausing on interaction
  let autoSlideTimer = null;
  let userInteracting = false;

  const startAutoSlide = () => {
    if (prefersReducedMotion) return;
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      if (userInteracting) return;
      const itemWidth = galleryItems[0].clientWidth + 20; // + gap
      const atEnd = galleryTrack.scrollLeft + galleryTrack.clientWidth >= galleryTrack.scrollWidth - 10;
      galleryTrack.scrollTo({
        left: atEnd ? 0 : galleryTrack.scrollLeft + itemWidth,
        behavior: 'smooth'
      });
    }, 3800);
  };
  const stopAutoSlide = () => { if (autoSlideTimer) clearInterval(autoSlideTimer); };

  ['pointerdown', 'wheel', 'touchstart'].forEach((evt) => {
    galleryTrack.addEventListener(evt, () => {
      userInteracting = true;
      clearTimeout(galleryTrack._resumeTimeout);
      galleryTrack._resumeTimeout = setTimeout(() => { userInteracting = false; }, 5000);
    }, { passive: true });
  });

  const galleryIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) startAutoSlide(); else stopAutoSlide(); });
  }, { threshold: 0.3 });
  galleryIO.observe(galleryTrack);

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const showDelta = (delta) => {
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
  };

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showDelta(-1));
  lightboxNext.addEventListener('click', () => showDelta(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showDelta(-1);
    if (e.key === 'ArrowRight') showDelta(1);
  });

  /* ---------------------------------------------------------------------
     8. RSVP
     --------------------------------------------------------------------- */
  const rsvpAccept = document.getElementById('rsvpAccept');
  const rsvpDecline = document.getElementById('rsvpDecline');
  const rsvpResponse = document.getElementById('rsvpResponse');

  /* --- WhatsApp RSVP integration -----------------------------------------
     "Accept Invitation" is a real <a href="https://wa.me/..."> in the HTML,
     so it still works with JavaScript disabled (browsers just follow the
     link and open it in a new tab because of target="_blank").
     When JS *is* available, we intercept the click so we can build the
     WhatsApp link dynamically with encodeURIComponent (instead of relying
     on the static, pre-encoded href) and open it ourselves with
     window.open — this keeps the message easy to edit in one place below
     and guarantees a fresh tab on every click.
     wa.me automatically detects the device and opens the native WhatsApp
     app on Android/iPhone, or WhatsApp Web on desktop — no extra
     device-detection code is needed.
  ------------------------------------------------------------------------- */
  const WHATSAPP_PHONE = '201551553557'; // international format, no "+", no spaces
  const WHATSAPP_MESSAGE =
    'Hello Marco & Nadeen,\n\n' +
    'Congratulations! \u2764\uFE0F\n\n' +
    'I am delighted to accept your wedding invitation, and I look forward to celebrating this beautiful day with you.\n\n' +
    'See you on October 11, 2026.';

  const openWhatsAppRSVP = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
    // Open in a new tab; noopener/noreferrer for security (no window.opener access).
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  rsvpAccept.addEventListener('click', (e) => {
    e.preventDefault(); // stop the default same-tab anchor navigation; we open it ourselves above
    openWhatsAppRSVP();
    rsvpResponse.textContent = 'Thank you — we can\'t wait to celebrate with you!';
    launchFloatingHearts(18);
    launchConfettiBurst();
  });
  /* --- end WhatsApp RSVP integration -------------------------------------- */

  rsvpDecline.addEventListener('click', () => {
    rsvpResponse.textContent = 'We\'ll miss you — thank you for letting us know.';
    // Hook point: send RSVP "declined" to your backend / form service here.
  });

  /* ---------------------------------------------------------------------
     9. FLOATING HEARTS
     --------------------------------------------------------------------- */
  function launchFloatingHearts(count = 12) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        const size = 12 + Math.random() * 16;
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
        heart.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
        heart.style.animationDuration = (4 + Math.random() * 3) + 's';
        heart.innerHTML = `<svg viewBox="0 0 32 28" width="${size}" height="${size * 0.875}"><path d="M16 27 C-6 12 2 -2 16 7 C30 -2 38 12 16 27 Z"/></svg>`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 7500);
      }, i * 120);
    }
  }

  // Note: hearts + confetti now fire only from the RSVP "Accept Invitation"
  // click above — the previous scroll-triggered auto-fire (when the
  // Thank You section entered the viewport) has been removed so nothing
  // happens automatically while scrolling.

  /* ---------------------------------------------------------------------
     10. LIGHTWEIGHT CANVAS CONFETTI
     --------------------------------------------------------------------- */
  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiRAF = null;

  function resizeCanvas() {
    if (!canvas) return;
    const section = canvas.closest('section');
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#D4AF37', '#E9CB7E', '#B76E79', '#FFFFFF'];

  function launchConfettiBurst() {
    if (!ctx || prefersReducedMotion) return;
    resizeCanvas();
    const count = 60;
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: canvas.width / 2 + (Math.random() * 200 - 100),
        y: canvas.height * 0.15,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -6 - 2,
        gravity: 0.15,
        size: 4 + Math.random() * 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 140 + Math.random() * 60
      });
    }
    if (!confettiRAF) confettiLoop();
  }

  function confettiLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      const fade = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    confettiParticles = confettiParticles.filter((p) => p.life < p.maxLife && p.y < canvas.height + 40);
    if (confettiParticles.length > 0) {
      confettiRAF = requestAnimationFrame(confettiLoop);
    } else {
      confettiRAF = null;
    }
  }

  /* ---------------------------------------------------------------------
     11. AMBIENT MUSIC TOGGLE
     --------------------------------------------------------------------- */
  const soundToggle = document.getElementById('soundToggle');
  const bgMusic = document.getElementById('bgMusic');
  soundToggle.addEventListener('click', () => {
    const isPlaying = soundToggle.getAttribute('aria-pressed') === 'true';
    if (isPlaying) {
      bgMusic.pause();
      soundToggle.setAttribute('aria-pressed', 'false');
    } else {
      bgMusic.play().catch(() => { /* file not provided yet — silently ignore */ });
      soundToggle.setAttribute('aria-pressed', 'true');
    }
  });

  /* ---------------------------------------------------------------------
     12. DECORATIVE PETAL CURSOR (desktop only)
     --------------------------------------------------------------------- */
  const petalCursor = document.querySelector('.petal-cursor');
  if (petalCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      petalCursor.style.left = e.clientX + 'px';
      petalCursor.style.top = e.clientY + 'px';
    }, { passive: true });
    document.addEventListener('mouseleave', () => { petalCursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { petalCursor.style.opacity = '.55'; });
  }

})();
