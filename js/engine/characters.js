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

  drawBossPixelArt(sx, bossY, 1.5, time);

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
<svg class="boss-sprite coder-king"
     viewBox="0 0 100 130"
     role="img"
     aria-label="The Last Keeper">

  <g shape-rendering="crispEdges">

    <rect x="25" y="124" width="50" height="4" fill="#202638"/>

    <rect x="32" y="108" width="15" height="13" fill="#303346"/>
    <rect x="53" y="108" width="15" height="13" fill="#303346"/>
    <rect x="26" y="118" width="23" height="6" fill="#252b3a"/>
    <rect x="51" y="118" width="23" height="6" fill="#252b3a"/>

    <rect x="27" y="63" width="46" height="48" fill="#30394d"/>
    <rect x="20" y="69" width="60" height="17" fill="#39475c"/>
    <rect x="29" y="78" width="42" height="31" fill="#536078"/>

    <rect x="18" y="73" width="15" height="28" fill="#344052"/>
    <rect x="67" y="73" width="15" height="28" fill="#344052"/>

    <rect x="17" y="97" width="12" height="9" fill="#d7a083"/>
    <rect x="73" y="97" width="12" height="9" fill="#d7a083"/>

    <rect x="31" y="104" width="38" height="4" fill="#b69b68"/>
    <rect x="47" y="103" width="6" height="7" fill="#d3b77c"/>

    <rect x="35" y="75" width="30" height="34" fill="#46536a"/>
    <rect x="36" y="75" width="5" height="32" fill="#30394d"/>
    <rect x="59" y="75" width="5" height="32" fill="#30394d"/>

    <rect x="32" y="65" width="12" height="15" fill="#b69b68"/>
    <rect x="56" y="65" width="12" height="15" fill="#b69b68"/>
    <rect x="40" y="66" width="20" height="8" fill="#d0b47a"/>

    <rect x="45" y="76" width="10" height="11" fill="#b69b68"/>
    <rect x="47" y="78" width="6" height="6" fill="#78678c"/>
    <rect x="48" y="79" width="4" height="4" fill="#c8a7d5"/>

    <rect x="42" y="57" width="16" height="13" fill="#b87963"/>
    <rect x="43" y="59" width="14" height="10" fill="#d7a083"/>

    <rect x="31" y="29" width="38" height="37" fill="#433b3c"/>
    <rect x="35" y="33" width="30" height="31" fill="#d7a083"/>

    <rect x="30" y="29" width="40" height="13" fill="#493f40"/>
    <rect x="32" y="24" width="34" height="9" fill="#51494a"/>
    <rect x="28" y="35" width="8" height="19" fill="#493f40"/>
    <rect x="64" y="34" width="8" height="19" fill="#493f40"/>

    <rect x="36" y="25" width="5" height="5" fill="#8a8580"/>
    <rect x="45" y="24" width="5" height="4" fill="#a39b91"/>
    <rect x="61" y="29" width="5" height="4" fill="#8a8580"/>

    <rect x="36" y="39" width="8" height="3" fill="#8c6157"/>
    <rect x="55" y="39" width="8" height="3" fill="#8c6157"/>

    <rect x="38" y="44" width="8" height="3" fill="#493b3b"/>
    <rect x="54" y="44" width="8" height="3" fill="#493b3b"/>

    <rect x="40" y="44" width="4" height="2" fill="#eee0ca"/>
    <rect x="56" y="44" width="4" height="2" fill="#eee0ca"/>

    <rect x="42" y="49" width="16" height="7" fill="#c58a70"/>
    <rect x="49" y="48" width="3" height="6" fill="#b87963"/>
    <rect x="46" y="58" width="8" height="2" fill="#855b56"/>

    <rect x="40" y="54" width="5" height="4" fill="#b87963"/>
    <rect x="55" y="54" width="5" height="4" fill="#b87963"/>

    <rect x="31" y="62" width="38" height="6" fill="#30394d"/>
    <rect x="43" y="64" width="14" height="5" fill="#b69b68"/>

    <rect x="48" y="80" width="4" height="3" fill="#d3b77c"/>
    <rect x="47" y="83" width="6" height="5" fill="#78678c"/>
    <rect x="48" y="84" width="4" height="3" fill="#c8a7d5"/>

    <rect x="34" y="90" width="7" height="3" fill="#65728a"/>
    <rect x="59" y="90" width="7" height="3" fill="#65728a"/>

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

  const currentState = [
  "dead",
  "free",
  "attack",
  "hurt"
].find(state => svg.classList.contains(state)) || "";

if (currentState !== state) {
  svg.classList.remove("free", "dead", "attack", "hurt");

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
const drawBossPixelArt = (x, baseline, scale = 1.5, time = 0) => {
  ctx.save();

  ctx.translate(x - 50 * scale, baseline - 130 * scale);
  ctx.scale(scale, scale);

  const p = (x, y, w, h, color) => rc(x, y, w, h, color);

  p(25, 124, 50, 4, "#202638");

  p(32, 108, 15, 13, "#303346");
  p(53, 108, 15, 13, "#303346");
  p(26, 118, 23, 6, "#252b3a");
  p(51, 118, 23, 6, "#252b3a");

  p(27, 63, 46, 48, "#30394d");
  p(20, 69, 60, 17, "#39475c");
  p(29, 78, 42, 31, "#536078");

  p(18, 73, 15, 28, "#344052");
  p(67, 73, 15, 28, "#344052");

  p(17, 97, 12, 9, "#d7a083");
  p(73, 97, 12, 9, "#d7a083");

  p(31, 104, 38, 4, "#b69b68");
  p(47, 103, 6, 7, "#d3b77c");

  p(35, 75, 30, 34, "#46536a");
  p(36, 75, 5, 32, "#30394d");
  p(59, 75, 5, 32, "#30394d");

  p(32, 65, 12, 15, "#b69b68");
  p(56, 65, 12, 15, "#b69b68");
  p(40, 66, 20, 8, "#d0b47a");

  p(45, 76, 10, 11, "#b69b68");
  p(47, 78, 6, 6, "#78678c");

  const glow = 0.78 + Math.sin(time * 2.5) * 0.12;

  ctx.save();
  ctx.globalAlpha = glow;
  p(48, 79, 4, 4, "#c8a7d5");
  ctx.restore();

  p(42, 57, 16, 13, "#b87963");
  p(43, 59, 14, 10, "#d7a083");

  p(31, 29, 38, 37, "#433b3c");
  p(35, 33, 30, 31, "#d7a083");

  p(30, 29, 40, 13, "#493f40");
  p(32, 24, 34, 9, "#51494a");
  p(28, 35, 8, 19, "#493f40");
  p(64, 34, 8, 19, "#493f40");

  p(36, 25, 5, 5, "#8a8580");
  p(45, 24, 5, 4, "#a39b91");
  p(61, 29, 5, 4, "#8a8580");

  p(36, 39, 8, 3, "#8c6157");
  p(55, 39, 8, 3, "#8c6157");

  p(38, 44, 8, 3, "#493b3b");
  p(54, 44, 8, 3, "#493b3b");

  p(40, 44, 4, 2, "#eee0ca");
  p(56, 44, 4, 2, "#eee0ca");

  p(42, 49, 16, 7, "#c58a70");
  p(49, 48, 3, 6, "#b87963");
  p(46, 58, 8, 2, "#855b56");

  p(40, 54, 5, 4, "#b87963");
  p(55, 54, 5, 4, "#b87963");

  p(31, 62, 38, 6, "#30394d");
  p(43, 64, 14, 5, "#b69b68");

  p(48, 80, 4, 3, "#d3b77c");
  p(47, 83, 6, 5, "#78678c");
  p(48, 84, 4, 3, "#c8a7d5");

  p(34, 90, 7, 3, "#65728a");
  p(59, 90, 7, 3, "#65728a");

  ctx.restore();
};