
import {
  GROUND_Y,
  INITIAL_HEARTS,
  INITIAL_SCORE,
  CANVAS_WIDTH,
   WORLD_WIDTH
} from "./constants.js";

import { NPCS, BOSS } from "./data/npcs.js";
import { PLATS } from "./data/world.js";

import { Round } from "./logic/round.js";
import { calculateQuestScore } from "./logic/scoring.js";

import {
  initializeProgression,
  completeNPCQuest,
  failNPCQuest,
  areAllQuestsComplete,
  getQuestProgress
} from "./logic/progression.js";

import {
  updatePlayer,
  createPlayer
} from "./systems/physics.js";

import {
  inputState,
  initializeInput
} from "./systems/input.js";

import {
  initializeCanvas,
  updateCamera,
  camera
} from "./engine/canvas.js";

import { drawEnvironment } from "./engine/drawing.js";

import {
  drawPlayer,
  drawNPCs,
  hankSVG,
  bossSVG,
  poseHank,
  MOOD
} from "./engine/characters.js";

import { drawCaptives } from "./engine/captives.js";
import {
  updateFX,
  drawFX,
  burst
} from "./engine/effects.js";

import {
  loadSettings,
  loadBestScore,
  saveBestScore,
  saveSettings
} from "./systems/storage.js";

import {
  setSoundEnabled,
  playCorrectSound,
  playWrongSound,
  playCoinSound,
  playQuestCompleteSound,
  playGameOverSound
} from "./systems/audio.js";

export const game = {
  mode: "menu",
  player: null,
  coinPickups: [],
  score: INITIAL_SCORE,
  candies: 0,
  keys: 0,
  hearts: INITIAL_HEARTS,
  completed: 0,
  elapsedTime: 0,
  bestScore: 0,
  settings: {},
  activeNPC: null,
 boss: {
  unlocked: false,
  hp: BOSS.maxHP,
  maxHP: BOSS.maxHP,
  round: null,
  timeLeft: BOSS.timeLimit,
  timer: null,
  active: false,
  defeated: false,
  revealed: false,
  revealStartedAt: null,
  revealCutsceneActive: false,
cameraPanFrom: null,
cameraPanTarget: null
}
};
const startBossQuest = () => {
  if (
    !game.boss.unlocked ||
    game.boss.defeated ||
    game.boss.active
  ) return;

  clearQuestResult();
  closeDialogue();

  game.boss.active = true;
  game.boss.hp = BOSS.maxHP;

  game.activeNPC = BOSS;
  game.mode = "boss";

  const art = getElement("gameArt");

  if (art) {
    art.innerHTML = hankSVG();
    poseHank(art, 0, MOOD[0]);
  }

  const display = getElement("bossDisplay");

  if (display) {
    display.innerHTML = `
      <div class="boss-side-info">
        <strong>THE HANGMAN KING</strong>

        <div class="boss-health-track">
          <div id="bossHPFill"></div>
        </div>

        <span id="bossHPText">${BOSS.maxHP} / ${BOSS.maxHP} HP</span>
        <span id="bossTimerText">40 SECONDS</span>
      </div>

      <div class="boss-side-art">
        ${bossSVG()}
      </div>
    `;

    display.hidden = false;
  }

  getElement("gameStage")?.classList.add("boss-fight-layout");
  getElement("quest")?.classList.add("boss-mode-quest");

  showScreen("quest");
  closeDialogue(true);
  startBossRound();
};

const startBossRound = () => {
  if (!game.boss.active || game.mode !== "boss") return;

  game.boss.round = Round.make(BOSS);
  game.boss.round.hintsUsed = 0;
  Round.s = game.boss.round;

  startBossTimer();
  renderQuest();
};

const startBossTimer = () => {
  clearInterval(game.boss.timer);

  game.boss.timeLeft = BOSS.timeLimit;

  game.boss.timer = window.setInterval(() => {
    if (game.mode !== "boss" || !game.boss.active) {
      clearInterval(game.boss.timer);
      game.boss.timer = null;
      return;
    }

    game.boss.timeLeft--;

    renderQuest();

    if (game.boss.timeLeft <= 0) {
      bossTimeout();
    }
  }, 1000);
};

const bossRoundWon = () => {
  clearInterval(game.boss.timer);
  game.boss.timer = null;

  clearTimeout(successTimer);
  successTimer = null;

  game.boss.hp--;

  bossDamageAnimation();

  renderQuest();

  if (game.boss.hp <= 0) {
    defeatBoss();
    return;
  }

  showToast(`BOSS DAMAGED! ${game.boss.hp}/${BOSS.maxHP} HP`);

  window.setTimeout(() => {
    if (game.mode === "boss" && game.boss.active) {
      startBossRound();
    }
  }, 1200);
};
const bossTimeout = () => {
  clearInterval(game.boss.timer);
  game.boss.timer = null;

  game.hearts = Math.max(0, game.hearts - 1);

  showToast("THE HANGMAN KING ATTACKS! -1 HEART");

  updateHUD();

  if (game.hearts <= 0) {
    game.boss.active = false;
    endGame(false);
    return;
  }

  window.setTimeout(() => {
    if (game.mode === "boss" && game.boss.active) {
      startBossRound();
    }
  }, 1000);
};

const defeatBoss = () => {
  clearInterval(game.boss.timer);
  game.boss.timer = null;

  game.boss.hp = 0;
  game.boss.active = false;
  game.boss.defeated = true;

  game.activeNPC = null;
  game.boss.round = null;
  Round.s = null;

  showToast("THE HANGMAN KING HAS FALLEN!");

  endGame(true);
};
let animationFrame = null;
let previousTime = 0;
let questFinishTimer = null;

const dialogue = {
  npc: null,
  typingTimer: null,
  typing: false,
  bossIntroActive: false,
  bossIntroIndex: 0
};


const getElement = id => document.getElementById(id);

const setVisible = (id, visible) => {
  const element = getElement(id);

  if (element) {
    element.hidden = !visible;
  }
};

const showScreen = screenId => {
  ["menu", "tut", "set", "pause", "quest", "end"].forEach(id => {
    const element = getElement(id);

    if (!element) return;

    element.classList.toggle("active", id === screenId);
    element.hidden = id !== screenId;
  });
};

const createCoins = () => {
  const coins = [];

  for (let i = 0; i < 38; i++) {
    coins.push({
      x: 260 + i * 128 + (i % 3) * 14,
      y: GROUND_Y - 26 - (i % 5 === 0 ? 44 : 0),
      collected: false
    });
  }

  PLATS.forEach(platform => {
    for (let i = 0; i < 3; i++) {
      coins.push({
        x: platform.x + platform.w / 2 + (i - 1) * 34,
        y: platform.y - 28,
        collected: false
      });
    }
  });

  return coins;
};

const pad = (number, length = 2) => {
  return String(Math.max(0, Math.round(number))).padStart(length, "0");
};

const updateHUD = () => {
  const progress = getQuestProgress();
  const seconds = Math.floor(game.elapsedTime);

  const values = {
    hC: pad(game.candies, 2),
    hK: game.keys,
    hT: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`,
    hS: pad(game.score + game.candies * 10, 6),
    hH: game.hearts
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = getElement(id);

    if (element) {
      element.textContent = value;
    }
  });

  const bar = getElement("bar");

  if (bar) {
    bar.innerHTML = "";

    for (let i = 0; i < progress.total; i++) {
      const segment = document.createElement("i");

      if (i < progress.completed) {
        segment.classList.add("on");
      }

      bar.appendChild(segment);
    }
  }
};

const showToast = message => {
  const toast = getElement("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.style.display = "block";

  window.clearTimeout(showToast.timeout);

  showToast.timeout = window.setTimeout(() => {
    toast.hidden = true;
    toast.style.display = "none";
  }, 2200);
};

/* ---------- DIALOGUE ---------- */
const say = (element, message) => {
  if (!element) return;

  window.clearInterval(dialogue.typingTimer);

  const textElement = element.querySelector(".txt");
  if (!textElement) return;

  let index = 0;
  dialogue.typing = true;
  textElement.textContent = "";

  const updateInstruction = () => {
    if (!dialogue.bossIntroActive) return;

    const instruction = element.querySelector("i");

    if (instruction) {
      const lastLine =
        dialogue.bossIntroIndex >= BOSS.introLines.length - 1;

      instruction.textContent = dialogue.typing
        ? "THE KING IS SPEAKING..."
        : lastLine
          ? "E · BEGIN THE BATTLE"
          : "E · CONTINUE";
    }
  };

  const finishTyping = () => {
    window.clearInterval(dialogue.typingTimer);
    dialogue.typingTimer = null;
    dialogue.typing = false;
    textElement.textContent = message;
    updateInstruction();
  };

  if (!message.length) {
    finishTyping();
    return;
  }

  dialogue.typingTimer = window.setInterval(() => {
    textElement.textContent = message.slice(0, ++index);

    if (index >= message.length) {
      finishTyping();
    }
  }, 22);

  updateInstruction();
};

const openDialogue = (npc, message) => {
  const element = getElement("dlg");

  if (!element) return;

  dialogue.npc = npc;

  element.style.display = "block";
  element.hidden = false;

  const name = element.querySelector("b");
  const instruction = element.querySelector("i");

  if (name) {
    name.textContent = npc.name;
  }

  if (instruction) {
  instruction.textContent =
    npc === BOSS
      ? "E · Begin the battle     Esc · Later"
      : npc.state === 2
        ? "E · Chat     Esc · Close"
        : "E · Take the quest     Esc · Later";
}
  say(element, message);
};const closeDialogue = (force = false) => {
  if (
    !force &&
    (
      dialogue.bossIntroActive ||
      (dialogue.npc && dialogue.typing)
    )
  ) return;

  window.clearInterval(dialogue.typingTimer);

  dialogue.typingTimer = null;
  dialogue.typing = false;
  dialogue.npc = null;
  dialogue.bossIntroActive = false;
  dialogue.bossIntroIndex = 0;

  const element = getElement("dlg");

  if (element) {
    element.style.display = "none";
    element.hidden = true;
  }
};
const openBossIntro = () => {
  dialogue.bossIntroActive = true;
  dialogue.bossIntroIndex = 0;

  openDialogue(BOSS, BOSS.introLines[0]);

  const element = getElement("dlg");
  const instruction = element?.querySelector("i");

  if (instruction) {
    instruction.textContent = "THE KING IS SPEAKING...";
  }
};

const advanceBossIntro = () => {
  if (!dialogue.bossIntroActive || dialogue.typing) return;

  const lastLine =
    dialogue.bossIntroIndex >= BOSS.introLines.length - 1;

  if (!lastLine) {
    dialogue.bossIntroIndex++;

    const element = getElement("dlg");

    say(
      element,
      BOSS.introLines[dialogue.bossIntroIndex]
    );

    return;
  }

  dialogue.bossIntroActive = false;
  closeDialogue(true);
  startBossQuest();
};

const getNearestNPC = () => {
  if (!game.player) return null;

  const playerCenter =
    game.player.x + game.player.width / 2;

  let nearest = null;
  let nearestDistance = 80;

  NPCS.forEach(npc => {
    const distance = Math.abs(playerCenter - npc.x);

    if (distance < nearestDistance) {
      nearest = npc;
      nearestDistance = distance;
    }
  });

  if (game.boss.unlocked && !game.boss.defeated) {
    const distance = Math.abs(playerCenter - BOSS.x);

    if (distance < 115 && distance < nearestDistance) {
      nearest = BOSS;
    }
  }

  return nearest;
};
const interact = () => {
  if (game.mode !== "play") return;

  if (dialogue.bossIntroActive) {
    advanceBossIntro();
    return;
  }
if (dialogue.npc && dialogue.typing) return;
  const npc = getNearestNPC();

  if (!npc) {
    closeDialogue();
    showToast("There is nobody nearby.");
    return;
  }

  if (npc === BOSS) {
    openBossIntro();
    return;
  }

  if (dialogue.npc === npc && npc.state !== 2) {
    closeDialogue();
    startQuest(npc);
    return;
  }

  let message;

  if (npc.state === 2) {
    message = npc.done;
  } else if (npc.failed) {
    message = "Hank's back on the rope! Try a fresh word?";
  } else if (npc.round) {
    message = "Ready to get back to Hank?";
  } else {
    message = npc.intro;
  }

  openDialogue(npc, message);
};const updateDialogueDistance = () => {
  if (!dialogue.npc || !game.player) return;

  if (dialogue.typing || dialogue.bossIntroActive) return;

  const playerCenter =
    game.player.x + game.player.width / 2;

  if (Math.abs(dialogue.npc.x - playerCenter) > 130) {
    closeDialogue();
  }
};

let feedbackRoundId = "";
let feedbackGuessCount = 0;
let resultRoundId = "";
let resultTimer = null;
let successTimer = null;
let resultOverlay = null;

const renderQuest = () => {
  const npc = game.activeNPC;

  if (!npc || !Round.s) return;

  const who = getElement("qWho");
  const clue = getElement("qClue");
  const word = getElement("word");
  const keys = getElement("keys");
  const candy = getElement("qCandy");
  const hintButton = getElement("hintBtn");

  const roundId = `${npc.name}:${Round.s.word}`;
  const guessedLetters = Round.s.guessed || [];

  if (
    roundId !== feedbackRoundId ||
    guessedLetters.length < feedbackGuessCount
  ) {
    clearTimeout(resultTimer);
    resultTimer = null;

    resultOverlay?.remove();
    resultOverlay = null;

    feedbackRoundId = roundId;
    feedbackGuessCount = 0;
    resultRoundId = "";
  }

  const isBoss = npc === BOSS;

if (who) {
  who.textContent = isBoss
    ? `${BOSS.name} · ${game.boss.hp}/${BOSS.maxHP} HP`
    : npc.goal || npc.name;
}

if (clue) {
  clue.textContent = isBoss
    ? `${Round.s.clue} · ${Round.s.word.length} letters · ${game.boss.timeLeft}s`
    : `${Round.s.clue} · ${Round.s.word.length} letters`;
}

if (isBoss) {
  const hpFill = getElement("bossHPFill");
  const hpText = getElement("bossHPText");

  if (hpFill) {
    hpFill.style.width =
      `${(game.boss.hp / BOSS.maxHP) * 100}%`;
  }

  if (hpText) {
    hpText.textContent =
      `${game.boss.hp} / ${BOSS.maxHP} HP`;
  }
}
  if (candy) {
    candy.textContent = game.candies;
  }

  const won = Round.won();
  const lost = Round.lost();


  // ts fro hangman dialogue
  if (guessedLetters.length > feedbackGuessCount) {
    const letter = guessedLetters[guessedLetters.length - 1];
    const correct = Round.s.word.toLowerCase().includes(letter.toLowerCase());

    const correctLines = [
      "Nice one!",
      "Okay, okay, I see you.",
      "Correct! I'm almost impressed.",
      "Yes! Keep going!"
    ];

    const wrongLines = [
      "Wrong! But hey, I got a head.",
      "Nope! That's another piece!",
      "An arm?! Anyone going to help me?",
      "Two arms. I can still wave goodbye!",
      "A leg! This is getting ridiculous."
    ];

    let feedback;

    if (lost) {
      feedback = "Tell my mom I wasn't scared. I was very scared.";
    } else if (correct) {
      feedback = correctLines[
        (guessedLetters.length - 1) % correctLines.length
      ];
    } else {
      feedback =
        wrongLines[Math.min(Round.s.misses - 1, wrongLines.length - 1)];
    }

    const bubble = getElement("bubble");
    const bubbleText = bubble?.querySelector(".txt");

    if (bubble && bubbleText) {
      bubbleText.textContent = feedback;
      bubble.style.display = "block";
    }

    feedbackGuessCount = guessedLetters.length;
  }

  if (word) {
    word.innerHTML = "";

    [...Round.s.word].forEach(letter => {
      const slot = document.createElement("span");
      const guessed = guessedLetters.includes(letter);

     const revealedByBoss =
  isBoss &&
  guessed &&
  Round.s.revealedLetter === letter;

slot.className =
  `letter-slot${lost && !guessed ? " lost" : ""}`;

if (revealedByBoss) {
  slot.classList.add("hint-revealed");
}

      slot.textContent =
        guessed || lost ? letter.toUpperCase() : "";

      word.appendChild(slot);
    });
  }

  if (keys) {
    keys.innerHTML = "";

    ["qwertyuiop", "asdfghjkl", "zxcvbnm"].forEach(row => {
      const rowElement = document.createElement("div");
      rowElement.className = "keyboard-row";

      [...row].forEach(letter => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "keyboard-key";
        button.dataset.letter = letter;
        button.textContent = letter;

        const guessed = guessedLetters.includes(letter);

        button.disabled = guessed || Round.over();

        if (guessed) {
          button.classList.add(
            Round.s.word.includes(letter) ? "hit" : "miss"
          );
        }

        rowElement.appendChild(button);
      });

      keys.appendChild(rowElement);
    });
  }
if (hintButton) {
  if (isBoss) {
    const hintAvailable = (Round.s.hintsUsed || 0) < 1;

    hintButton.textContent = hintAvailable
      ? "REVEAL ONE LETTER · FREE"
      : "HINT ALREADY USED";

    hintButton.disabled =
      Round.over() ||
      Round.hidden().length <= 1 ||
      !hintAvailable;
  } else {
    const canPay = game.candies >= 5;

    hintButton.textContent = canPay
      ? "Free hint (-5 candies)"
      : "Cheat code (costs 1 try)";

    hintButton.disabled =
      Round.over() ||
      Round.hidden().length <= 1 ||
      (!canPay && Round.triesLeft() <= 1);
  }
}
  // Update Hank's appearance
  const art = getElement("gameArt");

  if (art) {
   poseHank(
      art,
      won ? 6 : Round.s.misses,
      won ? "happy" : MOOD[Round.s.misses],
      game.mode === "boss"
        ? ""
        : won ? "free" : lost ? "dead" : ""
    );
  }

  // Display the result after Hank's animation
if (lost && game.mode == "quest" && resultRoundId !== roundId) {
      resultRoundId = roundId;

    resultTimer = setTimeout(() => {
      if (
        game.mode !== "quest" ||
        game.activeNPC !== npc
      ) return;

    const quest = getElement("quest");

if (!quest) return;

if (game.hearts <= 0) {
    endGame(false);
    return;
}

if (resultOverlay) return;

      const overlay = document.createElement("div");
      overlay.className = "hangman-result-overlay";

      const panel = document.createElement("div");
      panel.className = "hangman-result";

      const title = document.createElement("h2");
      title.textContent = won ? "HANK IS FREE!" : "GAME OVER";

      const message = document.createElement("p");
      message.textContent = won
        ? (npc.free || "You successfully freed Hank!")
        : "Oh no! Hank ran out of luck. Better luck next time!";

     
const actions = document.createElement("div");
actions.className = "hangman-result-actions";

if (game.hearts <= 0) {
  const retryButton = document.createElement("button");

  retryButton.type = "button";
  retryButton.textContent = "Retry Game";

  retryButton.addEventListener("click", () => {
    clearQuestResult();
    startNewGame();
  });

  actions.appendChild(retryButton);
} else {
  const townButton = document.createElement("button");

  townButton.type = "button";
  townButton.textContent = "Return to Town";

  townButton.addEventListener("click", () => {
    closeQuest();
  });

  actions.appendChild(townButton);
}

      panel.append(title, message, actions);
      overlay.appendChild(panel);
      quest.appendChild(overlay);

      resultOverlay = overlay;
    }, lost ? 1300 : 450);
  }
};
const completeQuest = () => {
  const npc = game.activeNPC;

  if (!npc || !Round.s) return;

  const points = calculateQuestScore(Round.triesLeft());

  // Release the captive
  npc.ft = performance.now() / 1000;
  completeNPCQuest(npc);

  const allQuestsDone = areAllQuestsComplete();

  if (allQuestsDone) {
    game.boss.unlocked = true;
  }

  // Award rewards
  game.score += points;
  game.keys++;
  game.completed++;
  game.candies += 5;

  playQuestCompleteSound();

  // Release particles
  burst(
    npc.x + (npc.bx || 40),
    npc.by || GROUND_Y - 35,
    "#ff6f9c",
    24
  );

  showToast(
    `${npc.free} +${points} points +5 candies +1 key`
  );

  // Clear the completed round
  npc.round = null;
  npc.failed = false;

  clearTimeout(successTimer);
  successTimer = null;

  clearQuestResult();

  Round.s = null;
  game.activeNPC = null;
  game.mode = "play";

  showScreen(null);
  updateHUD();

  // Show NPC completion dialogue
  window.setTimeout(() => {
    if (game.mode === "play") {
      openDialogue(npc, npc.done);
    }
  }, 300);

  // Unlock notification
  if (allQuestsDone) {
    window.setTimeout(() => {
      if (game.boss.unlocked && !game.boss.defeated) {
        showToast(
          "THE HANGMAN KING HAS APPEARED! GO TO THE END OF THE MAP!"
        );
      }
    }, 2300);
  }
};

const clearQuestResult = () => {
  if (resultTimer !== null) {
    clearTimeout(resultTimer);
    resultTimer = null;
  }

  if (successTimer !== null) {
    clearTimeout(successTimer);
    successTimer = null;
  }

  resultOverlay?.remove();
  resultOverlay = null;

  feedbackRoundId = "";
  feedbackGuessCount = 0;
  resultRoundId = "";

  const bubble = getElement("bubble");

  if (bubble) {
    bubble.style.display = "none";

    const text = bubble.querySelector(".txt");
    if (text) text.textContent = "";
  }
};

const startQuest = (npc, fresh = false) => {
  if (!npc) return;

  if (npc.state === 2) {
    openDialogue(npc, npc.done);
    return;
  }

  clearQuestResult();
  closeDialogue();

  if (fresh || !npc.round) {
    npc.round = Round.make(npc);
  }

  game.activeNPC = npc;
  Round.s = npc.round;
  npc.failed = false;
  game.mode = "quest";

  const art = getElement("gameArt");

  if (art) {
const bossDisplay = getElement("bossDisplay");

if (bossDisplay) {
  bossDisplay.hidden = true;
  bossDisplay.innerHTML = "";
}

getElement("gameStage")?.classList.remove("boss-fight-layout");
getElement("quest")?.classList.remove("boss-mode-quest");
art.innerHTML = hankSVG();
    poseHank(
      art,
      0,
      MOOD[0]
    );
  }

  showScreen("quest");
  renderQuest();
};


const closeQuest = () => {
  if (game.mode !== "quest") return;

  const npc = game.activeNPC;

  if (npc && Round.s && Round.lost()) {
    npc.round = null;
  }

  clearQuestResult();

  game.mode = "play";
  game.activeNPC = null;
  Round.s = null;

  showScreen(null);
  updateHUD();

  if (game.hearts <= 0) {
    endGame(false);
  }
};


const failQuest = () => {
  const npc = game.activeNPC;

  if (!npc || npc.failed) return;

  npc.failed = true;

  game.hearts = Math.max(0, game.hearts - 1);

  failNPCQuest(npc);
  playGameOverSound();

  showToast(npc.fail || "You ran out of tries!");

  updateHUD();
};
const handleGuess = letter => {
  const isBoss = game.mode === "boss";

  if (
    (game.mode !== "quest" && !isBoss) ||
    !Round.s ||
    Round.over()
  ) return;

  if (!/^[a-z]$/i.test(letter)) return;

  const result = Round.guess(letter.toLowerCase());

  if (result === "repeat") return;

  if (result === "hit") {
    playCorrectSound();
  } else {
    playWrongSound();
  }

  if (Round.won()) {
    renderQuest();

    clearTimeout(successTimer);

    const winningRound = Round.s;
    const winningNPC = game.activeNPC;

    successTimer = window.setTimeout(() => {
      successTimer = null;

      if (
        Round.s !== winningRound ||
        !Round.won()
      ) return;

      if (isBoss && game.mode === "boss" && game.boss.active) {
        bossRoundWon();
        return;
      }

      if (
        game.mode === "quest" &&
        game.activeNPC === winningNPC &&
        winningNPC
      ) {
        completeQuest();
      }
    }, isBoss ? 1200 : 2500);

    return;
  }

  if (Round.lost()) {
    renderQuest();

    if (isBoss) {
      bossTimeout();
    } else {
      failQuest();
    }

    return;
  }

  renderQuest();
};
const useHint = () => {
  const isBoss = game.mode === "boss";

  if (
    (game.mode !== "quest" && !isBoss) ||
    !Round.s
  ) return;

  if (isBoss) {
  if ((Round.s.hintsUsed || 0) >= 1) {
       showToast("You already used your free hint!");
      return;
    }

    const letter = Round.hint(true);

    if (!letter) return;
      Round.s.hintsUsed++;
      Round.s.revealedLetter = letter;


  showToast("THE HANGMAN KING REVEALED A LETTER!");

    renderQuest();

    if (Round.won()) {
      bossRoundWon();
    } else if (game.boss.timeLeft <= 0) {
      bossTimeout();
    }

    return;
  }

  const canPay = game.candies >= 5;
  const letter = Round.hint(canPay);

  if (!letter) {
    showToast("No hint available!");
    return;
  }

  if (canPay) {
    game.candies -= 5;
  } else {
    playWrongSound();
  }

  renderQuest();
  updateHUD();

  if (Round.won()) {
    completeQuest();
  } else if (Round.lost()) {
    failQuest();
  }
};
/* ---------- GAME FLOW ---------- */

const startTutorial = () => {
  closeDialogue();
  game.mode = "tutorial";
  showScreen("tut");
};

const startNewGame = () => {
  window.clearTimeout(questFinishTimer);

  initializeProgression();

  game.player = createPlayer();
  game.coinPickups = createCoins();

  game.score = INITIAL_SCORE;
  game.candies = 0;
  game.keys = 0;
  game.hearts = INITIAL_HEARTS;
  game.completed = 0;
  game.elapsedTime = 0;
  game.activeNPC = null;

    clearInterval(game.boss.timer);

  game.boss.unlocked = false;
  game.boss.hp = BOSS.maxHP;
  game.boss.round = null;
  game.boss.timeLeft = BOSS.timeLimit;
  game.boss.timer = null;
  game.boss.active = false;
  game.boss.defeated = false;
  game.boss.revealed = false;
game.boss.revealStartedAt = null;
game.boss.revealed = false;
game.boss.revealStartedAt = null;
game.boss.revealCutsceneActive = false;
game.boss.cameraPanFrom = null;
game.boss.cameraPanTarget = null;

  game.mode = "play";

  Round.s = null;

  closeDialogue();
  showScreen(null);

  setVisible("hud", true);
  setVisible("hud2", true);
  setVisible("pauseBtn", true);

  updateCamera(game.player);
  updateHUD();
};

const pauseGame = () => {
  if (game.mode === "play") {
    closeDialogue();
    game.mode = "pause";
    showScreen("pause");
  } else if (game.mode === "pause") {
    game.mode = "play";
    showScreen(null);
  }
};

const endGame = victory => {
  if (game.mode === "end") return;

  game.mode = "end";
  clearInterval(game.boss.timer);
game.boss.timer = null;
game.boss.active = false;
  closeDialogue();

  const levelScore = game.score + game.candies * 10;

  const timeBonus = Math.max(
    0,
    Math.round((900 - game.elapsedTime * 3) / 5) * 5
  );

  const stars = victory
    ? game.hearts >= 3 ? 3
      : game.hearts === 2 ? 2 : 1
    : 0;

  const starBonus = stars * 140;

  const total = victory
    ? levelScore + timeBonus + starBonus
    : levelScore;

  game.score = total;

  if (total > game.bestScore) {
    saveBestScore(total);
    game.bestScore = total;
  }

  const seconds = Math.floor(game.elapsedTime);
  const formattedTime =
    `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  const end = getElement("end");

  if (!end) return;

  const starHTML = [0, 1, 2].map(index => `
    <span class="result-star ${index < stars ? "on" : ""}">★</span>
  `).join("");

  end.innerHTML = `
    <div class="result-card">

      <div class="result-ribbon">
        <span>${victory ? "★ TOWN SAVED ★" : "GAME OVER"}</span>
        <span>${victory ? "VICTORY!" : "TRY AGAIN"}</span>
      </div>

      <h2>${victory ? "YOU SAVED THE TOWN!" : "HANK'S LAST STAND"}</h2>

      <div class="result-star-container">
        ${starHTML}
      </div>

      <div class="result-stats">

        <div>
          <span>FINAL SCORE</span>
          <b id="resultScore">${pad(total, 6)}</b>
        </div>

        <div>
          <span>CANDIES COLLECTED</span>
          <b id="resultCoins">${game.candies}</b>
        </div>

        <div>
          <span>TIME</span>
          <b id="resultTime">${formattedTime}</b>
        </div>

        <div>
          <span>QUESTS COMPLETED</span>
          <b>${game.completed}/8</b>
        </div>

        <div>
          <span>HEARTS REMAINING</span>
          <b>${game.hearts}</b>
        </div>

        ${victory ? `
          <div>
            <span>TIME BONUS</span>
            <b>+${timeBonus}</b>
          </div>

          <div>
            <span>STAR BONUS</span>
            <b>+${starBonus}</b>
          </div>
        ` : ""}

      </div>

      <div class="result-buttons">

        <button
          class="result-button"
          type="button"
          id="resultRetry"
        >
          PLAY AGAIN
        </button>

        <button
          class="result-button"
          type="button"
          id="resultMenu"
        >
          MAIN MENU
        </button>

      </div>

    </div>
  `;

  getElement("resultRetry").addEventListener("click", () => {
    startNewGame();
  });

  getElement("resultMenu").addEventListener("click", () => {
    game.mode = "menu";
    game.activeNPC = null;
    Round.s = null;

    showScreen("menu");
  });

  showScreen("end");
};

const showMenu = () => {
  closeDialogue(true);

  game.mode = "menu";
  game.activeNPC = null;

  showScreen("menu");

  setVisible("hud", false);
  setVisible("hud2", false);
  setVisible("pauseBtn", false);

  const bestText = getElement("bestTxt");

  if (bestText) {
    bestText.textContent = pad(game.bestScore, 6);
  }
};

/* ---------- ACTIONS ---------- */

const handleAction = action => {
  switch (action) {
    case "start":
      startTutorial();
      break;

    case "go":
    case "retry":
      startNewGame();
      break;

    case "interact":
      interact();
      break;

    case "later":
      if (game.mode === "quest" && Round.s && !Round.over()) {
        closeQuest();
      } else {
        closeDialogue();
      }
      break;

    case "pause":
      pauseGame();
      break;

    case "resume":
      if (game.mode === "pause") {
        game.mode = "play";
        showScreen(null);
      }
      break;

    case "escape":
      if (dialogue.npc) {
        closeDialogue();
      } else if (game.mode === "quest") {
        closeQuest();
      } else if (game.mode === "pause") {
        pauseGame();
      } else if (game.mode === "play") {
        pauseGame();
      } else {
        showMenu();
      }
      break;

    case "back":
    case "quit":
      showMenu();
      break;

    case "settings":
      game.mode = "settings";
      showScreen("set");
      break;

    case "tsound":
      game.settings.sound = !game.settings.sound;
      setSoundEnabled(game.settings.sound);
      saveSettings(game.settings);
      break;

    case "tscan":
      game.settings.scan = !game.settings.scan;

      document.body.classList.toggle(
        "noscan",
        !game.settings.scan
      );

      saveSettings(game.settings);
      break;

    case "tcalm":
      game.settings.calm = !game.settings.calm;

      document.body.classList.toggle(
        "calm",
        game.settings.calm
      );

      saveSettings(game.settings);
      break;

    case "hint":
      useHint();
      break;

    case "next":
      startNewGame();
      break;
  }
};

/* ---------- UPDATE AND DRAW ---------- */
/* ---------- UPDATE AND DRAW ---------- */

const updateGame = deltaTime => {
  if (game.mode !== "play" || !game.player) return;
if (
  game.boss.revealCutsceneActive ||
  dialogue.bossIntroActive ||
  (dialogue.npc && dialogue.typing)
) {
  updateFX(deltaTime);
  return;
}
  if (dialogue.bossIntroActive) {
    updateFX(deltaTime);
    return;
  }

  game.elapsedTime += deltaTime / 1000;

  updatePlayer(
    game.player,
    inputState,
    deltaTime,
    game.coinPickups,
    () => {
      game.candies++;
      playCoinSound();
      updateHUD();
    }
  );

  updateCamera(game.player);
  updateDialogueDistance();
  updateFX(deltaTime);

  updateHUD();
};
const renderGame = time => {
  const initialBossScreenX = BOSS.x - camera.x;

  const bossVisible =
    game.boss.unlocked &&
    !game.boss.defeated &&
    initialBossScreenX > 80 &&
    initialBossScreenX < CANVAS_WIDTH - 80;

  if (bossVisible && !game.boss.revealed) {
    game.boss.revealed = true;
    game.boss.revealStartedAt = time;
    game.boss.revealCutsceneActive = true;

    game.boss.cameraPanFrom = camera.x;

    const maxCameraX = Math.max(0, WORLD_WIDTH - CANVAS_WIDTH);

    game.boss.cameraPanTarget = Math.max(
      0,
      Math.min(
        maxCameraX,
        BOSS.x - CANVAS_WIDTH * 0.62
      )
    );
  }

  const revealElapsed =
    game.boss.revealStartedAt === null
      ? 0
      : Math.max(0, time - game.boss.revealStartedAt);

  // Cinematic camera pan
  if (
    game.boss.revealed &&
    game.boss.cameraPanFrom !== null &&
    revealElapsed < 2800
  ) {
    const progress = Math.min(1, revealElapsed / 1300);
    const eased = progress * progress * (3 - 2 * progress);

    camera.x =
      game.boss.cameraPanFrom +
      (game.boss.cameraPanTarget - game.boss.cameraPanFrom) * eased;
  }

  if (game.boss.revealed && revealElapsed >= 2800) {
    game.boss.revealCutsceneActive = false;
  }

  const bossEntryProgress = game.boss.revealed
    ? Math.min(1, revealElapsed / 1500)
    : 0;

  // Keep night colors vibrant instead of completely darkening the map
  const night = game.boss.revealed
    ? Math.min(0.68, (revealElapsed / 2400) * 0.68)
    : 0;

  drawEnvironment({
    coins: game.coinPickups,
    time: time / 1000,
    night
  });

  drawCaptives(time / 1000);

  drawNPCs(
    game.player,
    game.mode,
    Boolean(dialogue.npc),
    game.boss.unlocked,
    game.boss.defeated,
    bossEntryProgress
  );

  if (game.player) {
    drawPlayer(game.player);
  }

  drawFX();
};
const gameLoop = time => {
  animationFrame = requestAnimationFrame(gameLoop);

  const deltaTime = previousTime
    ? Math.min(time - previousTime, 50)
    : 16;

  previousTime = time;

  updateGame(deltaTime);
  renderGame(time);
};
/* ---------- EVENT CONNECTION ---------- */

const connectEvents = () => {
  document.addEventListener("gameaction", event => {
    handleAction(event.detail.action);
  });

  document.addEventListener("gameletter", event => {
    handleGuess(event.detail.letter);
  });

  const hintButton = getElement("hintBtn");

  if (hintButton && !hintButton.hasAttribute("data-act")) {
    hintButton.addEventListener("click", useHint);
  }

  document.addEventListener("click", event => {
    const key = event.target.closest(".key, .keyboard-key");

    if (key && key.dataset.letter) {
      handleGuess(key.dataset.letter);
    }
  });
};

/* ---------- INITIALIZATION ---------- */

export const initializeGame = () => {
  initializeCanvas();
  initializeProgression();
  initializeInput();

  const menuArt = getElement("menuArt");

  if (menuArt) {
    menuArt.innerHTML = hankSVG();
    poseHank(menuArt, 6, "cool");
  }

  game.settings = loadSettings();
  game.bestScore = loadBestScore();

  setSoundEnabled(game.settings.sound);

  document.body.classList.toggle(
    "noscan",
    !game.settings.scan
  );

  document.body.classList.toggle(
    "calm",
    game.settings.calm
  );

  connectEvents();

  const bestText = getElement("bestTxt");

  if (bestText) {
    bestText.textContent = pad(game.bestScore, 6);
  }

  setVisible("hud", false);
  setVisible("hud2", false);
  setVisible("pauseBtn", false);

  showScreen("menu");

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  previousTime = 0;
  animationFrame = requestAnimationFrame(gameLoop);

  console.log("Game controller initialized.");
};
const bossDamageAnimation = () => {
  const boss = getElement("bossCharacter");
  const label = getElement("bossHitLabel");

  if (!boss) return;

  boss.classList.remove("hit");
  void boss.offsetWidth;
  boss.classList.add("hit");

  if (label) {
    label.textContent = "-1 HP";
    label.classList.remove("show");

    void label.offsetWidth;
    label.classList.add("show");
  }

  const impact = document.createElement("div");
  impact.className = "boss-impact";
  impact.innerHTML = "<i></i>".repeat(8);

  boss.appendChild(impact);

  window.setTimeout(() => {
    impact.remove();
    boss.classList.remove("hit");
  }, 700);
};