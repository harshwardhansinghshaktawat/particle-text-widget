class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.particles = [];
    this.amount = 0;
    this.animationFrameId = null;
    this.mouse = { x: -9999, y: -9999 }; // Default off-screen
    this.radius = 70; // Mouse interaction radius
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
  }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  initParticles(ctx, ww, wh) {
    const text = this.getAttribute('text') || 'Shine';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 5; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Cinzel';
    const density = 450; // Hardcoded density

    ctx.clearRect(0, 0, ww, wh);
    ctx.font = `400 ${fontSize}vw ${fontFamily}, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Ensure vertical centering
    const centerX = ww / 2;
    const centerY = wh / 2;
    ctx.fillText(text, centerX, centerY);

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

    this.animationFrameId = requestAnimationFrame(() => this.renderAnimation());
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
          display: block; /* Ensure no extra spacing */
        }
      </style>
      <canvas></canvas>
    `;

    const canvas = this.shadowRoot.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    this.initParticles(ctx, canvas.width, canvas.height);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.renderAnimation();

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
    this.r = Math.random() * 1 + 1; // Particle radius
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random() * 0.05 + 0.94;
    this.speed = 200; // Hardcoded faster speed
    this.color = parent.getAttribute('particle-color') || '#66D9EF'; // Soft cyan
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
