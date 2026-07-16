console.log("Frontend loaded!");


/* ============ Starfield background ============ */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.3 + 0.2,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02
        });
    }
}
function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00e5ff';
    stars.forEach(s => {
        const a = 0.25 + 0.5 * Math.abs(Math.sin(s.phase + t * s.speed));
        ctx.globalAlpha = a * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawStars);

/* ============ Clock ============ */
function tickClock() {
    const now = new Date();
    document.getElementById('clock').innerHTML =
        now.toLocaleTimeString('en-US', { hour12: false }) +
        ' <span>' + now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + '</span>';
}
tickClock(); setInterval(tickClock, 1000);

const startTime = Date.now();
function tickUptime() {
    const s = Math.floor((Date.now() - startTime) / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    document.getElementById('uptimeTag').textContent = `UPTIME ${hh}:${mm}:${ss}`;
}
setInterval(tickUptime, 1000);

/* ============ Fake vitals drift ============ */
function jitterVitals() {
    const load = 10 + Math.random() * 20 + (state === 'processing' ? 40 : 0) + (state === 'listening' ? 15 : 0);
    const mem = 30 + Math.random() * 15;
    const lat = state === 'processing' ? 60 + Math.random() * 30 : 4 + Math.random() * 10;
    document.getElementById('loadVal').textContent = Math.round(load) + '%';
    document.getElementById('loadBar').style.width = Math.min(load, 100) + '%';
    document.getElementById('memVal').textContent = Math.round(mem) + '%';
    document.getElementById('memBar').style.width = Math.min(mem, 100) + '%';
    document.getElementById('latVal').textContent = Math.round(lat) + 'ms';
    document.getElementById('latBar').style.width = Math.min(lat, 100) + '%';
}
setInterval(jitterVitals, 1400);

/* ============ Build avatar SVG ============ */
const svgns = "http://www.w3.org/2000/svg";
const svg = document.getElementById('avatarSvg');
const CX = 200, CY = 200;

function el(tag, attrs) {
    const e = document.createElementNS(svgns, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
}

// defs / glow filter
const defs = el('defs', {});
defs.innerHTML = `
  <radialGradient id="coreGrad" cx="50%" cy="45%" r="60%">
    <stop offset="0%" stop-color="#bdf4ff"/>
    <stop offset="45%" stop-color="#00e5ff"/>
    <stop offset="100%" stop-color="#062233" stop-opacity="0.2"/>
  </radialGradient>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
`;
svg.appendChild(defs);

// outer dashed ring
const ringOuter = el('circle', {
    cx: CX, cy: CY, r: 186, fill: 'none', stroke: '#00e5ff',
    'stroke-width': 1.4, 'stroke-dasharray': '2 10', 'stroke-opacity': 0.55
});
svg.appendChild(ringOuter);

// mid dashed ring (violet, opposite rotation)
const ringMid = el('circle', {
    cx: CX, cy: CY, r: 150, fill: 'none', stroke: '#8b5cf6',
    'stroke-width': 1.2, 'stroke-dasharray': '22 6', 'stroke-opacity': 0.5
});
svg.appendChild(ringMid);

// tick ring
const tickGroup = el('g', { id: 'tickGroup' });
for (let i = 0; i < 48; i++) {
    const ang = (i / 48) * Math.PI * 2;
    const len = i % 4 === 0 ? 10 : 5;
    const r1 = 122, r2 = 122 - len;
    const x1 = CX + r1 * Math.cos(ang), y1 = CY + r1 * Math.sin(ang);
    const x2 = CX + r2 * Math.cos(ang), y2 = CY + r2 * Math.sin(ang);
    tickGroup.appendChild(el('line', { x1, y1, x2, y2, stroke: '#4a6178', 'stroke-width': 1 }));
}
svg.appendChild(tickGroup);

// equalizer ring (audio reactive bars)
const barCount = 64;
const eqGroup = el('g', { id: 'eqGroup' });
const bars = [];
for (let i = 0; i < barCount; i++) {
    const ang = (i / barCount) * Math.PI * 2;
    const bar = el('line', {
        x1: 0, y1: 0, x2: 0, y2: 0,
        stroke: '#00e5ff', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-opacity': 0.85
    });
    bar.dataset.ang = ang;
    eqGroup.appendChild(bar);
    bars.push(bar);
}
svg.appendChild(eqGroup);

// hexagonal iris blades
const irisGroup = el('g', { id: 'irisGroup', filter: 'url(#glow)' });
const bladeCount = 6;
const blades = [];
for (let i = 0; i < bladeCount; i++) {
    const blade = el('path', { fill: '#0b2334', stroke: '#00e5ff', 'stroke-width': 1, 'stroke-opacity': 0.6, 'fill-opacity': 0.85 });
    irisGroup.appendChild(blade);
    blades.push(blade);
}
svg.appendChild(irisGroup);

// core orb
const core = el('circle', { cx: CX, cy: CY, r: 34, fill: 'url(#coreGrad)', filter: 'url(#glow)' });
svg.appendChild(core);

function drawIris(openness) {
    // openness: 0 (closed-ish) .. 1 (fully open)
    const rOuter = 70;
    const innerR = 30 + openness * 20;
    for (let i = 0; i < bladeCount; i++) {
        const a0 = (i / bladeCount) * Math.PI * 2;
        const a1 = ((i + 1) / bladeCount) * Math.PI * 2;
        const overlap = 0.18;
        const bendR = innerR;
        const p1x = CX + rOuter * Math.cos(a0), p1y = CY + rOuter * Math.sin(a0);
        const p2x = CX + rOuter * Math.cos(a1), p2y = CY + rOuter * Math.sin(a1);
        const midA = (a0 + a1) / 2 + overlap;
        const p3x = CX + bendR * Math.cos(midA), p3y = CY + bendR * Math.sin(midA);
        blades[i].setAttribute('d', `M${p1x},${p1y} L${p3x},${p3y} L${p2x},${p2y} Z`);
    }
}
drawIris(0.15);

/* ============ State machine ============ */
let state = 'idle'; // idle | listening | processing | speaking
const statusLabel = document.getElementById('statusLabel');
const statusSub = document.getElementById('statusSub');
const modeState = document.getElementById('modeState');
const micBtn = document.getElementById('micBtn');

function setState(s) {
    state = s;
    statusSub.className = 'status-sub' + (s !== 'idle' ? ' state-' + s : '');
    const map = {
        idle: 'idle · awaiting command',
        listening: 'listening…',
        processing: 'processing input',
        speaking: 'responding'
    };
    statusSub.textContent = map[s];
    modeState.textContent = s.toUpperCase();
    micBtn.classList.toggle('active', s === 'listening');
    drawIris(s === 'idle' ? 0.12 : s === 'listening' ? 0.9 : s === 'processing' ? 0.5 : 0.7);
    ringOuter.style.animation = (s === 'processing') ? 'none' : '';
}

/* ============ Continuous animation loop ============ */
let simPhase = 0;
let audioLevels = new Array(barCount).fill(0);
let analyser = null, dataArray = null, audioCtxRef = null;

function animate() {
    simPhase += 0.02;

    // ring rotation speeds vary with state
    const outerSpeed = state === 'processing' ? 1.8 : 0.25;
    const midSpeed = state === 'processing' ? -2.4 : -0.35;
    const t = performance.now() / 1000;
    ringOuter.setAttribute('transform', `rotate(${(t * outerSpeed * 20) % 360} ${CX} ${CY})`);
    ringMid.setAttribute('transform', `rotate(${(t * midSpeed * 20) % 360} ${CX} ${CY})`);
    tickGroup.setAttribute('transform', `rotate(${(t * 8) % 360} ${CX} ${CY})`);

    // pulsing core
    const pulse = 1 + 0.05 * Math.sin(t * (state === 'listening' ? 6 : 2));
    core.setAttribute('r', 34 * pulse);

    // equalizer bars: use real analyser if available, else simulate
    let levels;
    if (analyser && (state === 'listening')) {
        analyser.getByteFrequencyData(dataArray);
        levels = [];
        for (let i = 0; i < barCount; i++) {
            const idx = Math.floor((i / barCount) * dataArray.length * 0.6);
            levels.push(dataArray[idx] / 255);
        }
    } else {
        levels = [];
        for (let i = 0; i < barCount; i++) {
            const base = state === 'speaking' ? 0.35 : state === 'processing' ? 0.2 : 0.06;
            const wobble = Math.sin(simPhase * 3 + i * 0.4) * 0.5 + 0.5;
            levels.push(base + wobble * (state === 'idle' ? 0.04 : 0.25));
        }
    }
    // smooth
    for (let i = 0; i < barCount; i++) {
        audioLevels[i] += (levels[i] - audioLevels[i]) * 0.35;
        const ang = parseFloat(bars[i].dataset.ang);
        const r1 = 96;
        const r2 = 96 + 4 + audioLevels[i] * 38;
        const x1 = CX + r1 * Math.cos(ang), y1 = CY + r1 * Math.sin(ang);
        const x2 = CX + r2 * Math.cos(ang), y2 = CY + r2 * Math.sin(ang);
        bars[i].setAttribute('x1', x1); bars[i].setAttribute('y1', y1);
        bars[i].setAttribute('x2', x2); bars[i].setAttribute('y2', y2);
        bars[i].setAttribute('stroke', state === 'speaking' ? '#8b5cf6' : (state === 'processing' ? '#ffb020' : '#00e5ff'));
    }

    // audio signal readout
    const avgLevel = audioLevels.reduce((a, b) => a + b, 0) / barCount;
    document.getElementById('sigVal').textContent = Math.round(avgLevel * 100) + '%';
    document.getElementById('sigBar').style.width = Math.min(avgLevel * 100, 100) + '%';

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
setState('idle');

/* ============ Microphone / audio reactivity ============ */
async function enableMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef = new AudioContext();
        const source = audioCtxRef.createMediaStreamSource(stream);
        analyser = audioCtxRef.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        document.getElementById('micState').textContent = 'LIVE';
        return true;
    } catch (e) {
        document.getElementById('micState').textContent = 'DENIED (SIM MODE)';
        return false;
    }
}

/* ============ Speech recognition (best-effort) ============ */
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
if (SpeechRecognitionAPI) {
    document.getElementById('apiState').textContent = 'AVAILABLE';
    recognizer = new SpeechRecognitionAPI();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';
    recognizer.onresult = (e) => {
        const text = e.results[0][0].transcript;
        handleCommand(text, true);
    };
    recognizer.onerror = () => { setState('idle'); };
    recognizer.onend = () => { if (state === 'listening') setState('idle'); };
} else {
    document.getElementById('apiState').textContent = 'UNSUPPORTED';
}

let micActive = false;
micBtn.addEventListener('click', async () => {
    if (!micActive) {
        if (!analyser) await enableMic();
        micActive = true;
        setState('listening');
        if (recognizer) { try { recognizer.start(); } catch (e) { } }
    } else {
        micActive = false;
        setState('idle');
        if (recognizer) { try { recognizer.stop(); } catch (e) { } }
    }
});

/* ============ Command handling ============ */
const transcript = document.getElementById('transcript');
const msgCount = document.getElementById('msgCount');
let entries = 1;

function addMessage(who, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + (who === 'user' ? 'user' : 'aria');
    const tag = who === 'user' ? 'YOU' : 'ARIA · reply';
    div.innerHTML = `<span class="tag">${tag}</span>${text}`;
    transcript.appendChild(div);
    transcript.scrollTop = transcript.scrollHeight;
    entries++;
    msgCount.textContent = entries + ' ENTRIES';
}

function respondTo(cmdRaw) {
    const cmd = cmdRaw.toLowerCase();
    if (cmd.includes('time')) {
        return `Current time is ${new Date().toLocaleTimeString('en-US', { hour12: false })}.`;
    }
    if (cmd.includes('status')) {
        return `All systems nominal. Core load stable, audio link clear, response latency within range.`;
    }
    if (cmd.includes('joke') || cmd.includes('something')) {
        return `Here's one: I tried to take a nap in sleep mode, but my cooling fan wouldn't stop dreaming out loud.`;
    }
    if (cmd.includes('help')) {
        return `Try commands like "status", "time", "tell me something", or ask me anything — I'll acknowledge and log it.`;
    }
    if (cmd.includes('hello') || cmd.includes('hi')) {
        return `Hello. ARIA-7 standing by — what do you need?`;
    }
    return `Acknowledged: "${cmdRaw}". Logged to memory thread — no matching protocol, but I'm listening.`;
}

function handleCommand(text, fromVoice) {
    if (!text || !text.trim()) return;
    addMessage('user', text);
    setState('processing');
    setTimeout(() => {
        setState('speaking');
        const reply = respondTo(text);
        addMessage('aria', reply);
        setTimeout(() => { setState('idle'); micActive = false; }, 1800);
    }, 700 + Math.random() * 500);
}

document.getElementById('sendBtn').addEventListener('click', () => {
    const input = document.getElementById('cmdInput');
    if (input.value.trim()) {
        handleCommand(input.value.trim(), false);
        input.value = '';
    }
});
document.getElementById('cmdInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('sendBtn').click();
});
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        handleCommand(chip.dataset.cmd, false);
    });
});