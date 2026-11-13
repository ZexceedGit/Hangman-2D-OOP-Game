import { NPCS, BOSS } from "./npcs.js";
import { QUEST_ITEMS } from "./items.js";

const API_URL = "http://localhost:8080/api/game-data";

export const loadGameData = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Game data request failed: ${response.status}`);
  }

  const data = await response.json();

  if (
    !Array.isArray(data.npcs) ||
    !Array.isArray(data.items) ||
    !data.boss
  ) {
    throw new Error("Invalid game data received from Java.");
  }

  const newNPCs = data.npcs.map(npc => ({
    ...npc,
    state: 0,
    failed: false,
    round: null
  }));

  NPCS.splice(0, NPCS.length, ...newNPCs);

  Object.keys(QUEST_ITEMS).forEach(id => {
    delete QUEST_ITEMS[id];
  });

  data.items.forEach(item => {
    QUEST_ITEMS[item.id] = {
      name: item.name,
      icon: item.icon,
      description: item.description
    };
  });

  Object.keys(BOSS).forEach(key => {
    delete BOSS[key];
  });

  Object.assign(BOSS, data.boss);

  console.log("Java game data loaded successfully.");
  console.log("NPCs:", NPCS.length);
  console.log("Items:", Object.keys(QUEST_ITEMS).length);
  console.log("Boss:", BOSS.name);

  return true;
};