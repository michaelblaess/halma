// Background music player — shuffled playlist, loops forever

const TRACKS = [
  '/music/cyberpunk.mp3',
  '/music/epic-short.mp3',
  '/music/epicness-middle.mp3',
];

let audio: HTMLAudioElement | null = null;
let playlist: string[] = [];
let currentIndex = 0;
let isPlaying = false;
let volume = 0.25;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function playNext() {
  if (!isPlaying) return;

  currentIndex++;
  if (currentIndex >= playlist.length) {
    // Reshuffle for next round
    playlist = shuffle(TRACKS);
    currentIndex = 0;
  }
  loadAndPlay();
}

function loadAndPlay() {
  if (!audio) {
    audio = new Audio();
    audio.addEventListener('ended', playNext);
  }
  audio.src = playlist[currentIndex];
  audio.volume = volume;
  audio.play().catch(() => {
    // Browser blocked autoplay — will retry on next user interaction
  });
}

export function musicPlay() {
  if (isPlaying) return;
  isPlaying = true;
  playlist = shuffle(TRACKS);
  currentIndex = 0;
  loadAndPlay();
}

export function musicStop() {
  isPlaying = false;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function musicToggle(): boolean {
  if (isPlaying) {
    musicStop();
  } else {
    musicPlay();
  }
  return isPlaying;
}

export function musicSetVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (audio) audio.volume = volume;
}

export function musicIsPlaying(): boolean {
  return isPlaying;
}

// Auto-start music on first user interaction (browser requires gesture)
let autoStartRegistered = false;
export function musicAutoStart() {
  if (autoStartRegistered) return;
  autoStartRegistered = true;
  const start = () => {
    if (!isPlaying) musicPlay();
    document.removeEventListener('click', start);
    document.removeEventListener('keydown', start);
  };
  document.addEventListener('click', start, { once: false });
  document.addEventListener('keydown', start, { once: false });
}
