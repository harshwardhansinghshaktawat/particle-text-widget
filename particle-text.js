class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.particles = [];
    this.amount = 0;
    this.animationFrameId = null;
  }

  static get observedAttributes() {
    return ['text', 'font-size', 'background-color', 'particle-color', 'text-color', 'font-family'];
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
  }

  initParticles(ctx, ww, wh) {
    const text = this.getAttribute('text') || 'Shine';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 5; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Cinzel';
    const density = 450; // Hardcoded density (higher = fewer particles)

    ctx.clearRect(0, 0, ww, wh);
    ctx.font = `400 ${fontSize}vw ${fontFamily}, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(text, ww / 2, wh / 2);

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
      this.particles[i].render(ctx);
    }

    this.animationFrameId = requestAnimationFrame(() => this.renderAnimation());
  }

  render() {
    // Get attribute values with fallbacks
    const backgroundColor = this.getAttribute('background-color') || '#1A2533'; // Midnight blue
    const textColor = this.getAttribute('text-color') || '#D8DEE9'; // Soft silver
    const particleColor = this.getAttribute('particle-color') || '#FFD700'; // Golden

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
    this.speed = 1000; // Hardcoded speed (lower = faster)
    this.color = parent.getAttribute('particle-color') || '#FFD700'; // Golden
  }

  render(ctx) {
    this.accX = (this.dest.x - this.x) / this.speed;
    this.accY = (this.dest.y - this.y) / this.speed;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    ctx.fill();
  }
}

customElements.define('particle-text', ParticleText);
