class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.particles = [];
    this.amount = 0;
    this.animationFrameId = null;
    this.mouse = { x: -9999, y: -9999 };
    this.radius = 70;
    this.isVisible = false;
    this.isInitialized = false;
  }

  static get observedAttributes() {
    return ['text', 'font-size', 'background-color', 'particle-color', 'font-family'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    this.stopAnimation();
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    // Disconnect intersection observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver() {
    // Create new IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element entered viewport
          this.isVisible = true;
          if (this.isInitialized) {
            this.startAnimation();
          }
        } else {
          // Element left viewport
          this.isVisible = false;
          this.stopAnimation();
        }
      });
    }, {
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    });

    // Start observing this element
    this.observer.observe(this);
  }

  startAnimation() {
    if (!this.animationFrameId && this.isVisible) {
      this.renderAnimation();
    }
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  wrapText(ctx, text, fontSize, maxWidth) {
    ctx.font = `400 ${fontSize}vw ${this.getAttribute('font-family') || 'Cinzel'}, serif`;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  }

  initParticles(ctx, ww, wh) {
    const text = this.getAttribute('text') || 'Shine';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 5; // In vw
    const density = 450; // Hardcoded density
    const maxWidth = ww * 0.8; // 80% of canvas width for wrapping

    ctx.clearRect(0, 0, ww, wh);
    const lines = this.wrapText(ctx, text, fontSize, maxWidth);

    // Calculate total height and center vertically
    const lineHeight = fontSize * window.innerWidth / 100 * 1.2; // 1.2x font size for line spacing
    const totalHeight = lines.length * lineHeight;
    const startY = (wh - totalHeight) / 2;

    // Draw each line
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight) + (lineHeight / 2);
      ctx.fillText(line, ww / 2, y);
    });

    const data = ctx.getImageData(0, 0, ww, wh).data;
    ctx.clearRect(0, 0, ww, wh);

    this.particles = [];
    for (let i = 0; i < ww; i += Math.round(ww / density)) {
      for (let j = 0; j < wh; j += Math.round(ww / density)) {
        if (data[((i + j * ww) * 4) + 3] > 150) {
          this.particles.push(new Particle(i, j, this));
        }
      }
    }
    this.amount = this.particles.length;
    this.isInitialized = true;
    
    // Start animation if element is visible
    if (this.isVisible) {
      this.startAnimation();
    }
  }

  renderAnimation() {
    const canvas = this.shadowRoot.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const ww = canvas.width;
    const wh = canvas.height;

    ctx.clearRect(0, 0, ww, wh);
    for (let i = 0; i < this.amount; i++) {
      this.particles[i].render(ctx, this.mouse, this.radius);
    }

    if (this.isVisible) {
      this.animationFrameId = requestAnimationFrame(() => this.renderAnimation());
    } else {
      this.animationFrameId = null;
    }
  }

  render() {
    // Get attribute values with fallbacks
    const backgroundColor = this.getAttribute('background-color') || '#1A2533'; // Midnight blue
    const particleColor = this.getAttribute('particle-color') || '#66D9EF'; // Soft cyan

    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: block;
          overflow: hidden;
          background: ${backgroundColor};
        }

        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>
      <canvas></canvas>
    `;

    const canvas = this.shadowRoot.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    this.initParticles(ctx, canvas.width, canvas.height);

    // Handle resize
    window.removeEventListener('resize', this.resizeHandler);
    this.resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.initParticles(ctx, canvas.width, canvas.height);
    };
    window.addEventListener('resize', this.resizeHandler);

    // Handle mouse movement
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    this.mouseMoveHandler = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);
  }
}

class Particle {
  constructor(x, y, parent) {
    this.parent = parent;
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.dest = { x, y };
    this.r = Math.random() * 1 + 1;
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random() * 0.05 + 0.94;
    this.speed = 200; // Hardcoded faster speed
    this.color = parent.getAttribute('particle-color') || '#66D9EF';
  }

  render(ctx, mouse, radius) {
    this.accX = (this.dest.x - this.x) / this.speed;
    this.accY = (this.dest.y - this.y) / this.speed;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Mouse interaction
    const a = this.x - mouse.x;
    const b = this.y - mouse.y;
    const distance = Math.sqrt(a * a + b * b);
    if (distance < radius) {
      this.accX = (this.x - mouse.x) / 100;
      this.accY = (this.y - mouse.y) / 100;
      this.vx += this.accX;
      this.vy += this.accY;
    }

    this.x += this.vx;
    this.y += this.vy;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    ctx.fill();
  }
}

customElements.define('particle-text', ParticleText);
