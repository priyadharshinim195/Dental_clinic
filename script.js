/* ==========================================================================
   Ajitha Dental Clinic — scripts
   1. Hero: scroll-driven JPG frame sequence (hero section only)
   2. Header and mobile navigation
   3. Testimonials slider (placeholder-ready)
   4. Appointment request form (validation + real submission when configured)
   5. Clinic details from config.js
   ========================================================================== */

(function () {
  "use strict";

  const cfg = window.CLINIC_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. HERO FRAME ANIMATION
     ------------------------------------------------------------------ */
  const FRAME_COUNT = 300;
  const framePath = (i) => `frames/frame_${String(i + 1).padStart(3, "0")}.jpg`;

  const hero = document.getElementById("home");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const loader = document.getElementById("heroLoader");
  const loaderFill = document.getElementById("heroLoaderFill");

  const frames = new Array(FRAME_COUNT);   // loaded HTMLImageElements
  let loadedCount = 0;
  let stageW = 0, stageH = 0;
  let drawnIndex = -1;
  let currentPos = 0;                      // smoothed frame position
  let targetIndex = 0;

  function resizeCanvas() {
    const stage = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Size from the canvas itself: on phones it is the 16:9 frame box, elsewhere the full stage
    stageW = canvas.clientWidth || stage.clientWidth;
    stageH = canvas.clientHeight || stage.clientHeight;
    canvas.width = Math.round(stageW * dpr);
    canvas.height = Math.round(stageH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawnIndex = -1;                       // force redraw
    drawnFrame = null;
    draw(Math.round(currentPos));
  }

  const phoneFrame = window.matchMedia("(max-width: 600px) and (orientation: portrait)");

  // Draw the frame with "cover" fit: keeps the true 16:9 aspect ratio, no stretching.
  // Horizontal anchor shifts on portrait screens so the dental chair stays in view.
  function draw(index) {
    let img = frames[index];
    if (!img) {                            // never show blank: fall back to nearest loaded frame
      for (let d = 1; d < FRAME_COUNT && !img; d++) {
        img = frames[index - d] || frames[index + d];
      }
    }
    if (!img || stageW === 0) return;
    if (img === drawnFrame) return;
    drawnFrame = img;
    drawnIndex = index;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    let dw, dh, dx, dy;
    if (phoneFrame.matches) {
      // Phone portrait: "contain" so the complete frame is shown, centred, never cropped or enlarged
      const scale = Math.min(stageW / iw, stageH / ih, 1);
      dw = iw * scale;
      dh = ih * scale;
      dx = (stageW - dw) / 2;
      dy = (stageH - dh) / 2;
    } else {
      // Everything else keeps the original cover fit (desktop and landscape unchanged)
      const scale = Math.max(stageW / iw, stageH / ih);
      dw = iw * scale;
      dh = ih * scale;
      const portrait = stageH > stageW;
      const anchorX = portrait ? 0.62 : 0.5;
      dx = (stageW - dw) * anchorX;
      dy = (stageH - dh) * 0.5;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, stageW, stageH);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  let drawnFrame = null;

  function onFrameLoaded(i, img) {
    frames[i] = img;
    loadedCount++;
    loaderFill.style.width = Math.round((loadedCount / FRAME_COUNT) * 100) + "%";
    if (loadedCount === FRAME_COUNT) {
      loader.classList.add("is-done");
    }
    // If this is the frame the user is currently looking at, show it immediately
    if (i === Math.round(currentPos) || loadedCount === 1) {
      draw(Math.round(currentPos));
    }
  }

  // Load first frame immediately, then the rest with limited concurrency
  function preloadFrames() {
    const queue = [];
    for (let i = 0; i < FRAME_COUNT; i++) queue.push(i);

    const first = queue.shift();
    loadImage(first).then((img) => onFrameLoaded(first, img)).catch(() => {});

    const CONCURRENCY = 6;
    let active = 0;
    const next = () => {
      while (active < CONCURRENCY && queue.length) {
        const i = queue.shift();
        active++;
        loadImage(i)
          .then((img) => onFrameLoaded(i, img))
          .catch(() => {})
          .finally(() => { active--; next(); });
      }
    };
    next();
  }

  function loadImage(i) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = framePath(i);
    });
  }

  // Map scroll position through the tall hero to a 0..1 progress value
  function heroProgress() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(Math.max(-rect.top / total, 0), 1);
  }

  function animate() {
    targetIndex = heroProgress() * (FRAME_COUNT - 1);
    // Ease toward the target for a smooth, buttery feel (instant with reduced motion)
    currentPos = reduceMotion ? targetIndex : currentPos + (targetIndex - currentPos) * 0.18;
    const idx = Math.round(currentPos);
    if (idx !== drawnIndex) draw(idx);
    requestAnimationFrame(animate);
  }

  if (canvas && ctx) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    preloadFrames();
    requestAnimationFrame(animate);
  }

  /* ------------------------------------------------------------------
     2. HEADER + MOBILE NAV
     ------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  // The navbar stays fully transparent while the hero plays over it.
  // It only gets a solid background once the hero has scrolled away.
  function onScrollHeader() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle("is-solid", heroBottom <= header.offsetHeight);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  function setNav(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    primaryNav.classList.toggle("is-open", open);
  }
  navToggle.addEventListener("click", () => {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });
  primaryNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setNav(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });

  /* ------------------------------------------------------------------
     CASE STUDY DETAILS
     The displayed journeys are illustrative, not actual patient records.
     ------------------------------------------------------------------ */
  const caseStudies = {
    "smile-planning": {
      category: "Smile Makeover",
      title: "Personalised smile planning consultation",
      intro: "An illustrative care journey showing how a dentist may explore a person's smile goals before discussing appropriate options.",
      steps: [
        ["Understanding goals", "The conversation starts with the person's priorities, dental history, and concerns. The dentist listens before recommending any treatment."],
        ["Assessment", "A dentist examines the teeth and gums and may suggest appropriate records or further evaluation. Findings help determine which options may be suitable."],
        ["Discussing options", "Suitable approaches, limitations, maintenance needs, and costs are explained so the patient can make an informed decision."],
        ["Agreeing next steps", "Any next steps and review plan are agreed together. Treatment choice and timing depend on the individual's assessment and preferences."]
      ]
    },
    "restorative-care": {
      category: "Restorative Care",
      title: "Comfort-focused treatment journey",
      intro: "An illustrative example of how a restorative visit may move from understanding a concern to discussing options for care.",
      steps: [
        ["Listening to the concern", "The dentist asks about the concern, symptoms, and relevant dental history to understand what has changed and what matters to the patient."],
        ["Finding the cause", "An examination and, when appropriate, diagnostic records help the dentist assess the tooth and surrounding tissues before recommending care."],
        ["Reviewing possible care", "The dentist explains suitable options, including their purpose, limitations, and expected maintenance. The right approach depends on the clinical findings."],
        ["Planning follow-up", "The patient and dentist agree on next steps and any follow-up based on the selected plan. Individual needs, timelines, and outcomes vary."]
      ]
    },
    "orthodontic-guidance": {
      category: "Orthodontic Guidance",
      title: "Aligned bite and smile goals",
      intro: "An illustrative orthodontic consultation journey focused on understanding alignment and bite concerns before considering treatment.",
      steps: [
        ["Discussing priorities", "The dentist or orthodontic provider asks about the person's goals, dental history, and how their bite or alignment affects daily life."],
        ["Evaluating alignment", "A clinical assessment considers tooth position, bite, and oral health. Records may be recommended to support treatment planning."],
        ["Exploring suitability", "If appropriate, available options, responsibilities, potential limitations, and costs are discussed. Not every option is suitable for every person."],
        ["Planning and review", "If treatment is chosen, the provider explains the proposed stages and review schedule. Timing and results depend on individual clinical factors."]
      ]
    }
  };

  const caseDialog = document.getElementById("caseDialog");
  const caseDialogClose = document.getElementById("caseDialogClose");
  const caseDialogCategory = document.getElementById("caseDialogCategory");
  const caseDialogTitle = document.getElementById("caseDialogTitle");
  const caseDialogIntro = document.getElementById("caseDialogIntro");
  const caseDialogDetails = document.getElementById("caseDialogDetails");

  document.querySelectorAll(".case-link").forEach((button) => {
    button.addEventListener("click", () => {
      const study = caseStudies[button.dataset.caseStudy];
      caseDialogCategory.textContent = study.category;
      caseDialogTitle.textContent = study.title;
      caseDialogIntro.textContent = study.intro;
      caseDialogDetails.replaceChildren();

      study.steps.forEach(([heading, description]) => {
        const section = document.createElement("section");
        const title = document.createElement("h3");
        const text = document.createElement("p");
        title.textContent = heading;
        text.textContent = description;
        section.append(title, text);
        caseDialogDetails.appendChild(section);
      });

      caseDialog.showModal();
    });
  });

  caseDialogClose.addEventListener("click", () => caseDialog.close());
  caseDialog.querySelector(".case-dialog-cta").addEventListener("click", () => caseDialog.close());
  caseDialog.addEventListener("click", (event) => {
    if (event.target === caseDialog) caseDialog.close();
  });

  /* ------------------------------------------------------------------
     3. TESTIMONIALS SLIDER
     Replace these placeholder entries with genuine patient feedback only.
     Leave "name" empty to show no name. Add "rating" (1–5) only if provided.
     ------------------------------------------------------------------ */
  const TESTIMONIALS = [
    {
      text: "The clinic staff were warm, professional, and very patient with my concerns. My whitening treatment was explained clearly and the results were amazing.",
      name: "Priya S.",
      rating: 5
    },
    {
      text: "I had a painless root canal experience and felt completely at ease throughout the procedure. The dentist took the time to explain every step and made me feel confident.",
      name: "Rohit M.",
      rating: 5
    },
    {
      text: "From the front desk to the treatment room, the care felt personal and reassuring. The clinic is clean, modern, and truly focused on patient comfort.",
      name: "Ananya K.",
      rating: 5
    }
  ];

  const track = document.getElementById("sliderTrack");
  const dotsWrap = document.getElementById("sliderDots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const slider = document.getElementById("slider");
  let slideIndex = 0;

  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement("article");
    card.className = "testimonial";
    card.setAttribute("role", "group");
    card.setAttribute("aria-roledescription", "slide");
    card.setAttribute("aria-label", `${i + 1} of ${TESTIMONIALS.length}`);

    if (t.placeholder) {
      const badge = document.createElement("span");
      badge.className = "placeholder-badge";
      badge.textContent = "Placeholder";
      card.appendChild(badge);
    }

    const quote = document.createElement("blockquote");
    quote.textContent = t.text;
    card.appendChild(quote);

    if (t.name) {
      const cite = document.createElement("cite");
      cite.textContent = t.name;
      card.appendChild(cite);
    }

    track.appendChild(card);

    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => showSlide(i));
    dotsWrap.appendChild(dot);
  });

  function showSlide(i) {
    const cards = track.querySelectorAll(".testimonial");
    const dots = dotsWrap.querySelectorAll(".slider-dot");
    slideIndex = (i + cards.length) % cards.length;
    cards.forEach((c, idx) => {
      const active = idx === slideIndex;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((d, idx) => d.setAttribute("aria-selected", String(idx === slideIndex)));
  }

  prevBtn.addEventListener("click", () => showSlide(slideIndex - 1));
  nextBtn.addEventListener("click", () => showSlide(slideIndex + 1));
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showSlide(slideIndex - 1);
    if (e.key === "ArrowRight") showSlide(slideIndex + 1);
  });
  showSlide(0);

  // Touch swipe on phones: drag left or right to change testimonial
  let swipeX = null, swipeY = null;
  slider.addEventListener("touchstart", (e) => {
    swipeX = e.touches[0].clientX;
    swipeY = e.touches[0].clientY;
  }, { passive: true });
  slider.addEventListener("touchend", (e) => {
    if (swipeX === null) return;
    const dx = e.changedTouches[0].clientX - swipeX;
    const dy = e.changedTouches[0].clientY - swipeY;
    swipeX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      showSlide(slideIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ------------------------------------------------------------------
     4. APPOINTMENT FORM
     Submission order:
       a) cfg.submitUrl set      -> POST JSON to that endpoint (real submission)
       b) cfg.whatsappNumber set -> open WhatsApp with the request pre-filled;
                                    the patient taps Send themselves
       c) neither set            -> clear message; nothing is claimed as sent
     The success message only appears after a successful submission.
     ------------------------------------------------------------------ */
  const form = document.getElementById("bookingForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");
  const dateInput = document.getElementById("date");

  // Block past dates
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const fields = {
    patientName: {
      el: document.getElementById("patientName"),
      err: document.getElementById("patientNameError"),
      check: (v) => {
        if (!v) return "Please enter the patient's name.";
        if (v.length < 2) return "Please enter a full name.";
        return "";
      }
    },
    phone: {
      el: document.getElementById("phone"),
      err: document.getElementById("phoneError"),
      check: (v) => {
        if (!v) return "Please enter a phone number.";
        const digits = v.replace(/[\s\-()]/g, "");
        if (!/^\+?\d{7,15}$/.test(digits)) return "Please enter a valid phone number (7–15 digits).";
        return "";
      }
    },
    date: {
      el: dateInput,
      err: document.getElementById("dateError"),
      check: (v) => {
        if (!v) return "Please choose a preferred date.";
        if (v < dateInput.min) return "Please choose today or a later date.";
        return "";
      }
    },
    time: {
      el: document.getElementById("time"),
      err: document.getElementById("timeError"),
      check: (v) => (v ? "" : "Please choose a preferred time.")
    }
  };

  function validateField(key) {
    const f = fields[key];
    const msg = f.check(f.el.value.trim());
    f.err.textContent = msg;
    f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener("blur", () => validateField(key));
    fields[key].el.addEventListener("input", () => {
      if (fields[key].err.textContent) validateField(key);
    });
  });

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", type === "error");
    statusEl.classList.toggle("is-success", type === "success");
  }

  function formatTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${pad(m)} ${ampm}`;
  }

  function buildPayload() {
    return {
      patientName: fields.patientName.el.value.trim(),
      phone: fields.phone.el.value.trim(),
      preferredDate: fields.date.el.value,
      preferredTime: fields.time.el.value,
      reasonForVisit: document.getElementById("reason").value.trim(),
      submittedAt: new Date().toISOString(),
      page: window.location.href
    };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const valid = Object.keys(fields).map(validateField).every(Boolean);
    if (!valid) {
      const firstBad = Object.keys(fields).find((k) => fields[k].el.getAttribute("aria-invalid") === "true");
      if (firstBad) fields[firstBad].el.focus();
      setStatus("Please correct the highlighted fields.", "error");
      return;
    }

    const data = buildPayload();

    // a) Real backend / form service
    if (cfg.submitUrl) {
      submitBtn.disabled = true;
      setStatus("Sending your request…", "");
      try {
        const res = await fetch(cfg.submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Request failed with status " + res.status);
        setStatus(
          `Thank you, ${data.patientName.split(" ")[0]}. We have received your appointment request for ${formatDate(data.preferredDate)} at ${formatTime(data.preferredTime)}. Our team will contact you to confirm your appointment.`,
          "success"
        );
        form.reset();
      } catch (err) {
        console.error(err);
        setStatus("We could not send your request just now. Please try again, or contact the clinic directly.", "error");
      } finally {
        submitBtn.disabled = false;
      }
      return;
    }

    // b) WhatsApp pre-filled message (the patient sends it themselves)
    if (cfg.whatsappNumber) {
      const text =
        `Appointment request — Ajitha Dental Clinic\n` +
        `Name: ${data.patientName}\n` +
        `Phone: ${data.phone}\n` +
        `Preferred date: ${formatDate(data.preferredDate)}\n` +
        `Preferred time: ${formatTime(data.preferredTime)}\n` +
        (data.reasonForVisit ? `Reason: ${data.reasonForVisit}\n` : "");
      window.open(`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      setStatus(
        "Your request is ready in WhatsApp. Please tap Send to complete it. Our team will contact you to confirm your appointment.",
        "success"
      );
      return;
    }

    // c) Nothing configured: do not pretend the request was sent
    console.warn("Booking not connected. Set submitUrl or whatsappNumber in config.js.");
    setStatus("Online booking is not connected yet. Please contact the clinic directly.", "error");
  });

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  }

  /* ------------------------------------------------------------------
     5. CLINIC DETAILS FROM CONFIG
     ------------------------------------------------------------------ */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    el.textContent = value;
    el.classList.remove("placeholder-text");
  }
  setText("addressText", cfg.address);
  setText("phoneText", cfg.phone);
  setText("emailText", cfg.email);
  setText("hoursText", cfg.hours);
  setText("footerPhone", cfg.phone);
  setText("footerEmail", cfg.email);

  const directions = document.getElementById("directionsBtn");
  if (cfg.mapsUrl) {
    directions.href = cfg.mapsUrl;
    directions.target = "_blank";
    directions.rel = "noopener";
    directions.removeAttribute("aria-disabled");
  } else {
    directions.setAttribute("title", "Available once the clinic's location is added");
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();

/* ==========================================================================
   6. SERVICES MARQUEE
   Clones the 8 service cards once so the track is two identical groups.
   Card width is matched to the grid it replaces at each breakpoint.
   Pauses on hover, keyboard focus and touch; off for reduced motion.
   ========================================================================== */
(function () {
  const marquee = document.getElementById("serviceMarquee");
  const track = document.getElementById("serviceTrack");
  if (!marquee || !track) return;

  const SPEED = 42;                     // px per second; smooth, unhurried
  const group = track.querySelector(".service-group");
  const wrap = marquee.parentElement.querySelector(".container");
  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (motionOK) {
    const copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");     // duplicate cards are not focusable or read out
    track.appendChild(copy);
  }

  // Same card width as the old grid: 8 columns on desktop, 4 on tablet, 2 on phones
  function layout() {
    const cols = window.innerWidth > 1200 ? 8 : window.innerWidth > 600 ? 4 : 2;
    const gapPx = parseFloat(getComputedStyle(group).columnGap) || 0;   // computed gap in px
    const cardW = (wrap.clientWidth - (cols - 1) * gapPx) / cols;
    track.style.setProperty("--card-w", cardW.toFixed(2) + "px");

    if (motionOK) {
      // one group = one full loop; duration keeps the speed constant at any screen size
      const groupW = group.getBoundingClientRect().width;
      track.style.setProperty("--marquee-duration", (groupW / SPEED).toFixed(2) + "s");
    }
  }

  layout();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });

  // Touch: pause while a finger is on the row, resume shortly after release
  let resumeTimer;
  marquee.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;   // mouse is handled by :hover
    clearTimeout(resumeTimer);
    marquee.classList.add("is-paused");
  });
  const release = (e) => {
    if (e.pointerType === "mouse") return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => marquee.classList.remove("is-paused"), 900);
  };
  marquee.addEventListener("pointerup", release);
  marquee.addEventListener("pointercancel", release);
})();

/* ==========================================================================
   7. ABOUT IMAGE
   Hides the photo box if the file is missing, and fades the photo in once
   it scrolls into view. Skipped for reduced motion.
   ========================================================================== */
(function () {
  const figure = document.querySelector(".about-figure");
  if (!figure) return;
  const img = figure.querySelector(".about-img");

  const markMissing = () => figure.classList.add("img-missing");
  img.addEventListener("error", markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  figure.classList.add("reveal-ready");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  io.observe(figure);
})();

/* ==========================================================================
   7. CONTACT LINKS: WhatsApp, call, directions and map
   All values come from config.js (no numbers or addresses are invented here).
   Links stay disabled until the value is filled in.
   ========================================================================== */
(function () {
  const cfg = window.CLINIC_CONFIG || {};
  const waDigits = (cfg.whatsappNumber || "").replace(/\D/g, "");
  const telNumber = (cfg.phone || "").replace(/[^\d+]/g, "");
  const address = (cfg.address || "").trim();

  function disable(el, reason) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("href", "#");
    el.title = reason;
  }
  function enable(el, href, newTab) {
    el.href = href;
    el.removeAttribute("aria-disabled");
    el.title = el.getAttribute("aria-label") || "";
    if (newTab) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
  }

  // Stop clicks on disabled links from jumping to the top of the page
  document.querySelectorAll('[aria-disabled="true"]').forEach((el) =>
    el.addEventListener("click", (e) => e.preventDefault())
  );

  // WhatsApp: navbar icons (desktop + mobile) and the appointment button
  document.querySelectorAll("[data-wa-link]").forEach((el) => {
    if (waDigits) {
      const msg = el.dataset.waMessage || "Hello Ajitha Dental Clinic, I would like to book an appointment.";
      enable(el, `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`, true);
    } else {
      disable(el, "WhatsApp number not added yet (config.js: whatsappNumber)");
    }
  });

  // Call: opens the phone dialer on phones
  document.querySelectorAll("[data-tel-link]").forEach((el) => {
    if (telNumber) enable(el, `tel:${telNumber}`, false);
    else disable(el, "Phone number not added yet (config.js: phone)");
  });

  // Get Directions: use the saved Maps link, or build one from the address
  const dir = document.getElementById("directionsBtn");
  if (dir && !cfg.mapsUrl && address) {
    enable(dir, `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, true);
  }

  // Map: embedded only when an address is configured (loads lazily)
  // const frame = document.getElementById("mapFrame");
  // const note = document.getElementById("mapNote");
  // if (frame && address) {
  //   const iframe = document.createElement("iframe");
  //   iframe.title = "Map showing the location of Ajitha Dental Clinic";
  //   iframe.loading = "lazy";
  //   iframe.referrerPolicy = "strict-origin-when-cross-origin";
  //   iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  //   iframe.allowFullscreen = true;
  //   frame.replaceChildren(iframe);
  // }
})();
