// npcs attributr, will be possibly replaced by oop java fetch
/**
  for context of this variable name ok
  x - is the NPC horizontal position
  cat - categroy used to select the Hangman word
  lo and hi  - minimum and max word lengths
  pal - character appearance customization
  goal,free,fail, intro, done - quest dialogue and description, just the string for commnucation depending on situation
  bx and by - captive position offset
 */
import { GROUND_Y } from "../constants.js";

export const NPCS = [
  {
    name: "Pip",
    x: 600,
    cat: "Animal",
    lo: 5,
    hi: 6,
    pal: {
      s: "#f1c08a",
      t: "#5fe0b0",
      p: "#7a5230",
      h: "spiky",
      c: "#5a3418"
    },
    goal: "Unleash Biscuit the dog",
    free: "Biscuit is loose! Woof!",
    fail: "The knot tightened… −1 heart",
    bx: 70,
    by: GROUND_Y - 30,
    intro: "My dog Biscuit is leashed to that post and the knot only loosens for the right word. Hank volunteered to help. Guess the animal!",
    done: "Biscuit hasn’t stopped zooming around. Thank you!"
  },
  

  {
    name: "Granny Mae",
    x: 1040,
    cat: "Place",
    lo: 6,
    hi: 7,
    pal: {
      s: "#ffd3a1",
      t: "#d98ad1",
      p: "#6b4fa0",
      h: "bun",
      c: "#eeeeee",
      a: "glasses"
    },
    goal: "Open Polly the parrot’s cage",
    free: "Polly is flying free!",
    fail: "The lock stayed shut… −1 heart",
    bx: 70,
    by: GROUND_Y - 70,
    intro: "Oh dear, my parrot Polly’s cage only opens with a place name, and I’ve forgotten it. Hank offered to help, sweetie.",
    done: "Polly keeps doing loops around my head. Lovely!"
  },

  {
    name: "Sal",
    x: 1540,
    fy: 344,
    cat: "Food",
    lo: 7,
    hi: 9,
    pal: {
      s: "#e8b07a",
      t: "#ffffff",
      p: "#2a45c9",
      h: "cap",
      c: "#ff9ac1",
      a: "stache"
    },
    goal: "Lower the Mega Swirl lollipop",
    free: "The Mega Swirl is back on the counter!",
    fail: "The rope held… −1 heart",
    bx: 40,
    by: GROUND_Y - 66,
    intro: "Someone hoisted my favorite candy, the Mega Swirl lollipop, up that pole! Solve my food puzzle and the rope lets go.",
    done: "My Mega Swirl! Help yourself to some candy, friend."
  },

  {
    name: "Bruno",
    x: 2230,
    cat: "Animal",
    lo: 8,
    hi: 9,
    pal: {
      s: "#8a5a35",
      t: "#a8703d",
      p: "#6e4526",
      h: "ears",
      c: "#6e4526"
    },
    goal: "Get the honey jar down",
    free: "The honey jar is down! The bees are thrilled.",
    fail: "The jar didn’t budge… −1 heart",
    bx: 50,
    by: GROUND_Y - 30,
    intro: "Grr. My honey jar is hanging from that branch and I can’t reach it. A wild animal puzzle loosens the rope. Don’t growl at me.",
    done: "Honey! Grr… I mean, thank you."
  },

  {
    name: "Rex-9",
    x: 2910,
    cat: "Arcade",
    lo: 8,
    hi: 10,
    pal: {
      s: "#b8c4d6",
      t: "#5b6b8a",
      p: "#3a4560",
      h: "robot",
      c: "#ff6f7d"
    },
    goal: "Reboot robot pal Bit",
    free: "Bit is online and dancing!",
    fail: "Reboot failed… −1 heart",
    bx: 70,
    by: GROUND_Y - 30,
    intro: "BEEP. My friend Bit is powered down. Decode the word to reboot him. Hank is on standby.",
    done: "BEEP. Bit says thank you in binary."
  },

  {
    name: "Finn",
    x: 3560,
    cat: "Sea",
    lo: 6,
    hi: 8,
    pal: {
      s: "#e8b07a",
      t: "#2a9bd1",
      p: "#3a4560",
      h: "fisher",
      c: "#ffd23c",
      a: "beard"
    },
    goal: "Reel in the Golden Fish",
    free: "The Golden Fish is on the dock!",
    fail: "The line snapped… −1 heart",
    bx: 70,
    by: GROUND_Y - 30,
    intro: "Ahoy! Something HUGE took my line and won’t let go. Name the sea word and I can finally reel in the Golden Fish!",
    done: "Best catch of my life! Fish for dinner, hero."
  },

  {
    name: "Zara",
    x: 4180,
    cat: "Magic",
    lo: 6,
    hi: 9,
    pal: {
      s: "#ffd3a1",
      t: "#6b3fb0",
      p: "#3b2470",
      h: "wizard",
      c: "#6b3fb0",
      a: "beard"
    },
    goal: "Wake the sleeping cauldron",
    free: "The cauldron is bubbling happily!",
    fail: "The spell fizzled… −1 heart",
    bx: 70,
    by: GROUND_Y - 30,
    intro: "My cauldron fell asleep mid-brew and only a magic word wakes it. Hank offered to stir. What could go wrong?",
    done: "Bubble, bubble, thank you! Have some sparkles."
  },

  {
    name: "Farmer Joe",
    x: 4820,
    cat: "Farm",
    lo: 6,
    hi: 9,
    pal: {
      s: "#e8b07a",
      t: "#c9394a",
      p: "#2a45c9",
      h: "straw",
      c: "#f2d27a"
    },
    goal: "Free the Giant Pumpkin",
    free: "The Giant Pumpkin rolled free!",
    fail: "The vines held tight… −1 heart",
    bx: 70,
    by: GROUND_Y - 30,
    intro: "Howdy! My prize pumpkin is tangled in the vines and I can’t budge it. Guess the farm word to cut it loose!",
    done: "Blue ribbon for sure! Take a carrot for the road."
  },
];

export const BOSS = {
  name: "The Hangman King",
  x: 5250,
  cat: "Boss",
  lo: 5,
  hi: 8,
   pal: {
    s: "#b58ac9",
    t: "#2b1b3d",
    p: "#171326",
    h: "wizard",
    c: "#ffd166"
  },
  hp: 5,
  maxHP: 5,
  timeLimit: 50,

 introLines: [
  "So... the little hero finally made it to the edge of town.",
  "Did you really believe all those troubles were accidents? The tangled ropes, locked cages, broken machines...",
  "I placed a curse upon this town! Every problem was part of my spell, and every rescue brought you closer to me.",
  "But enough about my masterpiece. Now it is your turn to face a challenge.",
  "I will give you three words. Solve them before time runs out, and you may break my curse. Fail, and this town remains mine!",
  "Well, hero? Let us see if your words are stronger than my magic!"
],
  clue:
    "The final word",

  free:
    "The Hangman King has fallen!",

  done:
    "You already defeated me..."
};