/**
 * Construction Estimator - Interactive Effects
 * Adds interactive elements and effects to the website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add hover effects to table rows
  addTableRowEffects();
  
  // Add form field animations
  addFormFieldAnimations();
  
  // Add interactive card effects
  addCardInteractions();
  
  // Add parallax background effect
  setupParallaxEffect();
});

/**
 * Add hover and click effects to table rows
 */
function addTableRowEffects() {
  // Find all tables
  const tables = document.querySelectorAll('table');
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      // Add hover class for highlighting
      row.addEventListener('mouseenter', function() {
        this.classList.add('hover-highlight');
      });
      
      row.addEventListener('mouseleave', function() {
        this.classList.remove('hover-highlight');
      });
      
      // Add click effect
      row.addEventListener('click', function() {
        // Remove active class from all rows
        rows.forEach(r => r.classList.remove('active-row'));
        
        // Add active class to clicked row
        this.classList.add('active-row');
        
        // Add pulse animation
        this.classList.add('pulse-once');
        setTimeout(() => {
          this.classList.remove('pulse-once');
        }, 500);
      });
    });
  });
}

/**
 * Add animations to form fields
 */
function addFormFieldAnimations() {
  // Find all form inputs, selects, and textareas
  const formFields = document.querySelectorAll('input, select, textarea');
  
  formFields.forEach(field => {
    // Add focus effects
    field.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');
      
      // Find the label for this field
      const label = this.parentElement.querySelector('label');
      if (label) {
        label.classList.add('label-active');
      }
    });
    
    field.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focused');
      
      // Only keep label active if field has value
      if (!this.value) {
        const label = this.parentElement.querySelector('label');
        if (label) {
          label.classList.remove('label-active');
        }
      }
    });
    
    // Check if field already has value on page load
    if (field.value) {
      const label = field.parentElement.querySelector('label');
      if (label) {
        label.classList.add('label-active');
      }
    }
  });
}

/**
 * Add interactive effects to cards
 */
function addCardInteractions() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    // Add subtle 3D tilt effect on mouse move
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element
      
      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;
      
      // Apply the rotation
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    // Reset transform on mouse leave
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
}

/**
 * Setup parallax background effect
 */
function setupParallaxEffect() {
  window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    
    // Apply parallax effect to body::before (background image)
    document.body.style.setProperty('--scroll-offset', `${scrollPosition * 0.1}px`);
  });
}

/**
 * Add CSS for interactive effects
 */
function addInteractiveStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Table row effects */
    .hover-highlight {
      background-color: rgba(60, 60, 60, 0.7) !important;
    }
    
    .active-row {
      background-color: rgba(46, 125, 50, 0.2) !important;
      border-left: 3px solid var(--primary-color);
    }
    
    .pulse-once {
      animation: pulse 0.5s ease-out;
    }
    
    /* Form field effects */
    .input-focused {
      transform: translateY(-2px);
    }
    
    .label-active {
      color: var(--primary-light) !important;
      font-size: 0.9em;
      transform: translateY(-5px);
    }
    
    /* Parallax background */
    body::before {
      transform: translateY(var(--scroll-offset, 0));
    }
  `;
  
  document.head.appendChild(style);
}

// Call to add styles
addInteractiveStyles();