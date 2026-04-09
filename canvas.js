/**
 * ZenBoard Particle Animation Engine - Enhanced
 * Advanced particle system with waves, flows, and dynamic effects
 */

(function() {
  'use strict';

  // Canvas setup
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // Enhanced particle configuration
  const PARTICLE_COUNT = 120;
  const MOUSE_REPEL_RADIUS = 100;
  const MOUSE_ATTRACT_RADIUS = 150;
  const BASE_SPEED = 0.8;

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
  let flowOffset = 0;

  // Particle types
  const PARTICLE_TYPES = {
    NORMAL: 'normal',
    GLOW: 'glow',
    PULSE: 'pulse',
    TRAIL: 'trail'
  };

  // Particle class
  class Particle {
    constructor() {
      this.reset();
      this.type = this.randomType();
    }

    // Get random particle type
    randomType() {
      const rand = Math.random();
      if (rand < 0.1) return PARTICLE_TYPES.GLOW;
      if (rand < 0.25) return PARTICLE_TYPES.PULSE;
      if (rand < 0.4) return PARTICLE_TYPES.TRAIL;
      return PARTICLE_TYPES.NORMAL;
    }

    // Reset particle to random position
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.vy = (Math.random() - 0.5) * BASE_SPEED * 2;
      this.radius = Math.random() * 3 + 1;
      this.baseRadius = this.radius;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.baseOpacity = this.opacity;
      this.hue = themeHue + (Math.random() - 0.5) * 80;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
      this.trail = [];
      this.trailLength = 5 + Math.floor(Math.random() * 10);
    }

    // Update particle position
    update(deltaTime) {
      const speed = speedMultiplier;

      // Add wave motion
      waveTime += 0.016 * speed;
      this.x += Math.sin(waveTime + this.y * 0.01) * 0.3 * speed;
      this.y += Math.cos(waveTime + this.x * 0.01) * 0.3 * speed;

      // Move particle
      this.x += this.vx * speed;
      this.y += this.vy * speed;

      // Store trail positions
      if (this.type === PARTICLE_TYPES.TRAIL) {
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
          this.trail.pop();
        }
      }

      // Mouse interaction - repel
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_REPEL_RADIUS) {
        const force = (MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS;
        const angle = Math.atan2(dy, dx);
        const repelStrength = 5 + Math.abs(mouseVelocityX + mouseVelocityY) * 0.5;
        this.x -= Math.cos(angle) * force * repelStrength;
        this.y -= Math.sin(angle) * force * repelStrength;
      }

      // Gentle attraction to mouse from far away
      if (distance > MOUSE_REPEL_RADIUS && distance < MOUSE_ATTRACT_RADIUS) {
        const attractForce = (distance - MOUSE_REPEL_RADIUS) / (MOUSE_ATTRACT_RADIUS - MOUSE_REPEL_RADIUS);
        this.x += (dx / distance) * attractForce * 0.5 * speed;
        this.y += (dy / distance) * attractForce * 0.5 * speed;
      }

      // Pulse effect
      if (this.type === PARTICLE_TYPES.PULSE) {
        this.pulsePhase += this.pulseSpeed * speed;
        this.radius = this.baseRadius * (1 + 0.5 * Math.sin(this.pulsePhase));
      }

      // Bounce off walls with trail effect
      if (this.x < 0) {
        this.vx *= -1;
        this.x = 0;
        this.createWallSpark(0, this.y);
      }
      if (this.x > width) {
        this.vx *= -1;
        this.x = width;
        this.createWallSpark(width, this.y);
      }
      if (this.y < 0) {
        this.vy *= -1;
        this.y = 0;
        this.createWallSpark(this.x, 0);
      }
      if (this.y > height) {
        this.vy *= -1;
        this.y = height;
        this.createWallSpark(this.x, height);
      }

      // Keep particles within bounds
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));
    }

    // Create spark effect at wall
    createWallSpark(x, y) {
      // Visual effect handled in draw
    }

    // Draw particle
    draw() {
      // Draw trail first
      if (this.type === PARTICLE_TYPES.TRAIL && this.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity * 0.3})`;
        ctx.lineWidth = this.radius * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Draw glow effect for glow particles
      if (this.type === PARTICLE_TYPES.GLOW) {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * 4
        );
        gradient.addColorStop(0, `hsla(${this.hue}, 90%, 70%, ${this.opacity * 0.8})`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 90%, 60%, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 90%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw main particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      if (this.type === PARTICLE_TYPES.GLOW) {
        ctx.fillStyle = `hsla(${this.hue}, 90%, 80%, ${this.opacity})`;
        ctx.shadowColor = `hsla(${this.hue}, 90%, 60%, 0.8)`;
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
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

  // Draw enhanced connections between particles
  function drawConnections() {
    const connectionDistance = 120;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.2 * speedMultiplier;
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, `hsla(${p1.hue}, 70%, 60%, ${opacity})`);
          gradient.addColorStop(1, `hsla(${p2.hue}, 70%, 60%, ${opacity})`);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Draw flowing wave lines in background
  function drawWaves() {
    const waveCount = 5;
    const waveSpacing = height / (waveCount + 1);

    for (let w = 0; w < waveCount; w++) {
      const baseY = waveSpacing * (w + 1);
      const waveAmplitude = 30 + w * 10;
      const waveFrequency = 0.003;

      ctx.beginPath();
      ctx.moveTo(0, baseY);

      for (let x = 0; x <= width; x += 10) {
        const y = baseY +
          Math.sin(x * waveFrequency + waveTime + w) * waveAmplitude +
          Math.sin(x * waveFrequency * 2 + waveTime * 1.5) * (waveAmplitude * 0.5);
        ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, baseY - waveAmplitude, 0, baseY + waveAmplitude);
      gradient.addColorStop(0, `hsla(${themeHue}, 60%, 50%, 0.03)`);
      gradient.addColorStop(0.5, `hsla(${themeHue}, 60%, 60%, 0.06)`);
      gradient.addColorStop(1, `hsla(${themeHue}, 60%, 50%, 0.03)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Draw mouse cursor glow effect
  function drawMouseGlow() {
    if (mouseX < 0 || mouseY < 0) return;

    const gradient = ctx.createRadialGradient(
      mouseX, mouseY, 0,
      mouseX, mouseY, 80
    );
    gradient.addColorStop(0, `hsla(${themeHue}, 80%, 60%, 0.15)`);
    gradient.addColorStop(0.5, `hsla(${themeHue}, 80%, 50%, 0.05)`);
    gradient.addColorStop(1, `hsla(${themeHue}, 80%, 40%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  // Animation loop
  let lastTime = 0;
  function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to ~60fps
    lastTime = currentTime;

    // Clear canvas with fade effect for motion trails
    ctx.fillStyle = 'rgba(15, 15, 26, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Update wave time
    waveTime += 0.016 * speedMultiplier;
    flowOffset += 0.5 * speedMultiplier;

    // Draw background waves
    drawWaves();

    // Draw mouse glow
    drawMouseGlow();

    // Update and draw all particles
    for (const particle of particles) {
      particle.update(deltaTime);
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
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Calculate mouse velocity for dynamic effects
    mouseVelocityX = (mouseX - lastMouseX) * 0.1;
    mouseVelocityY = (mouseY - lastMouseY) * 0.1;
  }

  // Handle mouse leaving window
  function handleMouseLeave() {
    mouseX = -1000;
    mouseY = -1000;
    mouseVelocityX = 0;
    mouseVelocityY = 0;
  }

  // Update particle speed and theme based on theme
  function updateSpeed(multiplier) {
    speedMultiplier = multiplier;
  }

  // Update theme hue
  function updateThemeHue(hue) {
    themeHue = hue;
    // Update existing particles' hues gradually
    particles.forEach(p => {
      p.hue = hue + (Math.random() - 0.5) * 80;
    });
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
    requestAnimationFrame(animate);
  }

  // Expose functions globally
  window.ParticleEngine = {
    updateSpeed: updateSpeed,
    updateThemeHue: updateThemeHue
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
