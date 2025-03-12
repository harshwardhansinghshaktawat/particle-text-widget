class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.particles = [];
    this.animationFrame = null;
  }

  static get observedAttributes() {
    return [
      'text', 'particle-speed', 'particle-density', 'particle-color',
      'font-size', 'background-color', 'font-color', 'font-family'
    ];
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
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  // Initialize particles based on text outline
  initParticles(ctx, text, fontSize, fontFamily, density) {
    ctx.font = `${fontSize}vw ${fontFamily}, serif`;
    ctx.fillStyle = 'white'; // Temporary for outline detection
    ctx.fillText(text, 0, fontSize * 0.8); // Adjust baseline

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    this.particles = [];
    const step = Math.max(1, Math.floor(10 / density)); // Adjust density

    for (let y = 0; y < ctx.canvas.height; y += step) {
      for (let x = 0; x < ctx.canvas.width; x += step) {
        const i = (y * ctx.canvas.width + x) * 4;
        if (imageData[i + 3] > 128) { // Alpha > 50% indicates text pixel
          this.particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            baseX: x,
            baseY: y,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            life: Math.random() * 2 + 1,
            maxLife: Math.random() * 2 + 1
          });
        }
      }
    }
  }

  // Animate particles
  animateParticles(ctx, particleSpeed, particleColor) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.particles.forEach(p => {
      p.x += p.speedX * particleSpeed;
      p.y += p.speedY * particleSpeed;
      p.life -= 0.02 * particleSpeed;

      // Reset particle when life expires
      if (p.life <= 0) {
        p.x = p.baseX + (Math.random() - 0.5) * 10;
        p.y = p.baseY + (Math.random() - 0.5) * 10;
        p.life = p.maxLife;
      }

      // Draw particle with glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particleColor;
      ctx.fill();
    });

    this.animationFrame = requestAnimationFrame(() => this.animateParticles(ctx, particleSpeed, particleColor));
  }

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'Shimmer';
    const particleSpeed = parseFloat(this.getAttribute('particle-speed')) || 1;
    const particleDensity = parseFloat(this.getAttribute('particle-density')) || 0.5;
    const particleColor = this.getAttribute('particle-color') || '#FFD700'; // Gold
    const fontSize = this.getAttribute('font-size') || '5'; // In vw
    const backgroundColor = this.getAttribute('background-color') || '#1A1A1A'; // Dark gray
    const fontColor = this.getAttribute('font-color') || '#FFFFFF'; // White
    const fontFamily = this.getAttribute('font-family') || 'Playfair Display';

    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${backgroundColor};
          overflow: hidden;
        }

        canvas {
          display: block;
        }

        .text-overlay {
          position: absolute;
          font-family: ${fontFamily}, serif;
          font-size: ${fontSize}vw;
          color: ${fontColor};
          text-align: center;
          pointer-events: none; /* Allow clicks through text */
          text-transform: uppercase;
        }
      </style>
      <canvas></canvas>
      <div class="text-overlay">${text}</div>
    `;

    const canvas = this.shadowRoot.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    this.initParticles(ctx, text, parseFloat(fontSize), fontFamily, particleDensity);

    // Clear previous animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Start animation
    this.animateParticles(ctx, particleSpeed, particleColor);

    // Handle resize
    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.initParticles(ctx, text, parseFloat(fontSize), fontFamily, particleDensity);
    };
  }
}

// Define the custom element
customElements.define('particle-text', ParticleText);
