// movement, jumping, collision, colelction
import {
  GROUND_Y,
  WORLD_WIDTH,
  PLAYER_SPEED,
  JUMP_FORCE,
  GRAVITY
} from "../constants.js";

import { PLATS } from "../data/world.js";

export const createPlayer = () => ({
  x: 120,
  y: GROUND_Y - 36,
  width: 24,
  height: 36,
  vx: 0,
  vy: 0,
  facing: 1,
  grounded: true
});

export const movePlayer = (player, input) => {
  player.vx = 0;

  if (input.left) {
    player.vx = -PLAYER_SPEED;
    player.facing = -1;
  }

  if (input.right) {
    player.vx = PLAYER_SPEED;
    player.facing = 1;
  }

  if (input.jump && player.grounded) {
    player.vy = -JUMP_FORCE;
    player.grounded = false;
  }
};

export const updatePlayerPhysics = (
  player,
  input,
  deltaTime
) => {
  const dt = Math.min(deltaTime / 1000, 0.05);

  movePlayer(player, input);

  const previousY = player.y;

  player.x += player.vx * dt;

  player.x = Math.max(
    0,
    Math.min(player.x, WORLD_WIDTH - player.width)
  );

  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  player.grounded = false;

  const previousBottom = previousY + player.height;
  const currentBottom = player.y + player.height;

  if (
    player.vy >= 0 &&
    previousBottom <= GROUND_Y &&
    currentBottom >= GROUND_Y
  ) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  PLATS.forEach(platform => {
    const overlapsX =
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.w;

    const crossedPlatform =
      previousBottom <= platform.y &&
      currentBottom >= platform.y;

    if (
      overlapsX &&
      crossedPlatform &&
      player.vy >= 0
    ) {
      player.y = platform.y - player.height;
      player.vy = 0;
      player.grounded = true;
    }
  });
  if (player.vx !== 0 && player.grounded) {
  player.t += dt;
}
};

export const collectCoins = (
  player,
  coins,
  onCollect = () => {}
) => {
  coins.forEach(coin => {
    if (coin.collected) return;

    const dx =
      player.x + player.width / 2 - coin.x;

    const dy =
      player.y + player.height / 2 - coin.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 25) {
      coin.collected = true;
      onCollect(coin);
    }
  });
};

export const updatePlayer = (
  player,
  input,
  deltaTime,
  coins = [],
  onCoinCollected = () => {}
) => {
  updatePlayerPhysics(player, input, deltaTime);
  collectCoins(player, coins, onCoinCollected);
};
