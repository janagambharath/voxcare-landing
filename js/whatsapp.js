/**
 * whatsapp.js — VoxCare AI
 * ─────────────────────────────────────────────────────────
 * WhatsApp integration helper.
 *
 * CONFIGURE: Change VOXCARE_WHATSAPP_NUMBER below.
 * FORMAT: Country code + number, no +, spaces, or dashes.
 *   e.g. India +91 87125 31028 → "918712531028"
 *
 * What this script does:
 *  1. Defines the canonical WhatsApp number in one place.
 *  2. Builds the booking URL with a pre-filled message.
 *  3. Updates every <a class="voxcare-whatsapp"> href on the page.
 *  4. Shows the floating WhatsApp button after a 2-second delay
 *     (avoids visual noise on first load).
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ─── CONFIGURATION ─────────────────────────────────────
   * ✅ Change this number to update ALL WhatsApp links at once.
   * Format: country code + local number, digits only.
   */
  var VOXCARE_WHATSAPP_NUMBER = '918712531028';  // +91 87125 31028 (VoxCare AI)
  var VOXCARE_WHATSAPP_MESSAGE = encodeURIComponent('Hi, I want to book an appointment');
  var VOXCARE_WHATSAPP_URL = 'https://wa.me/' + VOXCARE_WHATSAPP_NUMBER + '?text=' + VOXCARE_WHATSAPP_MESSAGE;

  /* ─── 1. Update all voxcare-whatsapp links ───────────── */
  function updateWhatsAppLinks() {
    var links = document.querySelectorAll('a.voxcare-whatsapp');
    links.forEach(function (link) {
      link.href = VOXCARE_WHATSAPP_URL;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ─── 2. Show floating button after delay ────────────── */
  function initFloatingButton() {
    var floatEl = document.getElementById('wa-float');
    if (!floatEl) return;

    // Set correct href on the anchor inside the float button
    var floatLink = floatEl.querySelector('a');
    if (floatLink) {
      floatLink.href = VOXCARE_WHATSAPP_URL;
    }

    // Delay appearance — avoids competing with page load animations
    setTimeout(function () {
      floatEl.classList.add('wa-float--visible');
    }, 2000);
  }

  /* ─── 3. Expose URL globally (optional, for inline usage) */
  window.VOXCARE_WA = {
    number: VOXCARE_WHATSAPP_NUMBER,
    url: VOXCARE_WHATSAPP_URL,
  };

  /* ─── Init ───────────────────────────────────────────── */
  function init() {
    updateWhatsAppLinks();
    initFloatingButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
