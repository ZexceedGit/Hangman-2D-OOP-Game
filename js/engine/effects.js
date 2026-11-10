
import { ctx, camera } from "./canvas.js";

export const FX = [];

export const burst = (x, y, color = "#ffd23c", count = 12) => {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;

    FX.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: 2 + Math.random() * 4,
      color
    });
  }
};

export const updateFX = (deltaTime) => {
  const dt = deltaTime / 1000;

  for (let i = FX.length - 1; i >= 0; i--) {
    const particle = FX[i];

    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    particle.vy += 180 * dt;

    particle.life -= dt;

    if (particle.life <= 0) {
      FX.splice(i, 1);
    }
  }
};

export const drawFX = () => {
  FX.forEach(particle => {
    const screenX = particle.x - camera.x;

    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;

    ctx.fillRect(
      Math.round(screenX),
      Math.round(particle.y),
      particle.size,
      particle.size
    );
  });

  ctx.globalAlpha = 1;
};

export const clearFX = () => {
  FX.length = 0;
};
