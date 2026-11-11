// character rendering

import { ctx, camera } from "./canvas.js";
import { NPCS, BOSS } from "../data/npcs.js";
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
export const drawNPCs = (
  player,
  mode = "play",
  dialogueOpen = false,
  bossUnlocked = false,
  bossDefeated = false,
  bossEntryProgress = 1
) => {
  if (!player) return;

  NPCS.forEach(npc => {
    drawNPC(npc, player.x, mode, dialogueOpen);
  });

  if (bossUnlocked && !bossDefeated) {
    drawBoss(
      player.x,
      mode,
      dialogueOpen,
      performance.now() / 1000,
      bossEntryProgress
    );
  }
};
export const drawBoss = (
  playerX,
  mode = "play",
  dialogueOpen = false,
  time = 0,
  entryProgress = 1
) => {
  const sx = px(BOSS.x);
  const y = GROUND_Y;

  if (sx < -180 || sx > 980) return;

  const progress = Math.max(0, Math.min(1, entryProgress));
  const eased = 1 - Math.pow(1 - progress, 3);

  const drop = (1 - eased) * 430;
  const bob = progress >= 1 ? Math.sin(time * 2) * 2 : 0;
  const bossY = y + bob - drop;

  // Ground shadow
  if (progress > 0.75) {
    const shadowScale = (progress - 0.75) / 0.25;

    rc(
      sx - 35 * shadowScale,
      y - 5,
      70 * shadowScale,
      5,
      `rgba(23,19,38,${shadowScale * 0.65})`
    );
  }

  drawBossPixelArt(sx, bossY, 1.5);

  // Crown marker and name appear after the landing
  if (progress >= 0.9) {
    rc(sx - 11, bossY - 248, 22, 4, "#ffd166");
    rc(sx - 9, bossY - 256, 5, 9, "#ffd166");
    rc(sx - 2, bossY - 263, 5, 16, "#ffd166");
    rc(sx + 5, bossY - 256, 5, 9, "#ffd166");

    ctx.textAlign = "center";
    ctx.font = '700 18px "Pixelify Sans", monospace';
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#16257a";

    ctx.strokeText(
      "THE HANGMAN KING",
      sx,
      bossY - 220
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "THE HANGMAN KING",
      sx,
      bossY - 220
    );
  }

  const distance = Math.abs(BOSS.x - (playerX + 12));

  if (
    progress >= 1 &&
    mode === "play" &&
    distance < 115 &&
    !dialogueOpen
  ) {
    rc(sx - 48, y - 270, 96, 24, "#ffffff");

    ctx.strokeStyle = "#16257a";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx - 47, y - 269, 94, 22);

    ctx.font = '700 13px "Pixelify Sans", monospace';
    ctx.fillStyle = "#16257a";
    ctx.fillText("E · Challenge", sx, y - 254);
  }

  ctx.textAlign = "left";
};
export const bossSVG = () => `
  <svg class="boss-sprite" viewBox="0 0 100 130"
       role="img" aria-label="The Hangman King">

    <g shape-rendering="crispEdges">

      <rect x="20" y="119" width="60" height="5" fill="#171326"/>
      <rect x="27" y="72" width="46" height="43" fill="#2b1b3d"/>
      <rect x="18" y="78" width="18" height="28" fill="#171326"/>
      <rect x="64" y="78" width="18" height="28" fill="#171326"/>

      <rect x="32" y="57" width="36" height="36" fill="#7b3f9e"/>
      <rect x="27" y="67" width="46" height="43" fill="#2b1b3d"/>
      <rect x="34" y="91" width="32" height="7" fill="#c83cff"/>
      <rect x="43" y="66" width="14" height="28" fill="#7b3f9e"/>

      <rect x="36" y="29" width="28" height="31" fill="#b58ac9"/>
      <rect x="31" y="35" width="38" height="20" fill="#7b3f9e"/>
      <rect x="35" y="40" width="8" height="6" fill="#ffffff"/>
      <rect x="57" y="40" width="8" height="6" fill="#ffffff"/>
      <rect x="38" y="42" width="4" height="4" fill="#c83cff"/>
      <rect x="58" y="42" width="4" height="4" fill="#c83cff"/>
      <rect x="43" y="53" width="14" height="3" fill="#171326"/>

      <rect x="31" y="25" width="38" height="6" fill="#ffd166"/>
      <rect x="31" y="15" width="8" height="12" fill="#ffd166"/>
      <rect x="46" y="7" width="8" height="20" fill="#ffd166"/>
      <rect x="61" y="15" width="8" height="12" fill="#ffd166"/>
      <rect x="48" y="16" width="4" height="6" fill="#c83cff"/>

      <rect x="12" y="64" width="7" height="41" fill="#8b5a2b"/>
      <rect x="7" y="54" width="17" height="14" fill="#c83cff"/>
      <rect x="11" y="49" width="9" height="5" fill="#ffd166"/>
      <rect x="14" y="38" width="3" height="11" fill="#ffd166"/>
      <rect x="9" y="42" width="13" height="3" fill="#ffd166"/>

      <rect x="27" y="110" width="18" height="7" fill="#171326"/>
      <rect x="55" y="110" width="18" height="7" fill="#171326"/>

    </g>
  </svg>
`;

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
const svg = box.querySelector(".gallows");
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

const drawBossPixelArt = (x, baseline, scale = 1.5) => {
  ctx.save();

  ctx.translate(
    x - 50 * scale,
    baseline - 124 * scale
  );

  ctx.scale(scale, scale);

  const p = (x, y, w, h, color) =>
    rc(x, y, w, h, color);

  p(20, 119, 60, 5, "#171326");

  p(27, 72, 46, 43, "#2b1b3d");
  p(18, 78, 18, 28, "#171326");
  p(64, 78, 18, 28, "#171326");

  p(32, 57, 36, 36, "#7b3f9e");
  p(27, 67, 46, 43, "#2b1b3d");
  p(34, 91, 32, 7, "#c83cff");
  p(43, 66, 14, 28, "#7b3f9e");

  p(36, 29, 28, 31, "#b58ac9");
  p(31, 35, 38, 20, "#7b3f9e");

  p(35, 40, 8, 6, "#ffffff");
  p(57, 40, 8, 6, "#ffffff");
  p(38, 42, 4, 4, "#c83cff");
  p(58, 42, 4, 4, "#c83cff");
  p(43, 53, 14, 3, "#171326");

  p(31, 25, 38, 6, "#ffd166");
  p(31, 15, 8, 12, "#ffd166");
  p(46, 7, 8, 20, "#ffd166");
  p(61, 15, 8, 12, "#ffd166");
  p(48, 16, 4, 6, "#c83cff");

  p(12, 64, 7, 41, "#8b5a2b");
  p(7, 54, 17, 14, "#c83cff");
  p(11, 49, 9, 5, "#ffd166");
  p(14, 38, 3, 11, "#ffd166");
  p(9, 42, 13, 3, "#ffd166");

  p(27, 110, 18, 7, "#171326");
  p(55, 110, 18, 7, "#171326");

  ctx.restore();
};