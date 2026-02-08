// ==================== Configuration ====================
const CONFIG = {
  // TODO: Replace this webhook URL with your secure backend endpoint
  // Do NOT commit API keys or webhook secrets to source control
  webhookUrl: 'https://hooks.example.com/demo',
  
  // Analytics configuration
  analytics: {
    enabled: false, // Set to true when analytics is configured
    // Add your analytics provider configuration here
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
  
  // Close mobile menu when clicking a link
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
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      
      // Toggle current item
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

// Open modal
if (modalTriggers && modalOverlay) {
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (modalClose) modalClose.focus();
      
      // Track modal open event
      trackEvent('Demo', 'Modal Open', 'Demo Request');
    });
  });
}

// Close modal
function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (demoForm) {
      demoForm.reset();
      demoForm.style.display = 'block';
    }
    
    if (formSuccess) {
      formSuccess.classList.remove('active');
    }
    
    // Clear all error states
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
  }
}

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

// Escape key to close modal
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
    
    // Clear previous errors
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
    
    let isValid = true;
    
    // Validate name
    const nameInput = document.getElementById('demo-name');
    if (nameInput && !nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    // Validate organization
    const orgInput = document.getElementById('demo-org');
    if (orgInput && !orgInput.value.trim()) {
      orgInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    // Validate email
    const emailInput = document.getElementById('demo-email');
    if (emailInput && (!emailInput.value.trim() || !validateEmail(emailInput.value))) {
      emailInput.closest('.form-group').classList.add('error');
      isValid = false;
    }
    
    if (!isValid) {
      trackEvent('Demo', 'Form Validation Error', 'Demo Request');
      return;
    }
    
    // Prepare form data
    const formData = {
      name: nameInput.value.trim(),
      organization: orgInput.value.trim(),
      email: emailInput.value.trim(),
      phone: document.getElementById('demo-phone')?.value.trim() || '',
      message: document.getElementById('demo-message')?.value.trim() || '',
      timestamp: new Date().toISOString(),
      source: 'landing-page'
    };
    
    try {
      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Show success message
        if (demoForm) demoForm.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('active');
        
        // Track successful submission
        trackEvent('Demo', 'Form Submit Success', 'Demo Request');
      } else {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting your request. Please try again or contact us directly at janagambharath1107@gmail.com');
      
      // Track submission error
      trackEvent('Demo', 'Form Submit Error', error.message);
    }
  });
}

// ==================== Analytics Integration ====================
/**
 * Track events to analytics platform
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Event label
 */
function trackEvent(category, action, label) {
  if (!CONFIG.analytics.enabled) {
    console.log('Analytics event:', { category, action, label });
    return;
  }
  
  // Google Analytics example (uncomment and configure when ready)
  // if (window.ga) {
  //   window.ga('send', 'event', category, action, label);
  // }
  
  // Google Analytics 4 / gtag example
  // if (window.gtag) {
  //   window.gtag('event', action, {
  //     'event_category': category,
  //     'event_label': label
  //   });
  // }
  
  // Amplitude example
  // if (window.amplitude) {
  //   window.amplitude.getInstance().logEvent(`${category} - ${action}`, {
  //     label: label
  //   });
  // }
  
  // Segment example
  // if (window.analytics) {
  //   window.analytics.track(`${category} - ${action}`, {
  //     label: label
  //   });
  // }
}

/**
 * Track page view
 */
function trackPageView() {
  if (!CONFIG.analytics.enabled) {
    console.log('Page view tracked');
    return;
  }
  
  // Google Analytics example
  // if (window.ga) {
  //   window.ga('send', 'pageview');
  // }
  
  // Google Analytics 4 / gtag example
  // if (window.gtag) {
  //   window.gtag('event', 'page_view', {
  //     page_title: document.title,
  //     page_location: window.location.href,
  //     page_path: window.location.pathname
  //   });
  // }
  
  // Amplitude example
  // if (window.amplitude) {
  //   window.amplitude.getInstance().logEvent('Page Viewed', {
  //     path: window.location.pathname,
  //     title: document.title
  //   });
  // }
  
  // Segment example
  // if (window.analytics) {
  //   window.analytics.page();
  // }
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  // Track initial page view
  trackPageView();
  
  // Track scroll depth
  let scrollDepth = 0;
  const trackScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    
    // Track at 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && scrollDepth < milestone) {
        scrollDepth = milestone;
        trackEvent('Scroll Depth', `${milestone}%`, window.location.pathname);
      }
    });
  };
  
  // Throttle scroll tracking
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(trackScrollDepth, 100);
  });
  
  console.log('VoxCare AI landing page initialized');
});

// ==================== Export for testing ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail,
    trackEvent,
    trackPageView,
    closeModal
  };
}
