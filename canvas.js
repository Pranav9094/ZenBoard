/**
 * ZenBoard Particle Animation Engine - Premium
 * Advanced particle system with waves, floating orbs, and interactive ripples
 */

(function() {
  'use strict';

  // Canvas setup
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // Enhanced particle configuration
  const PARTICLE_COUNT = 100;
  const ORB_COUNT = 15;
  const MOUSE_REPEL_RADIUS = 120;
  const MOUSE_ATTRACT_RADIUS = 180;
  const BASE_SPEED = 0.6;

  // Track canvas dimensions
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Mouse position and state
  let mouseX = -1000;
  let mouseY = -1000;
  let mouseVelocityX = 0;
  let mouseVelocityY = 0;
  let lastMouseX = -1000;
  let lastMouseY = -1000;

  // Speed multiplier from theme
  let speedMultiplier = 1;
  let themeHue = 260; // Default purple

  // Wave animation state
  let waveTime = 0;

  // Particle types
  const PARTICLE_TYPES = {
    NORMAL: 'normal',
    GLOW: 'glow',
    PULSE: 'pulse'
  };

  // Ripples system
  const ripples = [];

  class Ripple {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = 150 + Math.random() * 100;
      this.opacity = 0.5;
      this.speed = 2 + Math.random() * 2;
    }

    update() {
      this.radius += this.speed;
      this.opacity = 0.5 * (1 - this.radius / this.maxRadius);
      return this.radius < this.maxRadius;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${themeHue}, 80%, 60%, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Floating Orb Class
  class Orb {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = 50 + Math.random() * 150;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.opacity = 0.02 + Math.random() * 0.05;
      this.hue = themeHue + (Math.random() - 0.5) * 40;
    }

    update() {
      this.x += this.vx * speedMultiplier;
      this.y += this.vy * speedMultiplier;

      // Wrap around
      if (this.x < -this.radius) this.x = width + this.radius;
      if (this.x > width + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = height + this.radius;
      if (this.y > height + this.radius) this.y = -this.radius;
    }

    draw() {
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${this.opacity})`);
      gradient.addColorStop(1, `hsla(${this.hue}, 80%, 40%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.vy = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.radius = Math.random() * 2 + 0.5;
      this.baseRadius = this.radius;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = themeHue + (Math.random() - 0.5) * 60;
      this.type = Math.random() > 0.8 ? PARTICLE_TYPES.GLOW : PARTICLE_TYPES.NORMAL;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(deltaTime) {
      const speed = speedMultiplier;

      // Gentle movement
      this.x += this.vx * speed;
      this.y += this.vy * speed;

      // Mouse interaction
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_REPEL_RADIUS) {
        const force = (MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 4;
        this.y -= Math.sin(angle) * force * 4;
      }

      // Wrap
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
      
      if (this.type === PARTICLE_TYPES.GLOW) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${this.hue}, 80%, 60%, 0.8)`;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  let particles = [];
  let orbs = [];

  function initElements() {
    particles = [];
    orbs = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    for (let i = 0; i < ORB_COUNT; i++) orbs.push(new Orb());
  }

  function drawConnections() {
    const connectionDistance = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${themeHue}, 70%, 60%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate(currentTime) {
    ctx.fillStyle = '#0F0F1A';
    ctx.fillRect(0, 0, width, height);

    // Draw Orbs first (background)
    orbs.forEach(orb => {
      orb.update();
      orb.draw();
    });

    // Draw lines
    drawConnections();

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Update and draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      if (!ripples[i].update()) {
        ripples.splice(i, 1);
      } else {
        ripples[i].draw();
      }
    }

    requestAnimationFrame(animate);
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function handleClick(e) {
    ripples.push(new Ripple(e.clientX, e.clientY));
  }

  function init() {
    handleResize();
    initElements();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);
    requestAnimationFrame(animate);
  }

  window.ParticleEngine = {
    updateSpeed: (m) => speedMultiplier = m,
    updateThemeHue: (h) => {
      themeHue = h;
      particles.forEach(p => p.hue = h + (Math.random() - 0.5) * 60);
      orbs.forEach(o => o.hue = h + (Math.random() - 0.5) * 40);
    }
  };

  init();
})();
