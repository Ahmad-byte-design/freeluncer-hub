/* ==========================================================
   Veloce Motors — Landing Page
   Vanilla JS: i18n (EN/AR + RTL), nav, reveal, form
   ========================================================== */
(function () {
  "use strict";

  var SUPPORTED = ["en", "ar"];
  var STORAGE_KEY = "veloce-lang";
  var html = document.documentElement;

  /* ------------------------------------------------------------
     1. Language handling
     ------------------------------------------------------------ */

  function readStoredLang() {
    var saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      saved = null;
    }
    if (SUPPORTED.indexOf(saved) !== -1) return saved;

    // Fall back to the browser preference
    var nav = (navigator.language || "en").toLowerCase();
    if (nav.indexOf("ar") === 0) return "ar";

    return "en";
  }

  /* Translate one element's text (and ARIA/placeholder attrs). */
  function translate(el, lang) {
    var text = el.getAttribute("data-" + lang);
    if (text !== null) el.textContent = text;

    // aria-label
    var aria = el.getAttribute("data-" + lang + "-aria");
    if (aria !== null) el.setAttribute("aria-label", aria);

    // placeholder (for inputs bound via a wrapper)
    var ph = el.getAttribute("data-" + lang + "-placeholder");
    if (ph !== null) el.setAttribute("placeholder", ph);
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";

    var nodes = document.querySelectorAll(
      "[data-en],[data-ar],[data-en-aria],[data-ar-aria],[data-en-placeholder],[data-ar-placeholder]"
    );

    for (var i = 0; i < nodes.length; i++) {
      translate(nodes[i], lang);
    }

    // Language + text direction
    var isRTL = lang === "ar";
    html.setAttribute("lang", lang);
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");

    // Toggle button state
    var btns = document.querySelectorAll(".lang-btn");
    for (var j = 0; j < btns.length; j++) {
      var active = btns[j].getAttribute("data-lang") === lang;
      btns[j].classList.toggle("is-active", active);
      btns[j].setAttribute("aria-pressed", active ? "true" : "false");
    }

    // <title>
    var titleEl = document.querySelector("title[data-en]");
    if (titleEl) titleEl.textContent = titleEl.getAttribute("data-" + lang);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* storage unavailable — language still applies for this session */
    }

    // Note: reveal state is intentionally left untouched. Swapping textContent
    // does not recreate elements, so already-revealed sections keep their
    // .is-visible class and un-revealed ones stay queued for the observer.
  }

  /* ------------------------------------------------------------
     2. Sticky header state
     ------------------------------------------------------------ */
  var header = document.getElementById("siteHeader");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 40);
  }

  /* ------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    header && header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", navToggle.getAttribute("data-" + currentLang + "-aria") || "Open menu");
    document.body.classList.remove("no-scroll");
  }

  var currentLang = "en";

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      header && header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute(
        "aria-label",
        navToggle.getAttribute("data-" + currentLang + "-aria") || "Open menu"
      );
      document.body.classList.toggle("no-scroll", open);
    });

    // Close when a link is tapped
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Close when returning to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ------------------------------------------------------------
     4. Scroll reveal
     ------------------------------------------------------------ */
  var revealEls = [];
  var observer = null;

  function revealAll() {
    // Fallback only: used when IntersectionObserver is unavailable.
    for (var i = 0; i < revealEls.length; i++) {
      revealEls[i].classList.add("is-visible");
    }
  }

  function initReveal() {
    revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------
     5. Active nav link based on scroll position
     ------------------------------------------------------------ */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list a[href^='#']"));
    if (!links.length) return;

    var sections = links
      .map(function (a) {
        return document.querySelector(a.getAttribute("href"));
      })
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ------------------------------------------------------------
     6. Animated stat counters
     ------------------------------------------------------------ */
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;

    if (!("IntersectionObserver" in window)) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    function countUp(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;

      var suffix = el.textContent.indexOf("+") !== -1 ? "+" : "";
      var start = performance.now();
      var dur = 1400;

      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        // easeOutExpo
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    nums.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ------------------------------------------------------------
     7. Test drive form
     ------------------------------------------------------------ */
  function initForm() {
    var form = document.getElementById("testDriveForm");
    if (!form) return;

    var msg = document.getElementById("formMsg");
    var dateInput = document.getElementById("date");

    // No past dates
    if (dateInput) {
      var today = new Date();
      var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      dateInput.min = iso;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));
      var invalid = required.filter(function (el) {
        var bad = !el.value.trim();
        el.classList.toggle("is-invalid", bad);
        return bad;
      });

      // Email shape check
      var email = form.querySelector('input[type="email"]');
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        email.classList.add("is-invalid");
        invalid.push(email);
      }

      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      showMsg(
        currentLang === "ar"
          ? "شكرًا لك! سيتواصل معك أحد مستشارينا خلال 24 ساعة."
          : "Thank you! One of our advisors will contact you within 24 hours.",
        true
      );

      form.reset();
    });

    // Clear the error state as soon as the user edits the field
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("is-invalid")) e.target.classList.remove("is-invalid");
    });

    function showMsg(text, show) {
      if (!msg) return;
      msg.textContent = text;
      msg.hidden = !show;
    }
  }

  /* ------------------------------------------------------------
     8. Boot
     ------------------------------------------------------------ */
  function init() {
    currentLang = readStoredLang();

    // Set direction before paint to avoid a flash of LTR Arabic
    html.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");

    applyLang(currentLang);
    initReveal();
    initScrollSpy();
    initCounters();
    initForm();

    var langBtns = document.querySelectorAll(".lang-btn");
    for (var i = 0; i < langBtns.length; i++) {
      langBtns[i].addEventListener("click", function () {
        var lang = this.getAttribute("data-lang");
        if (lang === currentLang) return;
        currentLang = lang;
        applyLang(lang);
        closeNav();
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();