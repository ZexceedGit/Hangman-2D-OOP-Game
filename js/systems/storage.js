
const SETTINGS_KEY = "hank_settings";
const BEST_SCORE_KEY = "hank_best";

export const DEFAULT_SETTINGS = {
  sound: true,
  scan: true,
  calm: false
};

export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return { ...DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed
    };
  } catch (error) {
    console.error("Unable to load game settings:", error);

    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    return true;
  } catch (error) {
    console.error("Unable to save game settings:", error);

    return false;
  }
};

export const loadBestScore = () => {
  try {
    const score = Number(
      localStorage.getItem(BEST_SCORE_KEY)
    );

    return Number.isFinite(score) && score >= 0
      ? score
      : 0;
  } catch (error) {
    console.error("Unable to load best score:", error);

    return 0;
  }
};

export const saveBestScore = (score) => {
  try {
    const currentBest = loadBestScore();
    const newBest = Math.max(currentBest, Number(score) || 0);

    localStorage.setItem(
      BEST_SCORE_KEY,
      String(newBest)
    );

    return newBest;
  } catch (error) {
    console.error("Unable to save best score:", error);

    return loadBestScore();
  }
};

export const resetBestScore = () => {
  try {
    localStorage.removeItem(BEST_SCORE_KEY);
    return true;
  } catch (error) {
    console.error("Unable to reset best score:", error);

    return false;
  }
};

export const clearGameSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error("Unable to clear game settings:", error);

    return false;
  }
};
