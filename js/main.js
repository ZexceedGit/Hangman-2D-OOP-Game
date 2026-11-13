import { initializeGame } from "./game.js";
import { loadGameData } from "./data/gameData.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadGameData();
    console.log("Using game definitions from Java.");
  } catch (error) {
    console.error("Java backend unavailable. Using local game data.", error);
  }

  initializeGame();
}, {
  once: true
});