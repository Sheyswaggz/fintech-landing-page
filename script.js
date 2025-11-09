/**
 * Interactive JavaScript Features for Fintech Landing Page
 * 
 * Features:
 * - Smooth scroll navigation with fallback
 * - Mobile menu toggle functionality
 * - Form validation with real-time feedback
 * - Basic analytics tracking via localStorage
 * - Progressive enhancement support
 * - Lazy loading with Intersection Observer fallback
 * - Performance monitoring and Web Vitals tracking
 * 
 * @generated-from: task-id:TASK-003
 * @modifies: index.html
 * @dependencies: []
 */

(function() {
  'use strict';

  // Progressive enhancement check
  if (!('querySelector' in document)) {
    return;
  }

  // Configuration
  const CONFIG = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_CLASS: 'form-error',
    SUCCESS_CLASS: 'form-success',
    ACTIVE_CLASS: 'active',
    ANALYTICS_KEY: 'fintech_analytics',
    SCROLL_BEHAVIOR: 'smooth',
    SCROLL_OFFSET: 80
  };

  // State management
  const state = {
    eventListeners: [],
    isMenuOpen: false
  };

  /**
   * Initialize all features when DOM is ready
   */
  function init() {
    try {
      initSmoothScroll();
      initMobileMenu();
      initFormValidation();
      initAnalytics();
      initLazyLoading();
      initPerformanceMonitoring();
      initWebVitals();
      
      // Log successful initialization
      logEvent('page_view', { timestamp: Date.now() });
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  /**
   * Smooth scroll navigation for anchor links
   */
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      const handler = handleSmoothScroll.bind(null, link);
      link.addEventListener('click', handler);
      state.eventListeners.push({ element: link, event: 'click', handler });
    });
  }

  /**
   * Handle smooth scroll with fallback
   * @param {HTMLElement} link - Anchor link element
   * @param {Event} event - Click event
   */
  function handleSmoothScroll(link, event) {
    const href = link.getAttribute('href');
    
    // Skip if not a valid anchor
    if (!href || href === '#') {
      return;
    }

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    // Try modern smooth scroll first
    if ('scrollBehavior' in document.documentElement.style) {
      targetElement.scrollIntoView({
        behavior: CONFIG.SCROLL_BEHAVIOR,
        block: 'start'
      });
    } else {
      // Fallback for older browsers
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - CONFIG.SCROLL_OFFSET;
      window.scrollTo({
        top: targetPosition,
        behavior: CONFIG.SCROLL_BEHAVIOR
      });
    }

    // Update URL without triggering navigation
    if (history.pushState) {
      history.pushState(null, null, href);
    }

    // Track navigation
    logEvent('navigation_click', { target: targetId });
  }

  /**
   * Mobile menu toggle functionality
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.header__menu');

    if (!menuToggle || !navigation) {
      // Menu toggle not present - likely desktop only design
      return;
    }

    const handler = handleMenuToggle.bind(null, menuToggle, navigation);
    menuToggle.addEventListener('click', handler);
    state.eventListeners.push({ element: menuToggle, event: 'click', handler });

    // Close menu on escape key
    const escapeHandler = handleMenuEscape.bind(null, menuToggle, navigation);
    document.addEventListener('keydown', escapeHandler);
    state.eventListeners.push({ element: document, event: 'keydown', handler: escapeHandler });

    // Close menu when clicking outside
    const outsideClickHandler = handleOutsideClick.bind(null, menuToggle, navigation);
    document.addEventListener('click', outsideClickHandler);
    state.eventListeners.push({ element: document, event: 'click', handler: outsideClickHandler });
  }

  /**
   * Toggle mobile menu visibility
   * @param {HTMLElement} toggle - Menu toggle button
   * @param {HTMLElement} navigation - Navigation menu
   * @param {Event} event - Click event
   */
  function handleMenuToggle(toggle, navigation, event) {
    event.stopPropagation();
    state.isMenuOpen = !state.isMenuOpen;
    
    toggle.classList.toggle(CONFIG.ACTIVE_CLASS);
    navigation.classList.toggle(CONFIG.ACTIVE_CLASS);
    
    // Update ARIA attributes
    toggle.setAttribute('aria-expanded', state.isMenuOpen);
    navigation.setAttribute('aria-hidden', !state.isMenuOpen);

    logEvent('menu_toggle', { open: state.isMenuOpen });
  }

  /**
   * Close menu on escape key
   * @param {HTMLElement} toggle - Menu toggle button
   * @param {HTMLElement} navigation - Navigation menu
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleMenuEscape(toggle, navigation, event) {
    if (event.key === 'Escape' && state.isMenuOpen) {
      state.isMenuOpen = false;
      toggle.classList.remove(CONFIG.ACTIVE_CLASS);
      navigation.classList.remove(CONFIG.ACTIVE_CLASS);
      toggle.setAttribute('aria-expanded', 'false');
      navigation.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Close menu when clicking outside
   * @param {HTMLElement} toggle - Menu toggle button
   * @param {HTMLElement} navigation - Navigation menu
   * @param {Event} event - Click event
   */
  function handleOutsideClick(toggle, navigation, event) {
    if (state.isMenuOpen && !navigation.contains(event.target) && !toggle.contains(event.target)) {
      state.isMenuOpen = false;
      toggle.classList.remove(CONFIG.ACTIVE_CLASS);
      navigation.classList.remove(CONFIG.ACTIVE_CLASS);
      toggle.setAttribute('aria-expanded', 'false');
      navigation.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Form validation with real-time feedback
   */
  function initFormValidation() {
    const form = document.querySelector('.cta__form');
    
    if (!form) {
      return;
    }

    const submitHandler = handleFormSubmit.bind(null, form);
    form.addEventListener('submit', submitHandler);
    state.eventListeners.push({ element: form, event: 'submit', handler: submitHandler });

    // Real-time email validation
    const emailInput = form.querySelector('#email');
    if (emailInput) {
      const blurHandler = handleEmailBlur.bind(null, emailInput);
      emailInput.addEventListener('blur', blurHandler);
      state.eventListeners.push({ element: emailInput, event: 'blur', handler: blurHandler });

      const inputHandler = handleEmailInput.bind(null, emailInput);
      emailInput.addEventListener('input', inputHandler);
      state.eventListeners.push({ element: emailInput, event: 'input', handler: inputHandler });
    }
  }

  /**
   * Handle form submission
   * @param {HTMLFormElement} form - Form element
   * @param {Event} event - Submit event
   */
  function handleFormSubmit(form, event) {
    event.preventDefault();
    
    // Clear previous errors
    clearErrors(form);

    const emailInput = form.querySelector('#email');
    const termsCheckbox = form.querySelector('#terms');
    
    let isValid = true;

    // Validate email
    if (!emailInput || !validateEmail(emailInput.value)) {
      displayError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }

    // Validate terms checkbox
    if (!termsCheckbox || !termsCheckbox.checked) {
      displayError(termsCheckbox, 'You must agree to the Terms of Service and Privacy Policy');
      isValid = false;
    }

    if (!isValid) {
      logEvent('form_validation_failed', { timestamp: Date.now() });
      return;
    }

    // Simulate successful submission
    displaySuccess(form);
    logEvent('form_submission_success', { timestamp: Date.now() });

    // Reset form after delay
    setTimeout(() => {
      form.reset();
      clearSuccess(form);
    }, 5000);
  }

  /**
   * Handle email input blur event
   * @param {HTMLInputElement} input - Email input element
   */
  function handleEmailBlur(input) {
    if (input.value && !validateEmail(input.value)) {
      displayError(input, 'Please enter a valid email address');
    } else {
      clearFieldError(input);
    }
  }

  /**
   * Handle email input change event
   * @param {HTMLInputElement} input - Email input element
   */
  function handleEmailInput(input) {
    // Clear error on input if email becomes valid
    if (input.value && validateEmail(input.value)) {
      clearFieldError(input);
    }
  }

  /**
   * Validate email address
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if valid
   */
  function validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return CONFIG.EMAIL_REGEX.test(email.trim());
  }

  /**
   * Display error message for form field
   * @param {HTMLElement} field - Form field element
   * @param {string} message - Error message
   */
  function displayError(field, message) {
    if (!field) {
      return;
    }

    // Clear existing error
    clearFieldError(field);

    // Create error element
    const errorElement = document.createElement('span');
    errorElement.className = CONFIG.ERROR_CLASS;
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');

    // Insert error after field
    if (field.type === 'checkbox') {
      const label = field.parentElement;
      if (label) {
        label.parentElement.insertBefore(errorElement, label.nextSibling);
      }
    } else {
      field.parentElement.appendChild(errorElement);
    }

    // Add error styling to field
    field.classList.add(CONFIG.ERROR_CLASS);
    field.setAttribute('aria-invalid', 'true');
  }

  /**
   * Clear error for specific field
   * @param {HTMLElement} field - Form field element
   */
  function clearFieldError(field) {
    if (!field) {
      return;
    }

    const parent = field.type === 'checkbox' ? field.parentElement.parentElement : field.parentElement;
    const errorElement = parent.querySelector(`.${CONFIG.ERROR_CLASS}`);
    
    if (errorElement) {
      errorElement.remove();
    }

    field.classList.remove(CONFIG.ERROR_CLASS);
    field.removeAttribute('aria-invalid');
  }

  /**
   * Clear all form errors
   * @param {HTMLFormElement} form - Form element
   */
  function clearErrors(form) {
    const errorElements = form.querySelectorAll(`.${CONFIG.ERROR_CLASS}`);
    errorElements.forEach(element => element.remove());

    const invalidFields = form.querySelectorAll(`[aria-invalid="true"]`);
    invalidFields.forEach(field => {
      field.classList.remove(CONFIG.ERROR_CLASS);
      field.removeAttribute('aria-invalid');
    });
  }

  /**
   * Display success message
   * @param {HTMLFormElement} form - Form element
   */
  function displaySuccess(form) {
    const successElement = document.createElement('div');
    successElement.className = CONFIG.SUCCESS_CLASS;
    successElement.textContent = 'Thank you! Your account has been created successfully. Check your email for next steps.';
    successElement.setAttribute('role', 'status');
    successElement.setAttribute('aria-live', 'polite');

    // Insert at top of form
    form.insertBefore(successElement, form.firstChild);

    // Scroll to success message
    successElement.scrollIntoView({ behavior: CONFIG.SCROLL_BEHAVIOR, block: 'nearest' });
  }

  /**
   * Clear success message
   * @param {HTMLFormElement} form - Form element
   */
  function clearSuccess(form) {
    const successElement = form.querySelector(`.${CONFIG.SUCCESS_CLASS}`);
    if (successElement) {
      successElement.remove();
    }
  }

  /**
   * Initialize analytics tracking
   */
  function initAnalytics() {
    // Track page view
    incrementAnalytics('page_views');

    // Track button clicks using event delegation
    const clickHandler = handleAnalyticsClick;
    document.addEventListener('click', clickHandler);
    state.eventListeners.push({ element: document, event: 'click', handler: clickHandler });
  }

  /**
   * Handle analytics click tracking
   * @param {Event} event - Click event
   */
  function handleAnalyticsClick(event) {
    const target = event.target;
    
    // Track CTA button clicks
    if (target.matches('.hero__cta-button, .cta__form-button')) {
      const buttonText = target.textContent.trim();
      logEvent('cta_click', { button: buttonText });
      incrementAnalytics('cta_clicks');
    }

    // Track navigation clicks
    if (target.matches('.header__menu-link')) {
      const linkText = target.textContent.trim();
      logEvent('nav_click', { link: linkText });
      incrementAnalytics('nav_clicks');
    }
  }

  /**
   * Log analytics event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  function logEvent(eventName, data) {
    try {
      const analytics = getAnalytics();
      
      if (!analytics.events) {
        analytics.events = [];
      }

      analytics.events.push({
        name: eventName,
        data: data,
        timestamp: Date.now()
      });

      // Keep only last 100 events
      if (analytics.events.length > 100) {
        analytics.events = analytics.events.slice(-100);
      }

      saveAnalytics(analytics);
    } catch (error) {
      console.error('Analytics logging error:', error);
    }
  }

  /**
   * Increment analytics counter
   * @param {string} key - Counter key
   */
  function incrementAnalytics(key) {
    try {
      const analytics = getAnalytics();
      
      if (!analytics.counters) {
        analytics.counters = {};
      }

      analytics.counters[key] = (analytics.counters[key] || 0) + 1;
      saveAnalytics(analytics);
    } catch (error) {
      console.error('Analytics increment error:', error);
    }
  }

  /**
   * Get analytics data from localStorage
   * @returns {Object} - Analytics data
   */
  function getAnalytics() {
    try {
      const data = localStorage.getItem(CONFIG.ANALYTICS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Analytics retrieval error:', error);
      return {};
    }
  }

  /**
   * Save analytics data to localStorage
   * @param {Object} data - Analytics data
   */
  function saveAnalytics(data) {
    try {
      localStorage.setItem(CONFIG.ANALYTICS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Analytics save error:', error);
    }
  }

  /**
   * Initialize lazy loading for images
   * Fallback for browsers that don't support loading="lazy"
   */
  function initLazyLoading() {
    // Check if browser supports native lazy loading
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading is supported, no need for fallback
      return;
    }

    // Fallback: Use Intersection Observer for lazy loading
    if (!('IntersectionObserver' in window)) {
      // Browser doesn't support Intersection Observer, load all images immediately
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
      return;
    }

    // Implement Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
            logEvent('image_lazy_loaded', { src: img.src });
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  /**
   * Initialize performance monitoring
   * Track page load metrics using Navigation Timing API
   */
  function initPerformanceMonitoring() {
    // Wait for page to fully load
    window.addEventListener('load', () => {
      // Check if Performance API is available
      if (!('performance' in window) || !performance.getEntriesByType) {
        return;
      }

      try {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
          const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
          
          console.log('Page Load Time:', pageLoadTime, 'ms');
          console.log('DOM Content Loaded:', domContentLoaded, 'ms');
          
          // Log performance metrics to analytics
          logEvent('performance_metrics', {
            pageLoadTime: pageLoadTime,
            domContentLoaded: domContentLoaded,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    });
  }

  /**
   * Initialize Web Vitals tracking
   * Track FCP, LCP, and other paint metrics
   */
  function initWebVitals() {
    // Check if PerformanceObserver is available
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Track paint metrics (FCP - First Contentful Paint)
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(entry.name, entry.startTime);
          logEvent('web_vital_paint', {
            name: entry.name,
            startTime: entry.startTime,
            timestamp: Date.now()
          });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Track LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('Largest Contentful Paint:', lastEntry.startTime);
        logEvent('web_vital_lcp', {
          startTime: lastEntry.startTime,
          size: lastEntry.size,
          timestamp: Date.now()
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track CLS (Cumulative Layout Shift)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            console.log('Cumulative Layout Shift:', clsScore);
            logEvent('web_vital_cls', {
              score: clsScore,
              timestamp: Date.now()
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.error('Web Vitals tracking error:', error);
    }
  }

  /**
   * Cleanup function to remove event listeners
   */
  function cleanup() {
    state.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    state.eventListeners = [];
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Expose cleanup for testing purposes
  if (typeof window !== 'undefined') {
    window.__fintechCleanup = cleanup;
  }

})();