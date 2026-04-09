/**
 * ZenBoard Particle Animation Engine
 * Handles floating background particles with mouse interaction
 */

(function() {
  'use strict';

  // Canvas setup
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // Particle configuration
  const PARTICLE_COUNT = 80;
  const MOUSE_REPEL_RADIUS = 80;
  const BASE_SPEED = 0.5;

  // Track canvas dimensions
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Mouse position tracking
  let mouseX = -1000;
  let mouseY = -1000;

  // Speed multiplier from theme
  let speedMultiplier = 1;

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    // Reset particle to random position
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.vy = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.hue = Math.random() * 60 + 240; // Blue-purple range
    }

    // Update particle position
    update() {
      // Apply theme speed multiplier
      const speed = speedMultiplier;

      // Move particle
      this.x += this.vx * speed;
      this.y += this.vy * speed;

      // Mouse repel force
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_REPEL_RADIUS) {
        const force = (MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS;
        const angle = Math.atan2(dy, dx);
        const repelX = Math.cos(angle) * force * 3;
        const repelY = Math.sin(angle) * force * 3;

        this.x -= repelX;
        this.y -= repelY;
      }

      // Bounce off walls
      if (this.x < 0 || this.x > width) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(width, this.x));
      }
      if (this.y < 0 || this.y > height) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(height, this.y));
      }

      // Keep particles within bounds
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }

    // Draw particle
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particle array
  let particles = [];

  // Initialize particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connections between nearby particles
  function drawConnections() {
    const connectionDistance = 100;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(260, 70%, 70%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update and draw all particles
    for (const particle of particles) {
      particle.update();
      particle.draw();
    }

    // Draw connections
    drawConnections();

    // Request next frame
    requestAnimationFrame(animate);
  }

  // Handle window resize
  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  // Handle mouse movement
  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  // Handle mouse leaving window
  function handleMouseLeave() {
    mouseX = -1000;
    mouseY = -1000;
  }

  // Update particle speed based on theme
  function updateSpeed(multiplier) {
    speedMultiplier = multiplier;
  }

  // Initialize canvas
  function init() {
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create particles
    initParticles();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Start animation loop
    animate();
  }

  // Expose updateSpeed function globally
  window.ParticleEngine = {
    updateSpeed: updateSpeed
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
