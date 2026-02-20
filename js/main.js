// ==================== Configuration ====================
const CONFIG = {
  // TODO: Replace this webhook URL with your secure backend endpoint
  // Do NOT commit API keys or webhook secrets to source control
  webhookUrl: 'https://hooks.example.com/demo',
  
  analytics: {
    enabled: false, // Set to true when analytics is configured
  }
};

// ==================== Mobile Navigation Toggle ====================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isActive);
  });
  
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ==================== FAQ Accordion ====================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  if (question) {
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  }
});

// ==================== Demo Modal ====================
const modalOverlay = document.querySelector('.modal-overlay');
const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
const modalClose = document.querySelector('.modal-close');
const demoForm = document.getElementById('demo-form');
const formSuccess = document.querySelector('.form-success');

if (modalTriggers && modalOverlay) {
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (modalClose) modalClose.focus();
      trackEvent('Demo', 'Modal Open', 'Demo Request');
    });
  });
}

function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (demoForm) {
      demoForm.reset();
      demoForm.style.display = 'block';
    }
    
    if (formSuccess) formSuccess.classList.remove('active');
    
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
  }
}

if (modalClose) modalClose.addEventListener('click', closeModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// ==================== Form Validation & Submission ====================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (demoForm) {
  demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
    
    let isValid = true;
    
    const nameInput = document.getElementById('demo-name');
    if (nameInput && !nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    const orgInput = document.getElementById('demo-org');
    if (orgInput && !orgInput.value.trim()) {
      orgInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    const emailInput = document.getElementById('demo-email');
    if (emailInput && (!emailInput.value.trim() || !validateEmail(emailInput.value))) {
      emailInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    if (!isValid) {
      trackEvent('Demo', 'Form Validation Error', 'Demo Request');
      return;
    }
    
    try {
      const formData = new FormData(demoForm);
      
      const response = await fetch(demoForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        if (demoForm) demoForm.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('active');
        trackEvent('Demo', 'Form Submit Success', 'Demo Request');
        console.log('✅ Demo request sent successfully!');
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (demoForm) demoForm.style.display = 'none';
      if (formSuccess) formSuccess.classList.add('active');
    }
  });
}

// ==================== Analytics ====================
function trackEvent(category, action, label) {
  if (!CONFIG.analytics.enabled) {
    console.log('Analytics event:', { category, action, label });
    return;
  }
  // Wire up your analytics provider here (GA4, Amplitude, Segment, etc.)
}

function trackPageView() {
  if (!CONFIG.analytics.enabled) {
    console.log('Page view tracked');
    return;
  }
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  trackPageView();
  
  let scrollDepth = 0;
  
  const trackScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    
    [25, 50, 75, 100].forEach(milestone => {
      if (scrollPercent >= milestone && scrollDepth < milestone) {
        scrollDepth = milestone;
        trackEvent('Scroll Depth', `${milestone}%`, window.location.pathname);
      }
    });
  };
  
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScrollDepth, 100);
  });
  
  console.log('VoxCare AI initialized');
});

// ==================== Export for testing ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateEmail, trackEvent, trackPageView, closeModal };
}
