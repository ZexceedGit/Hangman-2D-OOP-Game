
import {
  GROUND_Y,
  INITIAL_HEARTS,
  INITIAL_SCORE
} from "./constants.js";

import { NPCS } from "./data/npcs.js";
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
  updateCamera
} from "./engine/canvas.js";

import { drawEnvironment } from "./engine/drawing.js";

import {
  drawPlayer,
  drawNPCs,
  hankSVG,
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
  activeNPC: null
};

let animationFrame = null;
let previousTime = 0;
let questFinishTimer = null;

const dialogue = {
  npc: null,
  typingTimer: null
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

  if (!textElement) {
    element.textContent = message;
    return;
  }

  let index = 0;
  textElement.textContent = "";

  dialogue.typingTimer = window.setInterval(() => {
    textElement.textContent = message.slice(0, ++index);

    if (index >= message.length) {
      window.clearInterval(dialogue.typingTimer);
    }
  }, 22);
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
      npc.state === 2
        ? "E · Chat     Esc · Close"
        : "E · Take the quest     Esc · Later";
  }

  say(element, message);
};

const closeDialogue = () => {
  window.clearInterval(dialogue.typingTimer);

  dialogue.npc = null;

  const element = getElement("dlg");

  if (element) {
    element.style.display = "none";
    element.hidden = true;
  }
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

  return nearest;
};

const interact = () => {
  if (game.mode !== "play") return;

  const npc = getNearestNPC();

  if (!npc) {
    closeDialogue();
    showToast("There is nobody nearby.");
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
};

const updateDialogueDistance = () => {
  if (!dialogue.npc || !game.player) return;

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

  if (who) {
    who.textContent = npc.goal || npc.name;
  }

  if (clue) {
    clue.textContent =
      `${Round.s.clue} · ${Round.s.word.length} letters`;
  }

  if (candy) {
    candy.textContent = game.candies;
  }

  const won = Round.won();
  const lost = Round.lost();

  // Hank's feedback
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

      slot.className =
        `letter-slot${lost && !guessed ? " lost" : ""}`;

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
    const canPay = game.candies >= 5;

    hintButton.textContent = canPay
      ? "Free hint (-5 candies)"
      : "Cheat code (costs 1 try)";

    hintButton.disabled =
      Round.over() ||
      Round.hidden().length <= 1 ||
      (!canPay && Round.triesLeft() <= 1);
  }

  // Update Hank's appearance
  const art = getElement("gameArt");

  if (art) {
    poseHank(
      art,
      won ? 6 : Round.s.misses,
      won ? "happy" : MOOD[Round.s.misses],
      won ? "free" : lost ? "dead" : ""
    );
  }

  // Display the result after Hank's animation
if (lost && resultRoundId !== roundId) {
      resultRoundId = roundId;

    resultTimer = setTimeout(() => {
      if (
        game.mode !== "quest" ||
        game.activeNPC !== npc
      ) return;

      const quest = getElement("quest");

      if (!quest || resultOverlay) return;

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

  clearQuestResult();

  Round.s = null;
  game.activeNPC = null;
  game.mode = "play";

  showScreen(null);
  updateHUD();

  // Show the NPC's completion dialogue
  window.setTimeout(() => {
    if (game.mode === "play") {
      openDialogue(npc, npc.done);
    }
  }, 300);

  // Check whether all quests are completed
  if (areAllQuestsComplete()) {
    window.setTimeout(() => endGame(true), 2200);
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
  if (game.mode !== "quest" || !Round.s || Round.over()) return;

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

    const npc = game.activeNPC;

    clearTimeout(successTimer);

    successTimer = window.setTimeout(() => {
      successTimer = null;

      if (
        game.mode === "quest" &&
        game.activeNPC === npc &&
        Round.s &&
        Round.won()
      ) {
        completeQuest();
      }
    }, 1100);

    return;
  }

  if (Round.lost()) {
    failQuest();
    renderQuest();
    return;
  }

  renderQuest();
};



const useHint = () => {
  if (game.mode !== "quest" || !Round.s) return;

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
  game.mode = "end";

  closeDialogue();

  const levelScore = game.score + game.candies * 10;
  const timeBonus = Math.max(
    0,
    Math.round((900 - game.elapsedTime * 3) / 5) * 5
  );

  const stars =
    game.hearts >= 3 ? 3 :
    game.hearts === 2 ? 2 : 1;

  const starBonus = stars * 140;

  const total = victory
    ? levelScore + timeBonus + starBonus
    : levelScore;

  game.score = total;

  if (total > game.bestScore) {
    saveBestScore(total);
    game.bestScore = Math.max(game.bestScore, total);
  }

  const resultScore = getElement("resultScore");
  const resultCoins = getElement("resultCoins");
  const resultTime = getElement("resultTime");

  if (resultScore) resultScore.textContent = pad(total, 6);
  if (resultCoins) resultCoins.textContent = game.candies;

  if (resultTime) {
    const seconds = Math.floor(game.elapsedTime);

    resultTime.textContent =
      `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }

  showScreen("end");

  showToast(
    victory ? "All quests completed!" : "Game over!"
  );
};

const showMenu = () => {
  closeDialogue();

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

const updateGame = deltaTime => {
  if (game.mode !== "play" || !game.player) return;

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
  drawEnvironment({
    coins: game.coinPickups,
    time: time / 1000
  });

  drawCaptives(time / 1000);

  drawNPCs(
    game.player,
    game.mode,
    Boolean(dialogue.npc)
  );

  if (game.player) {
    drawPlayer(game.player);
  }

  drawFX();
};

const gameLoop = time => {
  const deltaTime = previousTime
    ? Math.min(time - previousTime, 50)
    : 16;

  previousTime = time;

  updateGame(deltaTime);
  renderGame(time);

  animationFrame = requestAnimationFrame(gameLoop);
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
