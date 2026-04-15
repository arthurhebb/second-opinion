// Scoreboard — localStorage persistence for game stats

const STORAGE_KEY = 'second-opinion-scoreboard';

const DIFFICULTY_MULTIPLIER = {
  classic: 1,       // FY1
  moderate: 1.5,    // SHO
  atypical: 2       // Registrar
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefault();
  } catch {
    return getDefault();
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefault() {
  return {
    games: [],        // Array of game records
    streak: 0,        // Current consecutive correct
    bestStreak: 0,    // All-time best streak
    totalScore: 0
  };
}

/**
 * Record a completed game
 */
export function recordGame({ correct, condition, difficulty, gameMode, confidenceBriefing, confidenceVerdict, biasPlanted, timeTakenMs, selectedCorrect }) {
  const board = load();

  // Calculate score
  const diffKey = difficulty?.presentation_clarity || 'moderate';
  const multiplier = DIFFICULTY_MULTIPLIER[diffKey] || 1;

  let score = 0;
  if (correct) {
    score = Math.round(100 * multiplier);

    // Confidence calibration: high confidence + correct = bonus
    if (confidenceVerdict >= 70) score += 20;
    // Low confidence + correct = penalty (got lucky, didn't trust yourself)
    if (confidenceVerdict <= 30) score -= 10;

    // Streak bonus
    board.streak += 1;
    score += board.streak * 10;
  } else {
    // Confidence calibration: honestly uncertain when wrong = small consolation
    if (confidenceVerdict <= 30) score += 10;
    // High confidence + wrong = penalty (confidently wrong is dangerous)
    if (confidenceVerdict >= 70) score -= 20;

    board.streak = 0;
  }

  // Floor at 0 — don't go negative for a single game
  if (score < 0) score = 0;

  if (board.streak > board.bestStreak) {
    board.bestStreak = board.streak;
  }

  board.totalScore += score;

  board.games.push({
    date: Date.now(),
    condition: condition || 'Unknown',
    difficulty: diffKey,
    gameMode: gameMode || 'easy',
    correct,
    score,
    confidenceBriefing: confidenceBriefing ?? null,
    confidenceVerdict: confidenceVerdict ?? null,
    biasPlanted: biasPlanted || null,
    timeTakenMs: timeTakenMs || null,
    selectedCorrect: selectedCorrect ?? null
  });

  save(board);
  return { score, streak: board.streak, totalScore: board.totalScore };
}

/**
 * Get full scoreboard data
 */
export function getScoreboard() {
  return load();
}

/**
 * Get computed stats
 */
export function getStats() {
  const board = load();
  const games = board.games;

  if (games.length === 0) {
    return {
      totalGames: 0,
      totalScore: 0,
      streak: 0,
      bestStreak: 0,
      accuracy: 0,
      avgConfidenceWhenRight: 0,
      avgConfidenceWhenWrong: 0,
      byCondition: {},
      byBias: {},
      byDifficulty: {},
      recentGames: []
    };
  }

  const correct = games.filter(g => g.correct);
  const wrong = games.filter(g => !g.correct);

  // Accuracy by condition
  const byCondition = {};
  for (const g of games) {
    if (!byCondition[g.condition]) {
      byCondition[g.condition] = { total: 0, correct: 0 };
    }
    byCondition[g.condition].total++;
    if (g.correct) byCondition[g.condition].correct++;
  }

  // Bias profile — which biases catch you out
  const byBias = {};
  for (const g of wrong) {
    if (g.biasPlanted) {
      byBias[g.biasPlanted] = (byBias[g.biasPlanted] || 0) + 1;
    }
  }

  // By difficulty
  const byDifficulty = {};
  for (const g of games) {
    const d = g.difficulty || 'moderate';
    if (!byDifficulty[d]) byDifficulty[d] = { total: 0, correct: 0 };
    byDifficulty[d].total++;
    if (g.correct) byDifficulty[d].correct++;
  }

  // Average confidence when right vs wrong
  const confRight = correct.filter(g => g.confidenceVerdict != null).map(g => g.confidenceVerdict);
  const confWrong = wrong.filter(g => g.confidenceVerdict != null).map(g => g.confidenceVerdict);

  return {
    totalGames: games.length,
    totalScore: board.totalScore,
    streak: board.streak,
    bestStreak: board.bestStreak,
    accuracy: Math.round((correct.length / games.length) * 100),
    avgConfidenceWhenRight: confRight.length ? Math.round(confRight.reduce((a, b) => a + b, 0) / confRight.length) : 0,
    avgConfidenceWhenWrong: confWrong.length ? Math.round(confWrong.reduce((a, b) => a + b, 0) / confWrong.length) : 0,
    byCondition,
    byBias,
    byDifficulty,
    recentGames: games.slice(-10).reverse()
  };
}

/**
 * Reset all data
 */
export function resetScoreboard() {
  localStorage.removeItem(STORAGE_KEY);
}
