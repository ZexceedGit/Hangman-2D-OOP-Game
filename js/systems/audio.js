
let audioContext = null;
let soundEnabled = true;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
};

export const setSoundEnabled = (enabled) => {
  soundEnabled = Boolean(enabled);
};

export const isSoundEnabled = () => soundEnabled;

const playTone = (
  frequency,
  duration,
  type = "square",
  volume = 0.08,
  endFrequency = frequency
) => {
  if (!soundEnabled) return;

  const audio = getAudioContext();

  if (!audio) return;

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    frequency,
    audio.currentTime
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, endFrequency),
    audio.currentTime + duration
  );

  gain.gain.setValueAtTime(
    volume,
    audio.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
};

export const playButtonSound = () => {
  playTone(520, 0.07, "square", 0.04, 680);
};

export const playCorrectSound = () => {
  playTone(620, 0.12, "square", 0.07, 880);
};

export const playWrongSound = () => {
  playTone(220, 0.2, "sawtooth", 0.06, 120);
};

export const playCoinSound = () => {
  playTone(800, 0.08, "square", 0.06, 1100);
};

export const playQuestCompleteSound = () => {
  playTone(523, 0.12, "square", 0.06, 659);

  setTimeout(() => {
    playTone(659, 0.12, "square", 0.06, 784);
  }, 120);

  setTimeout(() => {
    playTone(784, 0.2, "square", 0.06, 1047);
  }, 240);
};

export const playGameOverSound = () => {
  playTone(330, 0.2, "triangle", 0.07, 220);

  setTimeout(() => {
    playTone(220, 0.35, "triangle", 0.07, 110);
  }, 200);
};

export const stopAudio = () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
