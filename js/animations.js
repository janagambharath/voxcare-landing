/**
 * animations.js — VoxCare AI
 * ─────────────────────────────────────────────────────────
 * Handles three animation systems:
 *
 *  1. SCROLL REVEAL  — `.reveal-up` and `.reveal-fade`
 *     Elements start invisible (CSS). IntersectionObserver adds
 *     `.is-visible` when they enter the viewport, triggering the
 *     CSS transition defined in styles.css.
 *
 *  2. STAGGER REVEAL — `[data-stagger-children]`
 *     The parent element is observed. When visible, `.is-visible`
 *     is applied, and CSS nth-child delays cascade the children in.
 *
 *  3. COUNT-UP       — `[data-count-to]`
 *     ROI card stat numbers animate from 0 to their target value
 *     when they first enter the viewport. Uses requestAnimationFrame
 *     for smooth, performant animation. Respects prefers-reduced-motion.
 *
 * No external dependencies. Vanilla JS only.
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ─── Reduced-motion guard ──────────────────────────────
   * If the user prefers reduced motion, skip all JS animation
   * logic — CSS already handles the static fallback (opacity: 1).
   */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ─── 1 & 2: Scroll Reveal + Stagger ───────────────────
   *
   * IntersectionObserver fires once per element (threshold: 0.12,
   * meaning 12% of the element must be visible before triggering).
   * Once revealed, the observer is disconnected for that element
   * to avoid repeated triggers and save memory.
   */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make everything visible immediately
      document
        .querySelectorAll('.reveal-up, .reveal-fade, [data-stagger-children]')
        .forEach(el => el.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // fire only once
          }
        });
      },
      {
        threshold: 0.12,       // 12% visibility threshold
        rootMargin: '0px 0px -40px 0px', // slight bottom offset — feels more natural
      }
    );

    // Observe all scroll-reveal elements
    const targets = document.querySelectorAll(
      '.reveal-up, .reveal-fade, [data-stagger-children]'
    );

    targets.forEach((el) => revealObserver.observe(el));
  }

  /* ─── 3: Count-Up Animation ────────────────────────────
   *
   * Elements with `data-count-to` attribute animate their text
   * content from 0 to the specified integer. Optional `data-suffix`
   * appends a string after the number (e.g. "%", "/7", " min").
   *
   * The animation uses an easing function (easeOutCubic) for a
   * smooth deceleration that feels professional, not mechanical.
   *
   * Duration: 1800ms — long enough to feel weighty, short enough
   * not to make the user wait.
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800; // ms
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure we land exactly on target
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  function initCountUpAnimations() {
    const counterEls = document.querySelectorAll('[data-count-to]');

    if (!counterEls.length) return;

    // If reduced motion, just show final values immediately
    if (prefersReducedMotion) {
      counterEls.forEach((el) => {
        el.textContent = el.dataset.countTo + (el.dataset.suffix || '');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: set final value
      counterEls.forEach((el) => {
        el.textContent = el.dataset.countTo + (el.dataset.suffix || '');
      });
      return;
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.5 } // counter fires when mostly visible
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  }

  /* ─── Header scroll state ───────────────────────────────
   * Adds a `.scrolled` class to the header when the page scrolls
   * past 60px — allows CSS to optionally add more shadow/tint.
   * Throttled with requestAnimationFrame to keep it lightweight.
   */
  function initHeaderScrollState() {
    const header = document.querySelector('header');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─── ROI card focus accessibility ─────────────────────
   * On touch/keyboard navigation, cards should receive the same
   * visual treatment as hover. CSS :focus-within on .roi-card
   * handles this, but we also ensure ARIA roles are meaningful.
   */
  function initROICardAccessibility() {
    const roiCards = document.querySelectorAll('.roi-card');
    roiCards.forEach((card) => {
      // Cards are articles, already semantic — just ensure tabindex
      // is NOT set (they're not interactive). No additional JS needed.
      // Focusable children (none currently) will receive focus naturally.
    });
  }

  /* ─── Init ──────────────────────────────────────────────
   * Run everything after DOM is ready.
   */
  function init() {
    if (!prefersReducedMotion) {
      initScrollReveal();
    } else {
      // Reduced motion: instantly reveal all animated elements
      document
        .querySelectorAll('.reveal-up, .reveal-fade, [data-stagger-children]')
        .forEach(el => el.classList.add('is-visible'));
    }

    initCountUpAnimations();
    initHeaderScrollState();
    initROICardAccessibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init(); // DOM already ready
  }

})();
