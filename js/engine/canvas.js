// make the canvas (where we draw), camera itself will follow to make it seem were moving and also the map
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from "../constants.js";

export const canvas = document.getElementById("cv");

export const ctx = canvas.getContext("2d");

export const camera = {
  x: 0
};

export const initializeCanvas = () => {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.imageSmoothingEnabled = false;
};

export const clearCanvas = () => {
  ctx.clearRect(
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
};

export const updateCamera = (player) => {
  const target = player.x - CANVAS_WIDTH / 2;

  camera.x = Math.max(
    0,
    Math.min(target, 5400 - CANVAS_WIDTH)
  );
};

export const getScreenX = (worldX) => {
  return worldX - camera.x;
};
