(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Header: transparent -> solid, hide on scroll down / show up
  --------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const solidThreshold = 72;
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    header.classList.toggle("is-solid", y > solidThreshold);

    if (y > lastY && y > header.offsetHeight * 1.5) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }
    lastY = y;

    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------------------------------------------------------
     Mobile menu — background stays fully opaque at all times;
     only transform/visibility are ever animated (see styles.css).
  --------------------------------------------------------- */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuClose = document.getElementById("mobileMenuClose");

  function openMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    const firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    menuToggle.focus({ preventScroll: true });
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });
    menuClose?.addEventListener("click", closeMenu);
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* ---------------------------------------------------------
     Active nav link on scroll
  --------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = "#" + entry.target.id;
          const link = document.querySelector(`.nav-desktop a[href="${id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     Reveal-on-scroll
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Subtle hero parallax (transform only, capped, disabled on
     reduced motion). Max ~15% speed differential.
  --------------------------------------------------------- */
  const heroImg = document.querySelector(".hero-media img");
  if (heroImg && !reduceMotion) {
    let heroTicking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      const heroH = document.querySelector(".hero")?.offsetHeight || 800;
      if (y < heroH) {
        const shift = Math.min(y * 0.15, 90);
        heroImg.style.transform = `translateY(${shift}px) scale(1.08)`;
      }
      heroTicking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!heroTicking) {
          requestAnimationFrame(updateParallax);
          heroTicking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     Gallery lightbox
  --------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  let lastFocused = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    lightboxClose?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  }

  document.querySelectorAll(".mosaic-item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (img) openLightbox(img.currentSrc || img.src, img.alt);
    });
  });
  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
