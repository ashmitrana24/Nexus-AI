// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Initialize Swiper
const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});

// Neural Network Animation
class NeuralAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.isRunning = false;
        this.density = 50;
        this.speed = 0.5;
        this.init();
    }

    init() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height * this.density) / 20000);
        for(let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.speed,
                vy: (Math.random() - 0.5) * this.speed,
                radius: Math.random() * 1.5 + 0.5
            });
        }
    }

    updateDensity(density) {
        this.density = density;
        this.createParticles();
    }

    updateSpeed(speed) {
        this.speed = speed * 0.02;
        this.particles.forEach(particle => {
            particle.vx = (Math.random() - 0.5) * this.speed;
            particle.vy = (Math.random() - 0.5) * this.speed;
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    reset() {
        this.isRunning = false;
        this.density = 50;
        this.speed = 0.5;
        this.createParticles();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateParticles();
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if(particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if(particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });
    }

    drawConnections() {
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if(distance < 80) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.2 - distance/400})`;
                    this.ctx.stroke();
                }
            });
        });
    }
}

// Initialize neural animations for capability cards
document.querySelectorAll('.neural-animation').forEach(canvas => {
    new NeuralAnimation(canvas);
});

// Demo Animation
const demoCanvas = document.getElementById('demoAnimation');
const demoAnimation = new NeuralAnimation(demoCanvas);

// Stats Animation
const stats = document.querySelectorAll('.stat-value');
stats.forEach(stat => {
    let value = parseFloat(stat.dataset.value);
    let unit = '';

    // Extract unit if present (%, ms, etc.)
    if (stat.textContent.match(/[^0-9.]/)) {
        unit = stat.textContent.match(/[^0-9.]+/)[0];
        value = parseFloat(stat.textContent);
    }

    // Handle 24/7 special case
    if (stat.textContent === '24/7') {
        stat.textContent = '24/7';
        return;
    }

    // Validate value
    if (isNaN(value)) {
        console.warn('Invalid value for stat:', stat);
        return;
    }

    let current = 0;
    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const increment = value / steps;
    let step = 0;

    const updateValue = () => {
        if (step < steps) {
            current += increment;
            stat.textContent = Math.min(current, value).toFixed(1).replace(/\.0$/, '') + unit;
            step++;
            requestAnimationFrame(updateValue);
        } else {
            stat.textContent = value + unit;
        }
    };

    updateValue();
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

class NetworkDemo {
    constructor() {
        this.densityControl = document.getElementById('densityControl');
        this.speedControl = document.getElementById('speedControl');
        this.startButton = document.getElementById('startDemo');
        this.resetButton = document.getElementById('resetDemo');
        this.animation = new NeuralAnimation(document.getElementById('demoAnimation'));
        this.isRunning = false;
        this.initializeControls();
        this.updateStats('processing', 50);
        this.updateStats('connections', 50);
    }

    initializeControls() {
        this.densityControl.addEventListener('input', (e) => {
            const density = e.target.value;
            this.animation.updateDensity(density);
            this.updateStats('connections', density);
        });

        this.speedControl.addEventListener('input', (e) => {
            const speed = e.target.value;
            this.animation.updateSpeed(speed);
            this.updateStats('processing', speed);
        });

        this.startButton.addEventListener('click', () => {
            if (!this.isRunning) {
                this.start();
            }
        });
        
        this.resetButton.addEventListener('click', () => this.reset());
    }

    updateStats(type, value) {
        const statElements = document.querySelectorAll('.stat-circle');
        const progress = statElements[type === 'processing' ? 0 : 1].querySelector('.progress');
        const number = statElements[type === 'processing' ? 0 : 1].querySelector('.stat-number');
        
        const normalizedValue = Math.round((value / 100) * 100);
        progress.style.strokeDashoffset = 283 - (283 * normalizedValue / 100);
        number.textContent = `${normalizedValue}%`;
    }

    start() {
        this.isRunning = true;
        this.startButton.classList.add('active');
        this.animation.start();
        this.startButton.textContent = '▶ Running...';
    }

    reset() {
        this.isRunning = false;
        this.startButton.classList.remove('active');
        this.animation.reset();
        this.densityControl.value = 50;
        this.speedControl.value = 50;
        this.updateStats('processing', 50);
        this.updateStats('connections', 50);
        this.startButton.textContent = '▶ Initialize';
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const networkDemo = new NetworkDemo();
});
