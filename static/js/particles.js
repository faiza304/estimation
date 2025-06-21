/**
 * Construction Estimator - Particles Background
 * Creates an animated particle background effect
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create canvas element for particles
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-background';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);
  
  // Initialize particles
  initParticles();
});

function initParticles() {
  const canvas = document.getElementById('particles-background');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Particle settings
  const particleCount = 50;
  const particles = [];
  const colors = [
    'rgba(46, 125, 50, 0.5)',   // Primary color
    'rgba(96, 173, 94, 0.4)',   // Primary light
    'rgba(0, 80, 5, 0.3)',      // Primary dark
    'rgba(2, 136, 209, 0.3)',   // Info color
    'rgba(245, 124, 0, 0.3)'    // Warning color
  ];
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
  
  // Add connection lines between particles
  function drawConnections() {
    const maxDistance = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / maxDistance);
          
          ctx.beginPath();
          ctx.strokeStyle = `rgba(46, 125, 50, ${opacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }
  
  // Draw particles
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first
    drawConnections();
    
    // Draw particles
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX = -particle.speedX;
      }
      
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY = -particle.speedY;
      }
    });
    
    requestAnimationFrame(drawParticles);
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  // Add mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let isMouseMoving = false;
  let mouseTimeout;
  
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseMoving = true;
    
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => {
      isMouseMoving = false;
    }, 100);
  });
  
  // Add interactive particle that follows mouse
  const mouseParticle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 0,
    targetRadius: 8,
    color: 'rgba(46, 125, 50, 0.3)',
    speedX: 0,
    speedY: 0
  };
  
  function updateMouseParticle() {
    if (isMouseMoving) {
      // Gradually move toward mouse position
      mouseParticle.x += (mouseX - mouseParticle.x) * 0.1;
      mouseParticle.y += (mouseY - mouseParticle.y) * 0.1;
      mouseParticle.radius += (mouseParticle.targetRadius - mouseParticle.radius) * 0.1;
    } else {
      // Gradually reduce size when not moving
      mouseParticle.radius *= 0.95;
    }
    
    // Draw mouse particle
    ctx.beginPath();
    ctx.arc(mouseParticle.x, mouseParticle.y, mouseParticle.radius, 0, Math.PI * 2);
    ctx.fillStyle = mouseParticle.color;
    ctx.fill();
    
    // Draw connections to nearby particles
    const maxDistance = 200;
    
    for (let i = 0; i < particles.length; i++) {
      const dx = mouseParticle.x - particles[i].x;
      const dy = mouseParticle.y - particles[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < maxDistance) {
        // Calculate opacity based on distance
        const opacity = 1 - (distance / maxDistance);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(46, 125, 50, ${opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.moveTo(mouseParticle.x, mouseParticle.y);
        ctx.lineTo(particles[i].x, particles[i].y);
        ctx.stroke();
        
        // Add slight attraction to mouse
        const forceX = dx * 0.0005;
        const forceY = dy * 0.0005;
        particles[i].speedX += forceX;
        particles[i].speedY += forceY;
        
        // Limit speed
        const maxSpeed = 0.5;
        const speed = Math.sqrt(particles[i].speedX * particles[i].speedX + particles[i].speedY * particles[i].speedY);
        if (speed > maxSpeed) {
          particles[i].speedX = (particles[i].speedX / speed) * maxSpeed;
          particles[i].speedY = (particles[i].speedY / speed) * maxSpeed;
        }
      }
    }
  }
  
  // Modified draw function to include mouse particle
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections between particles
    drawConnections();
    
    // Draw particles
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Apply slight gravity toward center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      particle.speedX += (centerX - particle.x) * 0.00001;
      particle.speedY += (centerY - particle.y) * 0.00001;
      
      // Add slight friction
      particle.speedX *= 0.99;
      particle.speedY *= 0.99;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX = -particle.speedX;
      }
      
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY = -particle.speedY;
      }
    });
    
    // Update and draw mouse particle
    updateMouseParticle();
    
    requestAnimationFrame(draw);
  }
  
  // Start animation
  draw();
}