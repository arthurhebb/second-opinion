// Retro sound effects — pure Web Audio API, no files needed

let ctx = null;
let muted = false;

const MUTE_KEY = 'second-opinion-muted';

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  muted = localStorage.getItem(MUTE_KEY) === 'true';
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(MUTE_KEY, muted);
  return muted;
}

// Ensure audio context is resumed (browsers block autoplay)
function ensureCtx() {
  if (!ctx) initAudio();
  if (ctx.state === 'suspended') ctx.resume();
}

function playTone(freq, duration, type = 'square', volume = 0.08, delay = 0) {
  if (muted) return;
  ensureCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration, volume = 0.03) {
  if (muted) return;
  ensureCtx();

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

// === SOUND EFFECTS ===

export function sfxTypewriter() {
  playNoise(0.02, 0.015);
}

export function sfxClick() {
  playTone(800, 0.06, 'square', 0.04);
}

export function sfxCorrect() {
  playTone(523, 0.12, 'square', 0.07, 0);      // C5
  playTone(659, 0.12, 'square', 0.07, 0.1);     // E5
  playTone(784, 0.2, 'square', 0.07, 0.2);      // G5
}

export function sfxWrong() {
  playTone(330, 0.15, 'sawtooth', 0.06, 0);     // E4
  playTone(247, 0.25, 'sawtooth', 0.06, 0.12);  // B3
}

export function sfxInvestigationOrder() {
  playTone(440, 0.06, 'sine', 0.04, 0);
  playTone(440, 0.06, 'sine', 0.04, 0.12);
  playTone(440, 0.06, 'sine', 0.04, 0.24);
}

export function sfxResultArrived() {
  playTone(880, 0.1, 'sine', 0.06);
}

export function sfxDailyChallenge() {
  playTone(220, 0.3, 'sawtooth', 0.04, 0);
  playTone(330, 0.3, 'sawtooth', 0.04, 0.25);
  playTone(440, 0.4, 'square', 0.05, 0.5);
}

export function sfxStreak(level) {
  // Quick ascending scale — more notes for higher streaks
  const notes = [523, 587, 659, 698, 784, 880];
  const count = Math.min(level, notes.length);
  for (let i = 0; i < count; i++) {
    playTone(notes[i], 0.1, 'square', 0.06, i * 0.08);
  }
}

export function sfxSubmit() {
  playTone(440, 0.08, 'sine', 0.05, 0);
  playTone(554, 0.08, 'sine', 0.05, 0.06);
  playTone(659, 0.12, 'sine', 0.05, 0.12);
}

export function sfxNavigate() {
  playTone(600, 0.04, 'square', 0.025);
}
