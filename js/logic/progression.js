// manages the player progress through the 8 will be (10) NPCs quest, keeps track fo which NPC have been done, etc or the game iscomplete
import { NPCS } from "../data/npcs.js";
import { Run } from "./round.js";

export const initializeProgression = () => {
  NPCS.forEach(npc => {
    npc.state = 0;
    npc.round = null;
    npc.failed = false;
  });

  Run.level = 1;
  Run.carry = 0;
  Run.used = [];
};

export const completeNPCQuest = (npc) => {
  npc.state = 2;
  npc.round = null;
  npc.failed = false;
};

export const failNPCQuest = (npc) => {
  npc.round = null;
  npc.failed = true;
};

export const getCompletedQuests = () => {
  return NPCS.filter(npc => npc.state === 2).length;
};

export const getRemainingQuests = () => {
  return NPCS.filter(npc => npc.state !== 2).length;
};

export const areAllQuestsComplete = () => {
  return getCompletedQuests() === NPCS.length;
};

export const getQuestProgress = () => {
  return {
    completed: getCompletedQuests(),
    remaining: getRemainingQuests(),
    total: NPCS.length
  };
};
