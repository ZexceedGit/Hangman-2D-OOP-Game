// dialogues specifically for the hangman itself
export const LINES = {
  menu: [
    "Ready to risk my neck? Press start. I’ll be here. Hanging.",
    "Oh, a hero. I’m Hank. I’m stuck in everyone’s rope. Long story."
  ],

  start: [
    "Psst. It’s Hank again. Currently a hat. Let’s keep it that way.",
    "Hi! Third gallows today. Pick a letter, please."
  ],

  hit: [
    "Nice one!",
    "Okay, okay, I see you.",
    "Correct. I’m almost impressed.",
    "Yes! I like my limbs, keep going."
  ],

  oneLeft: [
    "One letter to go. Don’t choke. I’m the one choking."
  ],

  repeat: [
    "You tried that already. I watched."
  ],

  hint: [
    "A cheat code? Fine. It costs me a limb."
  ],

  miss: [
    null,
    "Wrong! But hey, I got a head.",
    "A body! Now I feel the rope properly.",
    "An arm! Hello? Anyone?",
    "Two arms. Now I can flail with style.",
    "One leg. I’m a flamingo now, not by choice."
  ],

  lose: [
    "Tell my mom I wasn’t scared. I was very scared.",
    "Goodbye, cruel word. Hello, halo."
  ],

  win: [
    "Free at last! Gotta run, I have coffee.",
    "Thanks, hero! Drinks are on you!"
  ]
};

export const pick = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
