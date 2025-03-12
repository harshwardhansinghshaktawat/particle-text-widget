class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.animationFrame = null;
  }

  static get observedAttributes() {
    return [
      'text', 'particle-speed', 'particle-density', 'particle-color',
      'font-size', 'background-color', 'font-family'
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
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  async initScene(text, particleSpeed, particleDensity, particleColor, fontSize, backgroundColor, fontFamily) {
    const THREE = window.THREE;

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 50;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(backgroundColor);
    this.shadowRoot.querySelector('#canvas-container').appendChild(this.renderer.domElement);

    // Load font
    const fontLoader = new THREE.FontLoader();
    const font = await new Promise((resolve) => {
      fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', resolve);
    });

    // Create text geometry
    const geometry = new THREE.TextGeometry(text, {
      font: font,
      size: fontSize * 5, // Scale vw to reasonable 3D units
      height: 1,
      curveSegments: 12,
      bevelEnabled: false
    });

    // Center geometry
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const centerOffset = new THREE.Vector3();
    boundingBox.getCenter(centerOffset).negate();
    geometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

    // Extract particle positions from vertices
    const positions = geometry.attributes.position.array;
    const particleCount = Math.floor(positions.length / 3 * particleDensity);
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const index = Math.floor(Math.random() * (positions.length / 3)) * 3;
      particlePositions[i * 3] = positions[index] + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 1] = positions[index + 1] + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = positions[index + 2] + (Math.random() - 0.5) * 2;
    }

    // Particle geometry and material
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.5,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    // Create particle system
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Animation
    const animate = () => {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += (Math.random() - 0.5) * particleSpeed * 0.1;
        positions[i * 3 + 1] += (Math.random() - 0.5) * particleSpeed * 0.1;
        positions[i * 3 + 2] += (Math.random() - 0.5) * particleSpeed * 0.1;

        // Reset to base position if too far
        const dx = positions[i * 3] - particlePositions[i * 3];
        const dy = positions[i * 3 + 1] - particlePositions[i * 3 + 1];
        const dz = positions[i * 3 + 2] - particlePositions[i * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) > 5) {
          positions[i * 3] = particlePositions[i * 3];
          positions[i * 3 + 1] = particlePositions[i * 3 + 1];
          positions[i * 3 + 2] = particlePositions[i * 3 + 2];
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'Shimmer';
    const particleSpeed = parseFloat(this.getAttribute('particle-speed')) || 1;
    const particleDensity = parseFloat(this.getAttribute('particle-density')) || 0.5;
    const particleColor = this.getAttribute('particle-color') || '#FFD700'; // Gold
    const fontSize = this.getAttribute('font-size') || '5'; // In vw
    const backgroundColor = this.getAttribute('background-color') || '#1A1A1A'; // Dark gray
    const fontFamily = this.getAttribute('font-family') || 'Playfair Display';

    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: block;
          overflow: hidden;
        }

        #canvas-container {
          width: 100%;
          height: 100%;
        }
      </style>
      <div id="canvas-container"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    `;

    // Wait for Three.js to load, then initialize
    const checkThree = () => {
      if (window.THREE) {
        this.initScene(text, particleSpeed, particleDensity, particleColor, parseFloat(fontSize), backgroundColor, fontFamily);
      } else {
        setTimeout(checkThree, 100);
      }
    };
    checkThree();
  }
}

// Define the custom element
customElements.define('particle-text', ParticleText);
