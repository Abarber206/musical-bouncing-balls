// Global variables
let canvas = document.getElementById('bouncingCanvas');
let bgCanvas = document.getElementById('backgroundCanvas');
let ctx = canvas.getContext('2d');
let bgCtx = bgCanvas.getContext('2d');
let animationId;
let bgAnimationId;
let isPlaying = false;
let balls = [];
let generation = 0;
let centerX, centerY, radius;
let audioCtx = null;
let masterVolume = 0.3;
let currentInstrument = 'sine';
let defaultBallSize = 10;
let multiplyChance = 0.3;
let currentTheme = 'classic';

// Background theme elements
let stars = [];
let matrices = [];
let bubbles = [];
let gradientAngle = 0;

// Audio synthesis parameters
const INSTRUMENTS = {
    // Basic Waves
    'sine': { type: 'oscillator', wave: 'sine', attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
    'triangle': { type: 'oscillator', wave: 'triangle', attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
    'square': { type: 'oscillator', wave: 'square', attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
    'sawtooth': { type: 'oscillator', wave: 'sawtooth', attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
    
    // Piano & Keys
    'grand-piano': {
        type: 'complex',
        components: [
            { wave: 'triangle', ratio: 1, gain: 0.5 },
            { wave: 'sine', ratio: 2, gain: 0.1 },
            { wave: 'sine', ratio: 4, gain: 0.05 }
        ],
        attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.3
    },
    'electric-piano': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.5 },
            { wave: 'sine', ratio: 6.99, gain: 0.05 },
            { wave: 'sine', ratio: 7.01, gain: 0.05 }
        ],
        attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.2
    },
    'music-box': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 3, gain: 0.2 },
            { wave: 'sine', ratio: 10, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.1, sustain: 0, release: 0.3
    },
    'vibraphone': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.5 },
            { wave: 'sine', ratio: 3, gain: 0.1 },
            { wave: 'sine', ratio: 4.2, gain: 0.05 }
        ],
        attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4,
        vibrato: { frequency: 5, depth: 0.1 }
    },
    
    // Strings
    'violin': {
        type: 'complex',
        components: [
            { wave: 'sawtooth', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 2, gain: 0.2 },
            { wave: 'sine', ratio: 3, gain: 0.1 }
        ],
        attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2,
        vibrato: { frequency: 5, depth: 0.1 }
    },
    'cello': {
        type: 'complex',
        components: [
            { wave: 'sawtooth', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 2, gain: 0.2 },
            { wave: 'sine', ratio: 3, gain: 0.1 }
        ],
        attack: 0.1, decay: 0.15, sustain: 0.8, release: 0.3
    },
    'harp': {
        type: 'complex',
        components: [
            { wave: 'triangle', ratio: 1, gain: 0.5 },
            { wave: 'sine', ratio: 2, gain: 0.2 },
            { wave: 'sine', ratio: 3, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4
    },
    'guitar': {
        type: 'complex',
        components: [
            { wave: 'triangle', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 2, gain: 0.2 },
            { wave: 'sine', ratio: 3, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.3
    },
    
    // Wind
    'flute': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 2, gain: 0.1 },
            { wave: 'sine', ratio: 3, gain: 0.05 }
        ],
        attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2,
        vibrato: { frequency: 4, depth: 0.05 }
    },
    'clarinet': {
        type: 'complex',
        components: [
            { wave: 'square', ratio: 1, gain: 0.3 },
            { wave: 'sine', ratio: 3, gain: 0.1 },
            { wave: 'sine', ratio: 5, gain: 0.05 }
        ],
        attack: 0.08, decay: 0.1, sustain: 0.8, release: 0.2
    },
    'pan-flute': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.4 },
            { wave: 'sine', ratio: 2.01, gain: 0.1 },
            { wave: 'sine', ratio: 3.01, gain: 0.05 }
        ],
        attack: 0.15, decay: 0.1, sustain: 0.7, release: 0.3,
        vibrato: { frequency: 3, depth: 0.1 }
    },
    
    // Bells & Chimes
    'crystal': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.3 },
            { wave: 'sine', ratio: 2.76, gain: 0.2 },
            { wave: 'sine', ratio: 4.07, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5
    },
    'tubular-bells': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.3 },
            { wave: 'sine', ratio: 2, gain: 0.2 },
            { wave: 'sine', ratio: 4, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.5, sustain: 0.1, release: 1.0
    },
    'wind-chimes': {
        type: 'complex',
        components: [
            { wave: 'sine', ratio: 1, gain: 0.2 },
            { wave: 'sine', ratio: 2.1, gain: 0.15 },
            { wave: 'sine', ratio: 3.2, gain: 0.1 }
        ],
        attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.8
    }
};

function createOscillator(frequency, time, instrumentParams) {
    if (!audioCtx) return null;
    
    if (instrumentParams.type === 'oscillator') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = instrumentParams.wave;
        osc.frequency.setValueAtTime(frequency, time);
        
        // Apply ADSR envelope
        const attackTime = time + instrumentParams.attack;
        const decayTime = attackTime + instrumentParams.decay;
        const releaseTime = decayTime + 0.1; // Short note duration
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(masterVolume, attackTime);
        gainNode.gain.linearRampToValueAtTime(masterVolume * instrumentParams.sustain, decayTime);
        gainNode.gain.linearRampToValueAtTime(0, releaseTime);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(releaseTime + instrumentParams.release);
        
        return { oscillator: osc, gain: gainNode };
    } else if (instrumentParams.type === 'complex') {
        const gainNode = audioCtx.createGain();
        const oscillators = [];
        
        instrumentParams.components.forEach(component => {
            const osc = audioCtx.createOscillator();
            const oscGain = audioCtx.createGain();
            
            osc.type = component.wave;
            osc.frequency.setValueAtTime(frequency * component.ratio, time);
            oscGain.gain.setValueAtTime(component.gain * masterVolume, time);
            
            if (instrumentParams.vibrato) {
                const vibrato = audioCtx.createOscillator();
                const vibratoGain = audioCtx.createGain();
                
                vibrato.frequency.setValueAtTime(instrumentParams.vibrato.frequency, time);
                vibratoGain.gain.setValueAtTime(frequency * instrumentParams.vibrato.depth, time);
                
                vibrato.connect(vibratoGain);
                vibratoGain.connect(osc.frequency);
                vibrato.start(time);
            }
            
            osc.connect(oscGain);
            oscGain.connect(gainNode);
            oscillators.push({ oscillator: osc, gain: oscGain });
        });
        
        // Apply ADSR envelope
        const attackTime = time + instrumentParams.attack;
        const decayTime = attackTime + instrumentParams.decay;
        const releaseTime = decayTime + 0.1; // Short note duration
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(masterVolume, attackTime);
        gainNode.gain.linearRampToValueAtTime(masterVolume * instrumentParams.sustain, decayTime);
        gainNode.gain.linearRampToValueAtTime(0, releaseTime);
        
        gainNode.connect(audioCtx.destination);
        
        oscillators.forEach(osc => {
            osc.oscillator.start(time);
            osc.oscillator.stop(releaseTime + instrumentParams.release);
        });
        
        return { oscillators, masterGain: gainNode };
    }
}

function playNote(ball) {
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    const distanceFromCenter = Math.sqrt(
        Math.pow(ball.x - centerX, 2) + 
        Math.pow(ball.y - centerY, 2)
    );
    
    // Map distance to frequency using pentatonic scale
    const maxDistance = radius;
    const minFreq = 220; // A3
    const pentatonicScale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // Pentatonic intervals in semitones
    
    const normalizedDistance = 1 - (distanceFromCenter / maxDistance);
    const scaleIndex = Math.floor(normalizedDistance * pentatonicScale.length);
    const semitones = pentatonicScale[scaleIndex];
    const frequency = minFreq * Math.pow(2, semitones / 12);
    
    // Create sound with selected instrument
    const instrumentParams = INSTRUMENTS[currentInstrument];
    createOscillator(frequency, now, instrumentParams);
}

// Initialize both canvases
function initCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    updateSize();
    initializeThemeElements();
}

function resizeCanvas() {
    // Main canvas
    const minDimension = Math.min(window.innerWidth, window.innerHeight) * 0.7;
    canvas.width = minDimension;
    canvas.height = minDimension;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    
    // Background canvas
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    
    updateSize();
    initializeThemeElements();
}

// Theme initialization
function initializeThemeElements() {
    // Initialize stars
    stars = Array(200).fill().map(() => ({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    }));
    
    // Initialize matrix rain
    matrices = Array(50).fill().map(() => ({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        speed: Math.random() * 5 + 2,
        chars: []
    }));
    
    // Initialize bubbles
    bubbles = Array(50).fill().map(() => ({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        size: Math.random() * 30 + 10,
        speed: Math.random() * 1 + 0.5,
        angle: Math.random() * Math.PI * 2
    }));
}

// Background animation functions
function animateStarfield() {
    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    stars.forEach(star => {
        bgCtx.fillStyle = 'white';
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        bgCtx.fill();
        
        star.y += star.speed;
        if (star.y > bgCanvas.height) {
            star.y = 0;
            star.x = Math.random() * bgCanvas.width;
        }
    });
}

function animateMatrix() {
    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    bgCtx.fillStyle = '#0F0';
    bgCtx.font = '15px monospace';
    
    matrices.forEach(drop => {
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        bgCtx.fillText(char, drop.x, drop.y);
        
        drop.y += drop.speed;
        if (drop.y > bgCanvas.height) {
            drop.y = 0;
            drop.x = Math.random() * bgCanvas.width;
        }
    });
}

function animateBubbles() {
    bgCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    bubbles.forEach(bubble => {
        bgCtx.beginPath();
        bgCtx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        bgCtx.fillStyle = `hsla(${Math.random() * 360}, 70%, 50%, 0.1)`;
        bgCtx.fill();
        
        bubble.x += Math.cos(bubble.angle) * bubble.speed;
        bubble.y += Math.sin(bubble.angle) * bubble.speed;
        
        if (bubble.x < -bubble.size) bubble.x = bgCanvas.width + bubble.size;
        if (bubble.x > bgCanvas.width + bubble.size) bubble.x = -bubble.size;
        if (bubble.y < -bubble.size) bubble.y = bgCanvas.height + bubble.size;
        if (bubble.y > bgCanvas.height + bubble.size) bubble.y = -bubble.size;
    });
}

function animateGradient() {
    const gradient = bgCtx.createLinearGradient(0, 0, bgCanvas.width, bgCanvas.height);
    gradientAngle += 0.005;
    
    const hue1 = (Date.now() / 50) % 360;
    const hue2 = (hue1 + 180) % 360;
    
    gradient.addColorStop(0, `hsl(${hue1}, 70%, 20%)`);
    gradient.addColorStop(1, `hsl(${hue2}, 70%, 20%)`);
    
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function updateBackground() {
    if (!isPlaying) return;
    
    switch (currentTheme) {
        case 'starfield':
            animateStarfield();
            break;
        case 'matrix':
            animateMatrix();
            break;
        case 'bubbles':
            animateBubbles();
            break;
        case 'gradient':
            animateGradient();
            break;
        default:
            bgCtx.fillStyle = '#1a1a1a';
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    }
    
    bgAnimationId = requestAnimationFrame(updateBackground);
}

// Initialize size and canvas
function updateSize() {
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = sizeSlider.parentElement.querySelector('.slider-value');
    const percentage = parseInt(sizeSlider.value) / 100;
    radius = (Math.min(canvas.width, canvas.height) / 2) * percentage;
    sizeValue.textContent = sizeSlider.value + '%';
    
    // Update ball positions if they're outside the new boundary
    balls.forEach(ball => {
        const distanceFromCenter = Math.sqrt(
            Math.pow(ball.x - centerX, 2) + 
            Math.pow(ball.y - centerY, 2)
        );
        
        if (distanceFromCenter > radius) {
            const angle = Math.atan2(ball.y - centerY, ball.x - centerX);
            ball.x = centerX + Math.cos(angle) * (radius * 0.95);
            ball.y = centerY + Math.sin(angle) * (radius * 0.95);
        }
    });
}

// Audio setup
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

class Ball {
    constructor(x, y, generation) {
        this.x = x;
        this.y = y;
        this.radius = defaultBallSize;
        this.generation = generation;
        this.speed = 2 + generation * 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.canMultiply = true;
        this.color = this.generateColor();
        this.frequency = this.generateFrequency();
        this.lastBounce = 0;
        this.bounceCooldown = 1000;
    }

    generateColor() {
        const hue = (this.generation * 30) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    generateFrequency() {
        const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00];
        return pentatonicScale[this.generation % pentatonicScale.length];
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        const distanceFromCenter = Math.sqrt(
            Math.pow(this.x - centerX, 2) + 
            Math.pow(this.y - centerY, 2)
        );

        if (distanceFromCenter + this.radius > radius) {
            const bounceAngle = Math.atan2(this.y - centerY, this.x - centerX);
            
            // Push ball back inside boundary
            const pushbackDistance = radius - this.radius;
            this.x = centerX + Math.cos(bounceAngle) * pushbackDistance;
            this.y = centerY + Math.sin(bounceAngle) * pushbackDistance;
            
            // Add slight randomness to bounce
            this.angle = 2 * bounceAngle - this.angle + Math.PI + (Math.random() - 0.5) * 0.2;
            
            const now = Date.now();
            if (now - this.lastBounce > this.bounceCooldown) {
                playNote(this);
                this.lastBounce = now;
                
                if (this.canMultiply && balls.length < 50 && Math.random() < multiplyChance) {
                    this.multiply();
                }
            }
        }
    }

    multiply() {
        if (this.canMultiply && balls.length < 50) {
            const newBall = new Ball(this.x, this.y, this.generation + 1);
            // Add offset to prevent collision
            newBall.x += Math.cos(newBall.angle) * (this.radius * 3);
            newBall.y += Math.sin(newBall.angle) * (this.radius * 3);
            balls.push(newBall);
            this.canMultiply = false;
            generation = Math.max(generation, this.generation + 1);
            document.getElementById('generationCount').textContent = generation;
            document.getElementById('ballCount').textContent = balls.length;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw multiplication indicator
        if (this.canMultiply) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    }
}

function drawBoundary() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animate() {
    if (!isPlaying) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoundary();
    
    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });
    
    animationId = requestAnimationFrame(animate);
}

function createInitialBall() {
    balls = [];
    generation = 0;
    const ball = new Ball(centerX, centerY, 0);
    balls.push(ball);
    document.getElementById('generationCount').textContent = '0';
    document.getElementById('ballCount').textContent = '1';
}

function startAnimation() {
    if (!isPlaying) {
        initAudio();
        isPlaying = true;
        document.getElementById('startButton').textContent = 'Pause Animation';
        animate();
        updateBackground();
    } else {
        isPlaying = false;
        document.getElementById('startButton').textContent = 'Start Animation';
        cancelAnimationFrame(animationId);
        cancelAnimationFrame(bgAnimationId);
    }
}

function resetAnimation() {
    isPlaying = false;
    document.getElementById('startButton').textContent = 'Start Animation';
    cancelAnimationFrame(animationId);
    cancelAnimationFrame(bgAnimationId);
    createInitialBall();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoundary();
    balls[0].draw();
}

// Update functions for new controls
function updateBallSize() {
    const sizeSlider = document.getElementById('ballSizeSlider');
    const sizeValue = sizeSlider.parentElement.querySelector('.slider-value');
    defaultBallSize = parseInt(sizeSlider.value);
    sizeValue.textContent = defaultBallSize + 'px';
    
    // Update existing balls
    balls.forEach(ball => {
        ball.radius = defaultBallSize;
    });
}

function updateMultiplyChance() {
    const chanceSlider = document.getElementById('multiplyChanceSlider');
    const chanceValue = chanceSlider.parentElement.querySelector('.slider-value');
    multiplyChance = parseInt(chanceSlider.value) / 100;
    chanceValue.textContent = chanceSlider.value + '%';
}

// Add event listeners for new controls
document.getElementById('ballSizeSlider').addEventListener('input', updateBallSize);
document.getElementById('multiplyChanceSlider').addEventListener('input', updateMultiplyChance);

// Event Listeners
document.getElementById('startButton').addEventListener('click', startAnimation);
document.getElementById('resetButton').addEventListener('click', resetAnimation);
document.getElementById('volumeSlider').addEventListener('input', (e) => {
    masterVolume = e.target.value / 100;
    const volumeValue = e.target.parentElement.querySelector('.slider-value');
    volumeValue.textContent = e.target.value + '%';
});
document.getElementById('sizeSlider').addEventListener('input', updateSize);
document.getElementById('instrumentSelect').addEventListener('change', (e) => {
    currentInstrument = e.target.value;
});
document.getElementById('themeSelect').addEventListener('change', (e) => {
    currentTheme = e.target.value;
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
});

// Initialize everything
initCanvas();
createInitialBall();
drawBoundary();
balls[0].draw();
