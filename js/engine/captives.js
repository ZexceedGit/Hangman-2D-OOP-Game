// handles the characters that will be "saved"

import { ctx, camera } from "./canvas.js";
import { NPCS } from "../data/npcs.js";
import { GROUND_Y, CANVAS_WIDTH as W } from "../constants.js";

const ink = "#16257a";

const rc = (x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.round(x),
    Math.round(y),
    w,
    h
  );
};

const px = (x) => Math.round(x - camera.x);

const sp = (x, y, face, fn) => {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(face, 1);

  fn((a, b, w, h, color) => {
    rc(a * 3, b * 3, w * 3, h * 3, color);
  });

  ctx.restore();
};

export const drawCaptives = (T = 0) => {
  const out = (x) => px(x) < -220 || px(x) > W + 220;

  NPCS.forEach((n, i) => {
    const freed = n.state === 2;
    const t = freed ? T - (n.ft || 0) : 0;
    const bx = n.x + 70;
    const sx = px(bx);

    if (out(bx)) return;

    if (i === 0) {
      const post = px(n.x + 130);

      rc(post, GROUND_Y - 44, 8, 44, "#7a4a2b");
      rc(post - 2, GROUND_Y - 48, 12, 6, "#a2593c");

      const run = freed ? Math.sin(t * 1.4) * 90 : 0;
      const dx = freed ? Math.cos(t * 1.4) : -1;
      const ls = freed ? Math.round(Math.sin(t * 14) * 2) : 0;
      const wag = Math.round(Math.sin(T * (freed ? 20 : 6)));

      if (!freed) {
        for (let k = post - 30; k < post; k += 5) {
          rc(
            k,
            GROUND_Y - 26 + Math.round((k - post + 30) / 6),
            5,
            2,
            "#ff6f7d"
          );
        }
      } else {
        rc(post - 18, GROUND_Y - 3, 18, 3, "#ff6f7d");
      }

      sp(sx + run, GROUND_Y, dx >= 0 ? 1 : -1, u => {
        u(-6, -8, 12, 5, "#c98a52");
        u(4, -12, 6, 6, "#c98a52");
        u(9, -10, 3, 3, "#e8b07a");
        u(11, -10, 1, 1, ink);
        u(4, -14, 2, 4, "#8a5a35");
        u(7, -11, 1, 1, ink);
        u(3, -8, 2, 3, "#ff6f7d");
        u(-9, -11 + wag, 3, 2, "#c98a52");

        u(-5 + ls, -3, 2, 3, "#a2693c");
        u(-1 - ls, -3, 2, 3, "#a2693c");
        u(2 + ls, -3, 2, 3, "#a2693c");
        u(6 - ls, -3, 2, 3, "#a2693c");
      });
    }

    if (i === 1) {
      rc(sx - 24, GROUND_Y - 30, 48, 6, "#a2593c");
      rc(sx - 20, GROUND_Y - 24, 6, 24, "#8e4a30");
      rc(sx + 14, GROUND_Y - 24, 6, 24, "#8e4a30");

      rc(sx - 20, GROUND_Y - 96, 40, 3, "#8c96a8");
      rc(sx - 20, GROUND_Y - 33, 40, 3, "#8c96a8");
      rc(sx - 3, GROUND_Y - 104, 6, 8, "#8c96a8");

      for (let k = 0; k < 5; k++) {
        if (!(freed && k === 4)) {
          rc(sx - 20 + k * 9.5, GROUND_Y - 96, 3, 63, "#8c96a8");
        }
      }

      if (freed) {
        rc(sx + 22, GROUND_Y - 80, 12, 3, "#8c96a8");
      }

      const fx = freed ? Math.cos(t * 2) * 70 : 0;
      const fy = freed ? -60 + Math.sin(t * 3) * 20 : 0;
      const fl = Math.round(Math.sin(T * (freed ? 22 : 3)) * 2);

      sp(
        sx + fx,
        GROUND_Y - 34 + fy,
        freed && Math.sin(t * 2) > 0 ? -1 : 1,
        u => {
          u(-3, -8, 6, 8, "#3fbf5a");
          u(-2, -12, 4, 4, "#e8434f");
          u(2, -10, 2, 2, "#ffd23c");
          u(-4, -6 + fl, 3, 4, "#2a9bd1");
          u(-5, 0, 2, 4, "#2a9bd1");
          u(0, -11, 1, 1, ink);
        }
      );
    }

    if (i === 2) {
      const lx = px(n.x + 40);
      const pole = px(1450 + 215);

      rc(pole, GROUND_Y - 230, 8, 230, "#7a4a2b");
      rc(lx, GROUND_Y - 232, pole - lx + 8, 8, "#7a4a2b");

      const k = freed ? Math.min(t * 1.6, 1) : 0;
      const ly = GROUND_Y - 170 + k * k * 104;

      if (!freed) {
        rc(lx - 1, GROUND_Y - 224, 3, 36, "#d9a066");
      } else {
        rc(lx - 1, GROUND_Y - 224, 3, 18, "#d9a066");
      }

      rc(lx - 2, ly + 16, 5, 24, "#f4f8ff");

      [
        [18, "#ff6f9c"],
        [13, "#fff"],
        [8, "#ff6f9c"],
        [3, "#fff"]
      ].forEach(([radius, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, 6.3);
        ctx.fill();
      });

      if (freed && k >= 1 && Math.sin(t * 6) > 0.6) {
        rc(lx + 20, ly - 18, 4, 4, "#fff");
        rc(lx - 24, ly - 8, 4, 4, "#ffd166");
      }
    }

    if (i === 3) {
      const tx = px(n.x + 110);
      const jx = px(n.x + 50);

      rc(tx, GROUND_Y - 150, 14, 150, "#7a4a2b");
      rc(tx - 40, GROUND_Y - 200, 94, 50, "#3f9f3a");
      rc(tx - 26, GROUND_Y - 224, 66, 30, "#4fae3a");
      rc(jx - 20, GROUND_Y - 152, tx - jx + 20, 8, "#7a4a2b");

      const k = freed ? Math.min(t * 1.6, 1) : 0;
      const jy = GROUND_Y - 100 + k * k * 70;

      if (!freed) {
        rc(jx - 1, GROUND_Y - 144, 3, jy - 6 - (GROUND_Y - 144), "#d9a066");
      }

      rc(jx - 14, jy, 28, 30, "#ffb52e");
      rc(jx - 14, jy, 28, 5, "#ffd166");
      rc(jx - 16, jy - 6, 32, 8, "#8a5a35");
      rc(jx - 8, jy + 10, 16, 10, "#fff");
      rc(jx - 4, jy + 13, 8, 4, "#ffb52e");

      if (freed) {
        for (let b = 0; b < 4; b++) {
          const bx2 = jx + Math.cos(t * 3 + b * 1.6) * 34;
          const by2 = GROUND_Y - 62 + Math.sin(t * 4 + b) * 16;

          rc(bx2, by2, 6, 4, "#ffd23c");
          rc(bx2 + 2, by2, 2, 4, ink);
        }
      }
    }

    if (i === 5) {
      rc(sx - 60, GROUND_Y - 10, 150, 10, "#a2593c");
      rc(sx - 60, GROUND_Y - 4, 150, 4, "#8e4a30");

      [-50, -10, 30, 70].forEach(offset => {
        rc(sx + offset, GROUND_Y, 6, 12, "#7a4a2b");
      });

      const rx = sx + 36;

      rc(rx, GROUND_Y - 92, 3, 52, "#7a4a2b");

      const k = freed ? Math.min(t * 1.4, 1) : 0;
      const fx = rx + 70 - k * 60;
      const fy =
        GROUND_Y - 30 -
        k * 30 +
        Math.sin(T * (freed ? 10 : 3)) * (freed ? 3 : 6);

      rc(rx, GROUND_Y - 92, fx - rx, 2, "#16257a");
      rc(fx, GROUND_Y - 92, 2, fy - (GROUND_Y - 92), "#16257a");

      const wy = GROUND_Y + 14;

      rc(sx + 40, wy, 120, 40, "#2a9bd1");
      rc(sx + 40, wy, 120, 4, "#7fc8ff");

      sp(fx, fy, freed ? -1 : 1, u => {
        u(-6, -3, 10, 6, "#ffd23c");
        u(4, -2, 4, 4, "#ffb52e");
        u(-8, -4, 3, 8, "#ffb52e");
        u(-3, -2, 1, 1, ink);
        u(-1, -1, 3, 1, "#fff");
      });

      if (freed && k >= 1 && Math.sin(t * 6) > 0.5) {
        rc(fx + 10, fy - 14, 4, 4, "#fff");
        rc(fx - 14, fy - 10, 4, 4, "#ffd166");
      }
    }

    if (i === 6) {
      const cxn = sx + 40;

      rc(cxn - 26, GROUND_Y - 34, 52, 6, "#2b2f3a");
      rc(cxn - 30, GROUND_Y - 30, 60, 30, "#3a4560");
      rc(cxn - 24, GROUND_Y - 24, 48, 4, "#5b6b8a");

      rc(cxn - 26, GROUND_Y, 8, 8, "#2b2f3a");
      rc(cxn + 18, GROUND_Y, 8, 8, "#2b2f3a");

      rc(cxn - 20, GROUND_Y - 36, 40, 4, freed ? "#5fe0b0" : "#2d6b55");

      if (freed) {
        for (let b = 0; b < 5; b++) {
          const by2 = GROUND_Y - 44 - ((t * 40 + b * 18) % 60);
          const bx2 = cxn - 16 + b * 8 + Math.sin(t * 4 + b) * 3;

          rc(
            bx2,
            by2,
            5,
            5,
            b % 2 ? "#7fc8ff" : "#5fe0b0"
          );
        }
      } else {
        ctx.fillStyle = ink;
        ctx.font = "700 16px Pixelify Sans, monospace";
        ctx.fillText("z", cxn + 20, GROUND_Y - 52 - Math.sin(T * 2) * 4);
      }

      if (freed && Math.sin(t * 5) > 0.4) {
        rc(cxn + 34, GROUND_Y - 60, 4, 4, "#ffd166");
        rc(cxn - 40, GROUND_Y - 52, 4, 4, "#fff");
      }
    }

    if (i === 7) {
      const k = freed ? Math.min(t * 1.6, 1) : 0;
      const pumpkinX = sx + 30 + k * 70 * (freed ? 1 : 0);
      const roll = freed ? Math.sin(t * 6) * 2 : 0;

      if (!freed) {
        rc(sx + 10, GROUND_Y - 10, 60, 4, "#3f9f3a");
        rc(sx + 14, GROUND_Y - 26, 4, 20, "#3f9f3a");
        rc(sx + 58, GROUND_Y - 22, 4, 16, "#3f9f3a");
        rc(sx + 30, GROUND_Y - 34, 4, 26, "#3f9f3a");
      }

      rc(pumpkinX - 22, GROUND_Y - 38 + roll, 44, 36, "#ff8a1f");
      rc(pumpkinX - 22, GROUND_Y - 38 + roll, 44, 4, "#ffa64d");
      rc(pumpkinX - 10, GROUND_Y - 38 + roll, 4, 36, "#e06d10");
      rc(pumpkinX + 8, GROUND_Y - 38 + roll, 4, 36, "#e06d10");

      rc(pumpkinX - 3, GROUND_Y - 46 + roll, 6, 10, "#3f9f3a");
      rc(pumpkinX + 3, GROUND_Y - 44 + roll, 8, 3, "#4fae3a");

      if (freed && k >= 1 && Math.sin(t * 6) > 0.5) {
        rc(pumpkinX + 26, GROUND_Y - 50, 4, 4, "#ffd166");
        rc(pumpkinX - 30, GROUND_Y - 44, 4, 4, "#fff");
      }
    }

    if (i === 4) {
      const dy = freed ? -Math.abs(Math.sin(t * 8)) * 8 : 0;
      const arm = freed ? Math.round(Math.sin(t * 8) * 3) : 0;

      sp(sx, GROUND_Y + dy, -1, u => {
        u(-5, -10, 10, 10, freed ? "#8493ad" : "#6b7690");
        u(-4, -18, 8, 7, freed ? "#b8c4d6" : "#8a96ac");

        u(-2, -15, 2, 2, freed ? "#5fe0b0" : "#2b2f3a");
        u(1, -15, 2, 2, freed ? "#5fe0b0" : "#2b2f3a");

        u(0, -22, 1, 4, "#6b7690");
        u(-1, -24, 3, 2, freed && Math.sin(T * 10) > 0 ? "#ff6f7d" : "#3a4560");

        u(-1, -7, 3, 3, freed ? "#5fe0b0" : "#3a4560");
        u(-8, -9 + arm, 3, 2, "#6b7690");
        u(5, -9 - arm, 3, 2, "#6b7690");
        u(-5, 0, 3, 2, "#3a4560");
        u(2, 0, 3, 2, "#3a4560");
      });

      if (!freed) {
        ctx.fillStyle = ink;
        ctx.font = "700 16px Pixelify Sans, monospace";
        ctx.fillText("z", sx + 18, GROUND_Y - 70 - Math.sin(T * 2) * 4);
      }
    }
  });
};
