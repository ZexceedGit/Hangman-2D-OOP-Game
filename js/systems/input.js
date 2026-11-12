export const inputState = {
  left: false,
  right: false,
  jump: false
};

let inputMode = "world";

export const setInputMode = mode => {
  inputMode = mode;
  pressedKeys.clear();
  updateInputState();
};

const pressedKeys = new Set();

const keyMap = {
  ArrowLeft: "left",
  a: "left",
  A: "left",  

  ArrowRight: "right",
  d: "right",
  D: "right",

  ArrowUp: "jump",
  w: "jump",
  W: "jump",
  " ": "jump"
};

const dispatchAction = action => {
  document.dispatchEvent(
    new CustomEvent("gameaction", {
      detail: { action }
    })
  );
};

const dispatchLetter = letter => {
  document.dispatchEvent(
    new CustomEvent("gameletter", {
      detail: {
        letter: letter.toLowerCase()
      }
    })
  );
};

const updateInputState = () => {
  inputState.left = [...pressedKeys].some(
    key => keyMap[key] === "left"
  );

  inputState.right = [...pressedKeys].some(
    key => keyMap[key] === "right"
  );

  inputState.jump = [...pressedKeys].some(
    key => keyMap[key] === "jump"
  );
};
const isTypingTarget = target => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.matches("input, textarea, select") ||
    target.isContentEditable
  );
};
const handleKeyDown = event => {
  const key = event.key;
    if (
    key === "Escape" &&
    document.body.classList.contains("boss-fight-active")
  ) {
    event.preventDefault();
    return;
  }

  // Allow normal typing inside input fields
  if (isTypingTarget(event.target)) {
    return;
  }
  if (inputMode === "guess" && /^[a-zA-Z]$/.test(key)) {
  if (!event.repeat) {
    dispatchLetter(key);
  }

  return;
}

  if (
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "ArrowUp" ||
    key === " " ||
    key === "a" ||
    key === "A" ||
    key === "d" ||
    key === "D" ||
    key === "w" ||
    key === "W"
  ) {
    event.preventDefault();

    pressedKeys.add(key);
    updateInputState();

    return;
  }

  if (event.repeat) return;

  if (/^[a-zA-Z]$/.test(key)) {
    if (key.toLowerCase() === "e") {
      dispatchAction("interact");
      return;
    }

    dispatchLetter(key);
    return;
  }

  switch (key) {
    case "Enter":
      dispatchAction("interact");
      break;

    case "Escape":
      dispatchAction("escape");
      break;

    case "p":
    case "P":
      dispatchAction("pause");
      break;
  }
};

const handleKeyUp = event => {
  pressedKeys.delete(event.key);
  updateInputState();
};

const handleWindowBlur = () => {
  pressedKeys.clear();
  updateInputState();
};

const handlePointerDown = event => {
  const control = event.target.closest("[data-k]");

  if (!control) return;

  event.preventDefault();

  const direction = control.dataset.k;

  if (direction === "e") {
    dispatchAction("interact");
    return;
  }

  if (
    direction === "left" ||
    direction === "right" ||
    direction === "jump"
  ) {
    pressedKeys.add(`touch-${direction}`);
    updateInputState();
  }
};

const handlePointerUp = event => {
  const control = event.target.closest("[data-k]");

  if (!control) return;

  event.preventDefault();

  const direction = control.dataset.k;

  if (
    direction === "left" ||
    direction === "right" ||
    direction === "jump"
  ) {
    pressedKeys.delete(`touch-${direction}`);
    updateInputState();
  }
};

const handleButtonClick = event => {
  const actionButton = event.target.closest("[data-act]");

  if (actionButton) {
    dispatchAction(actionButton.dataset.act);
    return;
  }

  const letterButton = event.target.closest(
    ".key, .keyboard-key"
  );

  if (letterButton && letterButton.dataset.letter) {
    dispatchLetter(letterButton.dataset.letter);
  }
};

export const initializeInput = () => {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  window.addEventListener(
    "blur",
    handleWindowBlur
  );

  document.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  document.addEventListener(
    "pointerup",
    handlePointerUp
  );

  document.addEventListener(
    "pointercancel",
    handlePointerUp
  );

  document.addEventListener(
    "click",
    handleButtonClick
  );
};

export const initGame = initializeInput;

export const destroyInput = () => {
  document.removeEventListener(
    "keydown",
    handleKeyDown
  );

  document.removeEventListener(
    "keyup",
    handleKeyUp
  );

  window.removeEventListener(
    "blur",
    handleWindowBlur
  );

  document.removeEventListener(
    "pointerdown",
    handlePointerDown
  );

  document.removeEventListener(
    "pointerup",
    handlePointerUp
  );

  document.removeEventListener(
    "pointercancel",
    handlePointerUp
  );

  document.removeEventListener(
    "click",
    handleButtonClick
  );

  pressedKeys.clear();
  updateInputState();
};