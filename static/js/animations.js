/**
 * Construction Estimator - Animations
 * Handles animation triggers and timing
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations
  initAnimations();
  
  // Add scroll-triggered animations
  addScrollAnimations();
  
  // Initialize estimate cards in estimates.html
  initEstimateCards();
});

/**
 * Initialize animations on page load
 */
function initAnimations() {
  // Immediately make all sections visible first to ensure content is displayed
  const allSections = document.querySelectorAll('.section-animate, .customer-info, .materials, .totals, .supplier-suggestions');
  allSections.forEach(section => {
    section.style.opacity = '1';
    section.style.transform = 'translateY(0)';
    section.style.visibility = 'visible';
  });
  
  // Make sure all content is visible
  document.querySelectorAll('.info-grid, .materials-table, .totals-grid, .supplier-list').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
  });
  
  // Then apply animations with proper delays if elements exist
  const customerInfo = document.querySelector('.customer-info');
  const materials = document.querySelector('.materials');
  const totals = document.querySelector('.totals');
  const supplierSuggestions = document.querySelector('.supplier-suggestions');
  
  // Apply subtle animations with proper delays if elements exist
  if (customerInfo) {
    customerInfo.classList.add('fade-in');
  }
  
  if (materials) {
    materials.classList.add('fade-in');
  }
  
  if (totals) {
    totals.classList.add('fade-in');
  }
  
  if (supplierSuggestions) {
    supplierSuggestions.classList.add('fade-in');
  }
  
  // Animate floating elements
  animateFloatingElements();
  
  // Animate pulsing elements
  animatePulsingElements();
}

/**
 * Add animations triggered by scrolling
 */
function addScrollAnimations() {
  // Get all elements that should animate on scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class when element is visible
        entry.target.classList.add('animated');
        // Stop observing after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null, // viewport
    threshold: 0.1, // 10% of element must be visible
    rootMargin: '0px 0px -50px 0px' // trigger slightly before element is in view
  });
  
  // Observe each element
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Animate floating elements
 */
function animateFloatingElements() {
  const floatingElements = document.querySelectorAll('.float');
  
  floatingElements.forEach(element => {
    // Add random animation delay
    const delay = Math.random() * 2;
    element.style.animationDelay = `${delay}s`;
  });
}

/**
 * Animate pulsing elements
 */
function animatePulsingElements() {
  const pulsingElements = document.querySelectorAll('.pulse');
  
  pulsingElements.forEach(element => {
    // Add random animation delay
    const delay = Math.random() * 2;
    element.style.animationDelay = `${delay}s`;
  });
}

/**
 * Add typing animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed in milliseconds
 */
function typeText(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

/**
 * Initialize estimate cards in estimates.html
 */
function initEstimateCards() {
  const estimateCards = document.querySelectorAll('.estimate-card');
  
  estimateCards.forEach((card, index) => {
    // Add staggered animation
    setTimeout(() => {
      card.classList.add('animated');
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * (index + 1));
  });
}

// Add typing animation to elements with .typing class
document.addEventListener('DOMContentLoaded', function() {
  const typingElements = document.querySelectorAll('.typing');
  
  typingElements.forEach(element => {
    const text = element.textContent;
    typeText(element, text);
  });
});