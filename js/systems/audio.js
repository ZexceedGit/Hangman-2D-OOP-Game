
let audioContext = null;
let masterGain = null;
let musicGain = null;

const getAudioContext = () => {
  if (!audioContext || audioContext.state === "closed") {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.error("Web Audio API is not supported.");
      return null;
    }

    try {
      audioContext = new AudioContextClass();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(audioContext.destination);

      musicGain = audioContext.createGain();
      musicGain.gain.value = 0.0001;
      musicGain.connect(masterGain);
    } catch (error) {
      console.error("Audio initialization failed:", error);
      return null;
    }
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(error => {
      console.warn("Audio resume failed:", error);
    });
  }

  return audioContext;
};

export const unlockAudio = () => {
  const audio = getAudioContext();

  if (audio?.state === "suspended") {
    audio.resume().catch(error => {
      console.warn("Audio unlock failed:", error);
    });
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlockAudio, true);
  window.addEventListener("keydown", unlockAudio, true);
}

export const setSoundEnabled = () => unlockAudio();
export const isSoundEnabled = () => true;

const fadeMusicIn = (volume = 0.95) => {
  const audio = getAudioContext();

  if (!audio || !musicGain) return;

  const now = audio.currentTime;

  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(
    Math.max(0.0001, musicGain.gain.value),
    now
  );
  musicGain.gain.linearRampToValueAtTime(volume, now + 0.8);
};

const fadeMusicOut = () => {
  if (!audioContext || !musicGain) return;

  const now = audioContext.currentTime;

  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setTargetAtTime(0.0001, now, 0.12);
};

const playTone = (
  frequency,
  duration,
  type = "square",
  volume = 0.08,
  endFrequency = frequency,
  delay = 0,
  output = masterGain
) => {
  const audio = getAudioContext();

  if (!audio || !output) return;

  const now = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    Math.max(1, frequency),
    now
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, endFrequency),
    now + duration
  );

  gain.gain.setValueAtTime(0.0001, now);
  
const finalVolume = output === musicGain
  ? Math.min(volume * 3, 0.18)
  : volume;

gain.gain.exponentialRampToValueAtTime(
  Math.max(0.0002, finalVolume),
  now + Math.min(0.025, duration / 3)
);

gain.gain.setValueAtTime(finalVolume, now);

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );

  oscillator.connect(gain);
  gain.connect(output);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
};

export const playDialogueBlip = (isBoss = false, character = "") => {
  const code = String(character).toLowerCase().charCodeAt(0) || 0;

  if (isBoss) {
    const pitch = 230 + (code % 7) * 15;

    playTone(
      pitch,
      0.075,
      "triangle",
      0.3,
      pitch * 0.88
    );

    playTone(
      pitch * 1.5,
      0.045,
      "sine",
      0.018,
      pitch * 1.2,
      0.012
    );

    return;
  }

  const pitch = 850 + (code % 7) * 85;

  playTone(
    pitch,
    0.045,
    "square",
    0.065,
    pitch * 1.35
  );

  playTone(
    pitch * 1.2,
    0.035,
    "triangle",
    0.035,
    pitch * 1.5,
    0.025
  );
};

let gameMusicTimer = null;
let gameMusicStep = 0;

export const startGameMusic = () => {
  stopGameMusic();
  stopBossMusic();
  unlockAudio();

  const audio = getAudioContext();

  if (!audio || !musicGain) return;

  gameMusicStep = 0;
  fadeMusicIn(0.55);

  const melody = [
    523.25, null, 659.25, 784,
    698.46, null, 659.25, 587.33,
    523.25, null, 587.33, 659.25,
    784, null, 659.25, 587.33
  ];

  const bass = [
    130.81, null, null, null,
    196, null, null, null,
    110, null, null, null,
    174.61, null, null, null
  ];

  const harmony = [
    261.63, null, null, 392,
    null, 349.23, null, 440,
    220, null, null, 329.63,
    null, 349.23, null, 261.63
  ];

  const playStep = () => {
    const step = gameMusicStep % 16;

    if (bass[step] !== null) {
      playTone(
        bass[step],
        0.42,
        "triangle",
        0.055,
        bass[step] * 0.97,
        0,
        musicGain
      );
    }

    if (melody[step] !== null) {
      playTone(
        melody[step],
        0.19,
        "triangle",
        0.045,
        melody[step] * 0.99,
        0,
        musicGain
      );
    }

    if (harmony[step] !== null) {
      playTone(
        harmony[step],
        0.28,
        "sine",
        0.025,
        harmony[step] * 0.98,
        0,
        musicGain
      );
    }

    if (step === 0 || step === 8) {
      playTone(
        82,
        0.2,
        "sine",
        0.055,
        38,
        0,
        musicGain
      );
    }

    if (step === 4 || step === 12) {
      playNoise(
        0.10,
        0.025,
        2200,
        0,
        musicGain
      );
    }

    if (step % 2 === 1) {
      playNoise(
        0.035,
        0.009,
        6000,
        0,
        musicGain
      );
    }

    gameMusicStep++;
  };

  playStep();
  gameMusicTimer = window.setInterval(playStep, 250);
};

export const stopGameMusic = () => {
  if (gameMusicTimer !== null) {
    window.clearInterval(gameMusicTimer);
    gameMusicTimer = null;
  }

  gameMusicStep = 0;
  fadeMusicOut();
};

let bossMusicTimer = null;
let bossMusicStep = 0;

export const startBossMusic = () => {
  stopGameMusic();
  stopBossMusic();
  unlockAudio();

  const audio = getAudioContext();

  if (!audio || !musicGain) return;

  bossMusicStep = 0;
  fadeMusicIn(0.62);

  const melody = [
    233.08, null, 277.18, 311.13,
    233.08, null, 207.65, 311.13,
    196, null, 233.08, 277.18,
    311.13, null, 277.18, 233.08
  ];

  const bass = [
    55, null, 55, null,
    65.41, null, 65.41, null,
    49, null, 49, null,
    58.27, null, 58.27, null
  ];

  const highMelody = [
    466.16, null, null, 622.25,
    null, null, 415.30, null,
    392, null, null, 554.37,
    null, 466.16, null, null
  ];

  const playStep = () => {
    const step = bossMusicStep % 16;

    if (bass[step] !== null) {
      playTone(
        bass[step],
        0.34,
        "sawtooth",
        0.075,
        bass[step] * 0.94,
        0,
        musicGain
      );

      playTone(
        bass[step] * 2,
        0.24,
        "triangle",
        0.035,
        bass[step] * 1.85,
        0,
        musicGain
      );
    }

    if (melody[step] !== null) {
      playTone(
        melody[step],
        0.16,
        "sawtooth",
        0.055,
        melody[step] * 0.96,
        0,
        musicGain
      );

      playTone(
        melody[step] * 2,
        0.11,
        "square",
        0.022,
        melody[step] * 1.9,
        0.015,
        musicGain
      );
    }

    if (highMelody[step] !== null) {
      playTone(
        highMelody[step],
        0.12,
        "square",
        0.025,
        highMelody[step] * 0.98,
        0,
        musicGain
      );
    }

    if (step === 0 || step === 8) {
      playTone(
        110,
        0.28,
        "sawtooth",
        0.065,
        35,
        0,
        musicGain
      );

      playTone(
        55,
        0.35,
        "sine",
        0.065,
        28,
        0,
        musicGain
      );
    }

    if (step === 4 || step === 12) {
      playNoise(
        0.14,
        0.055,
        2600,
        0,
        musicGain
      );

      playTone(
        155,
        0.12,
        "square",
        0.035,
        75,
        0,
        musicGain
      );
    }

    if (step % 2 === 1) {
      playNoise(
        0.045,
        0.014,
        7500,
        0,
        musicGain
      );
    }

    if (step === 0 || step === 8) {
      playTone(
        164.81,
        0.18,
        "sawtooth",
        0.025,
        82.41,
        0.04,
        musicGain
      );
    }

    bossMusicStep++;
  };

  playStep();
  bossMusicTimer = window.setInterval(playStep, 175);
};

export const stopBossMusic = () => {
  if (bossMusicTimer !== null) {
    window.clearInterval(bossMusicTimer);
    bossMusicTimer = null;
  }

  bossMusicStep = 0;
  fadeMusicOut();
};

const playNoise = (
  duration = 0.2,
  volume = 0.08,
  filterFrequency = 1000,
  delay = 0,
  output = masterGain
) => {
  const audio = getAudioContext();

  if (!audio || !output) return;

  const now = audio.currentTime + delay;
  const sampleRate = audio.sampleRate;

  const buffer = audio.createBuffer(
    1,
    Math.ceil(sampleRate * duration),
    sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  source.buffer = buffer;
  filter.type = "lowpass";

  filter.frequency.setValueAtTime(filterFrequency, now);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(40, filterFrequency * 0.2),
    now + duration
  );

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  source.start(now);
  source.stop(now + duration + 0.02);
};

export const playSoundTest = () => {
  unlockAudio();

  playTone(660, 0.15, "square", 0.12, 880);
  playTone(880, 0.18, "square", 0.10, 1100, 0.18);
};

export const playButtonSound = () => {
  playTone(520, 0.07, "square", 0.06, 680);
};

export const playCorrectSound = () => {
  playTone(620, 0.12, "square", 0.09, 880);
};

export const playWrongSound = () => {
  playTone(220, 0.2, "sawtooth", 0.08, 120);
};

export const playCoinSound = () => {
  playTone(800, 0.08, "square", 0.08, 1100);
};

export const playQuestCompleteSound = () => {
  playTone(523, 0.12, "square", 0.08, 659);
  playTone(659, 0.12, "square", 0.08, 784, 0.12);
  playTone(784, 0.2, "square", 0.08, 1047, 0.24);
};

export const playGameOverSound = () => {
  playTone(330, 0.2, "triangle", 0.09, 220);
  playTone(220, 0.35, "triangle", 0.09, 110, 0.2);
};

export const playBossEntranceSound = () => {
  playTone(110, 1.4, "sawtooth", 0.12, 38);
  playTone(165, 1.1, "triangle", 0.08, 55, 0.12);
  playNoise(1.1, 0.07, 240);
};

export const playBossLandSound = () => {
  playNoise(0.42, 0.16, 180);
  playTone(85, 0.55, "sine", 0.18, 35);
  playTone(48, 0.65, "triangle", 0.13, 25, 0.04);
};

export const playBossDialogueSound = () => {
  playTone(310, 0.12, "sine", 0.04, 230);
  playTone(465, 0.16, "triangle", 0.03, 350, 0.08);
};

export const playBossHintSound = () => {
  playTone(660, 0.12, "sine", 0.08, 990);
  playTone(990, 0.16, "sine", 0.07, 1320, 0.10);
  playTone(1320, 0.22, "sine", 0.06, 1600, 0.20);
};

export const playHankAttackSound = () => {
  playNoise(0.12, 0.12, 900);
  playTone(190, 0.16, "square", 0.09, 85, 0.02);
  playTone(390, 0.09, "triangle", 0.05, 220, 0.05);
};

export const playBossDamageSound = () => {
  playNoise(0.28, 0.17, 1200);
  playTone(125, 0.30, "sawtooth", 0.12, 42);
  playTone(740, 0.12, "square", 0.06, 280, 0.03);
};

export const playBossAttackSound = () => {
  playNoise(0.45, 0.14, 500);
  playTone(180, 0.48, "sawtooth", 0.12, 45);
  playTone(75, 0.55, "sine", 0.15, 28, 0.08);
};

export const playBossDefeatSound = () => {
  playNoise(0.4, 0.08, 700);
  playTone(220, 0.25, "triangle", 0.08, 330);
  playTone(330, 0.25, "triangle", 0.08, 440, 0.22);
  playTone(440, 0.3, "triangle", 0.08, 660, 0.44);
  playTone(660, 0.65, "triangle", 0.10, 880, 0.68);
};

export const stopAudio = () => {
  stopGameMusic();
  stopBossMusic();

  if (audioContext) {
    audioContext.close();
    audioContext = null;
    masterGain = null;
    musicGain = null;
  }
};
