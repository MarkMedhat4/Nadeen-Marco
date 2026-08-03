/* ==========================================================================
   NADEEN & MARCO — WEDDING INVITATION
   Vanilla JS behavior. No frameworks, no dependencies.
   ========================================================================== */
(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     1. LOADER
     -------------------------------------------------------------------- */
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hide"), 900);
  });
  // Safety net: never let the loader trap a slow connection forever.
  setTimeout(() => loader.classList.add("hide"), 4000);

  /* ---------------------------------------------------------------------
     2. SCROLL PROGRESS RAIL
     -------------------------------------------------------------------- */
  const railFill = document.getElementById("scrollRailFill");
  function updateScrollRail() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    railFill.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateScrollRail, { passive: true });
  updateScrollRail();

  /* ---------------------------------------------------------------------
     2b. HERO PARALLAX
     -------------------------------------------------------------------- */
  const heroSection = document.getElementById("hero");
  const heroMedia = document.querySelector(".hero-media");
  const heroContent = document.querySelector(".hero-content");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateHeroParallax() {
    if (reduceMotion) return;
    const heroHeight = heroSection.offsetHeight;
    const scrolled = window.scrollY;
    if (scrolled > heroHeight * 1.1) return; // hero long out of view, skip work
    const progress = Math.min(scrolled / heroHeight, 1);
    heroMedia.style.transform = `translateY(${progress * 15}%)`;
    heroContent.style.transform = `translateY(${progress * -40}px)`;
    heroContent.style.opacity = String(1 - progress * 0.9);
  }
  document.addEventListener("scroll", () => window.requestAnimationFrame(updateHeroParallax), { passive: true });
  updateHeroParallax();

  /* ---------------------------------------------------------------------
     3. SCROLL REVEAL (IntersectionObserver)
     -------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------------------
     4. PETAL CURSOR (desktop / fine-pointer only)
     -------------------------------------------------------------------- */
  const petal = document.getElementById("petalCursor");
  const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fineHover) {
    let px = 0, py = 0, tx = 0, ty = 0;
    document.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    (function raf() {
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      petal.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%) rotate(45deg)`;
      requestAnimationFrame(raf);
    })();
  }

  /* ---------------------------------------------------------------------
     5. BUTTON RIPPLE
     -------------------------------------------------------------------- */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.remove("rippling");
      // force reflow so the animation can restart on repeat clicks
      void btn.offsetWidth;
      btn.classList.add("rippling");
    });
  });

  /* ---------------------------------------------------------------------
     6. AMBIENT SOUND TOGGLE
     -------------------------------------------------------------------- */
  const audio = document.getElementById("ambientAudio");
  const soundToggle = document.getElementById("soundToggle");
  let audioStarted = false;

  function playAmbient() {
    audio.volume = 0.55;
    audio.play().catch(() => { /* autoplay blocked — user gesture required */ });
    soundToggle.setAttribute("aria-pressed", "true");
    audioStarted = true;
  }
  function pauseAmbient() {
    audio.pause();
    soundToggle.setAttribute("aria-pressed", "false");
  }
  soundToggle.addEventListener("click", () => {
    if (soundToggle.getAttribute("aria-pressed") === "true") {
      pauseAmbient();
    } else {
      playAmbient();
    }
  });
  // Start music the moment the guest opens the invitation.
  document.getElementById("openInvitationBtn").addEventListener("click", () => {
    if (!audioStarted) playAmbient();
  });

  /* ---------------------------------------------------------------------
     7. LIVE COUNTDOWN
     -------------------------------------------------------------------- */
  const countdownGrid = document.getElementById("countdownGrid");
  const weddingDate = new Date(countdownGrid.dataset.weddingDate).getTime();
  const elDays = document.getElementById("cdDays");
  const elHours = document.getElementById("cdHours");
  const elMins = document.getElementById("cdMins");
  const elSecs = document.getElementById("cdSecs");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tickCountdown() {
    const now = Date.now();
    let diff = weddingDate - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------------------------------------------------------------
     8. GALLERY — auto slider, dots, lightbox
     -------------------------------------------------------------------- */
  const track = document.getElementById("galleryTrack");
  const items = Array.from(track.querySelectorAll(".gallery-item"));
  const dotsWrap = document.getElementById("galleryDots");

  items.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => scrollToItem(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function scrollToItem(i) {
    items[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function syncActiveDot() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const dist = Math.abs(itemCenter - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === closest));
    return closest;
  }
  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(syncActiveDot);
  }, { passive: true });

  // Gentle auto-advance, pauses on hover/touch interaction.
  let autoSlide = null;
  let userInteracting = false;
  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(() => {
      if (userInteracting) return;
      const current = syncActiveDot();
      const next = (current + 1) % items.length;
      scrollToItem(next);
    }, 4200);
  }
  function stopAutoSlide() {
    if (autoSlide) clearInterval(autoSlide);
  }
  ["mouseenter", "touchstart"].forEach((evt) =>
    track.addEventListener(evt, () => { userInteracting = true; }, { passive: true })
  );
  ["mouseleave", "touchend"].forEach((evt) =>
    track.addEventListener(evt, () => { userInteracting = false; }, { passive: true })
  );
  startAutoSlide();

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  let currentIndex = 0;

  function openLightbox(i) {
    currentIndex = i;
    const img = items[i].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  function showRelative(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    const img = items[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  items.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showRelative(-1));
  lightboxNext.addEventListener("click", () => showRelative(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showRelative(-1);
    if (e.key === "ArrowRight") showRelative(1);
  });

  /* ---------------------------------------------------------------------
     9. RSVP — WhatsApp accept flow + decline message
     -------------------------------------------------------------------- */
  const rsvpAccept = document.getElementById("rsvpAccept");
  const rsvpDecline = document.getElementById("rsvpDecline");
  const rsvpResponse = document.getElementById("rsvpResponse");

  const WHATSAPP_NUMBER = "201551553557";
  const WHATSAPP_MESSAGE =
    "Hello Marco & Nadeen,\n\n" +
    "Congratulations! \u2764\ufe0f\n\n" +
    "I am delighted to accept your wedding invitation, and I look forward to celebrating this beautiful day with you.\n\n" +
    "See you on October 11, 2026.";

  rsvpAccept.addEventListener("click", () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, "_blank", "noopener");
    rsvpResponse.textContent = "Thank you — see you on the dance floor! \u2764\ufe0f";
  });

  rsvpDecline.addEventListener("click", () => {
    rsvpResponse.textContent = "We'll miss you — thank you for letting us know.";
  });

  /* ---------------------------------------------------------------------
     10. FLOATING HEARTS (ambient, triggered near footer)
     -------------------------------------------------------------------- */
  function spawnFloatingHeart() {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    const size = 10 + Math.random() * 14;
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
    heart.style.setProperty("--rot", (Math.random() * 40 - 20) + "deg");
    heart.style.animationDuration = 5 + Math.random() * 4 + "s";
    heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.1C.4 8.6 2 5 5.6 5c2 0 3.4 1 4.4 2.6C11 6 12.4 5 14.4 5 18 5 19.6 8.6 22 11.9 19.5 16.4 12 21 12 21z"/></svg>`;
    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }

  /* ---------------------------------------------------------------------
     11. CELEBRATION CANVAS — confetti + hearts burst on Thank You section
     -------------------------------------------------------------------- */
  const canvas = document.getElementById("celebrationCanvas");
  const ctx = canvas.getContext("2d");
  const thankyouSection = document.getElementById("thankyou");
  let confettiParticles = [];
  let celebrationRunning = false;
  let celebrationRAF = null;

  function resizeCanvas() {
    canvas.width = thankyouSection.clientWidth * devicePixelRatio;
    canvas.height = thankyouSection.clientHeight * devicePixelRatio;
    canvas.style.width = thankyouSection.clientWidth + "px";
    canvas.style.height = thankyouSection.clientHeight + "px";
  }
  window.addEventListener("resize", resizeCanvas);

  const CONFETTI_COLORS = ["#D4AF37", "#E9CB7E", "#B76E79", "#F3DCDE", "#FFFFFF"];

  function makeConfetti(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * canvas.width,
        y: -20 * devicePixelRatio - Math.random() * canvas.height * 0.4,
        w: (4 + Math.random() * 5) * devicePixelRatio,
        h: (8 + Math.random() * 8) * devicePixelRatio,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        speed: (1 + Math.random() * 2) * devicePixelRatio,
        drift: (Math.random() - 0.5) * 1.2 * devicePixelRatio,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.12,
      });
    }
    return arr;
  }

  function drawCelebration() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20) {
        p.y = -20 * devicePixelRatio;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (celebrationRunning) celebrationRAF = requestAnimationFrame(drawCelebration);
  }

  function startCelebration() {
    if (celebrationRunning) return;
    resizeCanvas();
    confettiParticles = makeConfetti(70);
    celebrationRunning = true;
    drawCelebration();

    // Fire a few floating hearts alongside the confetti.
    let heartsFired = 0;
    const heartInterval = setInterval(() => {
      spawnFloatingHeart();
      heartsFired++;
      if (heartsFired >= 10) clearInterval(heartInterval);
    }, 260);

    // Taper off the confetti after a while so it doesn't run forever.
    setTimeout(() => {
      celebrationRunning = false;
      if (celebrationRAF) cancelAnimationFrame(celebrationRAF);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);
  }

  if ("IntersectionObserver" in window) {
    const thankyouIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCelebration();
            thankyouIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    thankyouIO.observe(thankyouSection);
  }
})();
