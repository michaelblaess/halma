// Web Audio API sound effects — no external files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  fadeOut = true,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const gain = ac.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 4000;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  source.start();
}

/** Short click — piece selected */
export function soundSelect() {
  playTone(880, 0.08, 'sine', 0.12);
  playNoise(0.03, 0.04);
}

/** Softer click — piece deselected */
export function soundDeselect() {
  playTone(440, 0.1, 'sine', 0.08);
}

/** Piece placed on new cell */
export function soundMove() {
  playTone(600, 0.06, 'triangle', 0.1);
  setTimeout(() => playTone(800, 0.06, 'triangle', 0.08), 40);
}

/** AI finishes its move */
export function soundAiMove() {
  playTone(300, 0.12, 'sine', 0.06);
  setTimeout(() => playTone(350, 0.1, 'sine', 0.05), 60);
}

/** Victory fanfare — ascending arpeggio */
export function soundWin() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'triangle', 0.15), i * 120);
  });
}

/** Loss sound — descending tones */
export function soundLoss() {
  const notes = [440, 370, 311, 261]; // A4 F#4 Eb4 C4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.35, 'sawtooth', 0.06), i * 150);
  });
}

/** New game started */
export function soundRestart() {
  playTone(523, 0.1, 'triangle', 0.08);
  setTimeout(() => playTone(659, 0.1, 'triangle', 0.08), 80);
}
