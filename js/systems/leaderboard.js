
const STORAGE_KEY = "hangmanLeaderboard";

export const submitLeaderboardScore = async (name, score) => {
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  entries.push({
    name: String(name).trim().slice(0, 20) || "Player",
    score: Number(score),
    date: new Date().toISOString()
  });

  entries.sort((a, b) => b.score - a.score);

  const topTen = entries.slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(topTen));

  return topTen;
};

export const fetchLeaderboard = async () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

export const downloadLeaderboard = () => {
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const content = [
    "RANK\tPLAYER\tSCORE\tDATE",
    ...entries.map((entry, index) =>
      `${index + 1}\t${entry.name}\t${entry.score}\t${entry.date}`
    )
  ].join("\n");

  const blob = new Blob([content], {
    type: "text/plain"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "leaderboard.txt";
  link.click();

  URL.revokeObjectURL(url);
};
