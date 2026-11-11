//pretty obvious mechanic when it multiplies score on tries left for best score mechanics

export const calculateQuestScore = (triesLeft) => {
  return 100 + 25 * triesLeft;
};

export const awardQuest = (game, triesLeft) => {
  const points = calculateQuestScore(triesLeft);

  game.total += points;
  game.keys++;
  game.q++;
  game.coins += 5;

  return {
    points,
    coins: 5,
    keys: 1
  };
};

