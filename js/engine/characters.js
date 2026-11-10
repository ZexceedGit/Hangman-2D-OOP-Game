// character rendering

import { ctx, camera } from "./canvas.js";
import { NPCS } from "../data/npcs.js";
import { GROUND_Y } from "../constants.js";

const rc = (x, y, w, h, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

export const px = (x) => Math.round(x - camera.x);

export function drawCharacter(x, y, palette, face, time, scale = 3) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(face, 1);

  const u = (a, b, w, h, c) =>
    rc(a * scale, b * scale, w * scale, h * scale, c);

  const s = Math.round(Math.sin(time * 10) * 2);
  const ink = "#16257a";

  u(-3 + s, -5, 3, 5, palette.p);
  u(1 - s, -5, 3, 5, palette.p);
  u(-3 + s, -1, 4, 1, ink);
  u(1 - s, -1, 4, 1, ink);

  u(-4, -12, 8, 7, palette.t);
  u(-6, -12, 2, 6, palette.t);
  u(4, -12, 2, 6, palette.t);
  u(-6, -6, 2, 1, palette.s);
  u(4, -6, 2, 1, palette.s);

  u(-4, -19, 8, 7, palette.s);
  u(0, -16, 1, 2, ink);
  u(2, -16, 1, 2, ink);

  const h = palette.h;

  if (h === "cap") {
    u(-4, -21, 8, 3, palette.c);
    u(2, -19, 5, 1, palette.c);
  }

  if (h === "spiky") {
    u(-4, -20, 8, 2, palette.c);
    u(-3, -22, 2, 2, palette.c);
    u(0, -23, 2, 3, palette.c);
    u(3, -22, 2, 2, palette.c);
  }

  if (h === "bun") {
    u(-4, -20, 8, 2, palette.c);
    u(-4, -18, 2, 5, palette.c);
    u(-2, -23, 4, 3, palette.c);
  }

  if (h === "ears") {
    u(-4, -20, 8, 1, palette.c);
    u(-5, -22, 3, 3, palette.c);
    u(2, -22, 3, 3, palette.c);
  }

  if (h === "fisher") {
    u(-5, -21, 10, 3, palette.c);
    u(-4, -24, 8, 3, palette.c);
    u(-5, -19, 11, 1, "#d9a21c");
  }

  if (h === "wizard") {
    u(-6, -21, 12, 2, palette.c);
    u(-4, -25, 8, 4, palette.c);
    u(-2, -29, 5, 4, palette.c);
    u(0, -32, 3, 3, palette.c);
    u(-1, -24, 2, 2, "#ffd23c");
    u(2, -27, 1, 1, "#fff");
  }

  if (h === "straw") {
    u(-7, -21, 14, 2, palette.c);
    u(-4, -24, 8, 3, palette.c);
    u(-4, -22, 8, 1, "#c9394a");
  }

  if (h === "robot") {
    u(-4, -20, 8, 1, "#8493ad");
    u(0, -25, 1, 5, "#8493ad");
    u(-1, -27, 3, 2, palette.c);
    u(-1, -12, 3, 2, palette.c);
  }

  if (palette.a === "glasses") {
    u(-1, -17, 3, 3, "rgba(255,255,255,.75)");
    u(2, -17, 3, 3, "rgba(255,255,255,.75)");
  }

  if (palette.a === "beard") {
    u(-3, -14, 6, 4, "#e8e8ee");
    u(-1, -10, 2, 2, "#e8e8ee");
  }

  if (palette.a === "stache") {
    u(0, -14, 5, 1, "#5a3418");
  }

  ctx.restore();
}

export const PLAYER = {
  s: "#ffd3a1",
  t: "#2a45c9",
  p: "#16257a",
  h: "cap",
  c: "#ff6f7d"
};

export const drawPlayer = (player) => {
  if (!player) return;

  drawCharacter(
      px(player.x + player.width / 2),
    player.y + player.height,
    PLAYER,
    player.facing || 1,
    player.t || 0
  );
};

export const drawNPC = (
  npc,
  playerX,
  mode = "play",
  dialogueOpen = false
) => {
  const y = npc.fy ?? GROUND_Y;
  const sx = px(npc.x);

  drawCharacter(
    sx,
    y,
    npc.pal,
    playerX < npc.x ? -1 : 1,
    0
  );

  const bob = Math.sin(performance.now() / 1000 * 5 + npc.x) * 3;

  ctx.font = "700 24px Pixelify Sans, monospace";
  ctx.textAlign = "center";

  const mark = npc.state === 2 ? "★" : npc.round ? "?" : "!";
  const color = npc.state === 2 ? "#5fe0b0" : "#ffd166";

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#16257a";
  ctx.strokeText(mark, sx, y - 100 + bob);

  ctx.fillStyle = color;
  ctx.fillText(mark, sx, y - 100 + bob);

  ctx.font = "700 13px Pixelify Sans, monospace";
  ctx.lineWidth = 3;
  ctx.strokeText(npc.name, sx, y - 124);

  ctx.fillStyle = "#fff";
  ctx.fillText(npc.name, sx, y - 124);

  const distance = Math.abs(
    npc.x - (playerX + 12)
  );

  if (
    mode === "play" &&
    distance < 80 &&
    !dialogueOpen
  ) {
    rc(sx - 34, y - 158, 68, 22, "#fff");

    ctx.strokeStyle = "#16257a";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx - 33, y - 157, 66, 20);

    ctx.fillStyle = "#16257a";
    ctx.fillText("E · Talk", sx, y - 142);
  }

  ctx.textAlign = "left";
};

export const drawNPCs = (player, mode = "play", dialogueOpen = false) => {
  if (!player) return;

  NPCS.forEach(npc => {
    drawNPC(
      npc,
      player.x,
      mode,
      dialogueOpen
    );
  });
};

const R = (x, y, w, h, c = "g") =>
  `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;

export const FACES = {
  cool:
    R(39, 28, 2, 2, "ink") +
    R(43, 28, 2, 2, "ink") +
    R(40, 31, 4, 1, "ink") +
    R(44, 30, 1, 1, "ink"),

  meh:
    R(39, 28, 2, 2, "ink") +
    R(43, 28, 2, 2, "ink") +
    R(40, 31, 4, 1, "ink"),

  worry:
    R(39, 28, 2, 2, "ink") +
    R(43, 28, 2, 2, "ink") +
    R(38, 26, 3, 1, "ink") +
    R(43, 26, 3, 1, "ink") +
    R(40, 31, 1, 1, "ink") +
    R(41, 30, 2, 1, "ink") +
    R(43, 31, 1, 1, "ink") +
    R(46, 27, 1, 2, "drop"),

  panic:
    R(38, 26, 4, 4, "white") +
    R(43, 26, 4, 4, "white") +
    R(39, 27, 2, 2, "ink") +
    R(44, 27, 2, 2, "ink") +
    R(40, 31, 4, 2, "ink") +
    R(36, 27, 1, 2, "drop") +
    R(47, 27, 1, 2, "drop"),

  dead:
    [38, 43].map(x =>
      R(x, 27, 1, 1, "ink") +
      R(x + 2, 27, 1, 1, "ink") +
      R(x + 1, 28, 1, 1, "ink") +
      R(x, 29, 1, 1, "ink") +
      R(x + 2, 29, 1, 1, "ink")
    ).join("") +
    R(40, 31, 4, 1, "ink") +
    R(42, 32, 2, 2, "coral"),

  happy:
    R(38, 29, 1, 1, "ink") +
    R(39, 28, 1, 1, "ink") +
    R(40, 29, 1, 1, "ink") +
    R(43, 29, 1, 1, "ink") +
    R(44, 28, 1, 1, "ink") +
    R(45, 29, 1, 1, "ink") +
    R(39, 30, 1, 1, "ink") +
    R(40, 31, 4, 1, "ink") +
    R(44, 30, 1, 1, "ink")
};

export const MOOD = [
  "cool",
  "cool",
  "meh",
  "worry",
  "worry",
  "panic",
  "dead"
];

export const hankSVG = () => {
  const parts = [
    R(35, 23, 14, 2, "ink") +
    R(37, 16, 10, 7, "ink") +
    R(37, 21, 10, 2, "band"),

    R(37, 25, 10, 9, "skin") +
    `<g class="face"></g>` +
    R(38, 34, 8, 2, "rope"),

    R(38, 36, 8, 12, "shirt") +
    R(38, 40, 8, 2, "coral"),

    R(35, 37, 3, 9, "shirt") +
    R(35, 46, 3, 2, "skin"),

    R(46, 37, 3, 9, "shirt") +
    R(46, 46, 3, 2, "skin"),

    R(38, 48, 3, 9, "pants") +
    R(37, 57, 4, 2, "ink"),

    R(43, 48, 3, 9, "pants") +
    R(43, 57, 4, 2, "ink")
  ];

  return `<svg class="gallows" viewBox="0 0 72 72" role="img" aria-label="Hank on the gallows">
    ${R(4, 62, 64, 4)}
    ${R(4, 62, 64, 1, "gh")}
    ${R(12, 8, 5, 54)}
    ${R(12, 8, 1, 54, "gh")}
    ${R(12, 8, 34, 5)}
    ${R(12, 8, 34, 1, "gh")}
    ${R(17, 18, 2, 2)}
    ${R(19, 16, 2, 2)}
    ${R(21, 14, 2, 2)}
    ${R(41, 13, 2, 10, "rope")}
    <g class="swing">
      <g class="walker">
        ${parts.map((part, index) =>
          `<g class="part" data-i="${index}">${part}</g>`
        ).join("")}
      </g>
    </g>
  </svg>`;
};

export const poseHank = (box, parts, mood, state = "") => {
  const svg = box.firstElementChild;
  if (!svg) return;

  svg.querySelectorAll(".part").forEach(part => {
    part.classList.toggle(
      "on",
      Number(part.dataset.i) <= parts
    );
  });

  const face = svg.querySelector(".face");

  if (face) {
    face.innerHTML = FACES[mood];
  }

  const currentState = svg.classList.contains("dead")
    ? "dead"
    : svg.classList.contains("free")
      ? "free"
      : "";

  if (currentState !== state) {
    svg.classList.remove("free", "dead");

    if (state) {
      svg.classList.add(state);
    }
  }
};


export const say = (element, text) => {
  clearInterval(element._t);

  const target = element.querySelector(".txt");
  if (!target) return;

  let index = 0;
  target.textContent = "";

  element._t = setInterval(() => {
    target.textContent = text.slice(0, ++index);

    if (index >= text.length) {
      clearInterval(element._t);
    }
  }, 22);
};
