import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import caseRoutes from './routes/case.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// API routes
app.use('/api/case', caseRoutes);
app.use('/api/chat', chatRoutes);

// Glossary endpoint
const glossary = JSON.parse(readFileSync(join(__dirname, 'data', 'glossary.json'), 'utf-8'));
app.get('/api/glossary', (req, res) => res.json(glossary));

// Imaging endpoint — serves a random image from a category
// Images are synced from Google Drive MCP to local cache
app.get('/api/imaging/:type/:category', (req, res) => {
  const { type, category } = req.params;
  const assetFolder = type === 'ecg' ? 'ecgs' : 'xrays';
  const dir = join(__dirname, '..', 'public', 'assets', assetFolder, category);
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.jpg'));
    if (files.length === 0) return res.status(404).json({ error: 'No images in category' });
    const pick = files[Math.floor(Math.random() * files.length)];
    res.json({ url: `/assets/${assetFolder}/${category}/${pick}`, category, type });
  } catch {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Global leaderboard — in-memory with periodic file backup
let leaderboard = [];
const leaderboardPath = join(__dirname, 'data', 'leaderboard.json');
try {
  leaderboard = JSON.parse(readFileSync(leaderboardPath, 'utf-8'));
} catch { /* first run — empty leaderboard */ }


app.get('/api/leaderboard', (req, res) => {
  // Return top 50 sorted by score descending
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 50);
  res.json(sorted);
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, condition, difficulty, daily, correct, bias } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score required' });
  }

  const entry = {
    name: String(name).slice(0, 20),
    score,
    condition: condition || 'Unknown',
    difficulty: difficulty || 'moderate',
    daily: daily || false,
    correct: correct || false,
    bias: bias || null,
    date: Date.now()
  };

  leaderboard.push(entry);

  // Keep max 500 entries
  if (leaderboard.length > 500) {
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 500);
  }

  // Save to file
  try { writeFileSync(leaderboardPath, JSON.stringify(leaderboard)); } catch { /* non-critical */ }

  const rank = [...leaderboard].sort((a, b) => b.score - a.score).findIndex(e => e === entry) + 1;
  res.json({ rank, totalPlayers: new Set(leaderboard.map(e => e.name)).size });
});

// Analytics endpoint — aggregate stats across all players
app.get('/api/analytics', (req, res) => {
  const total = leaderboard.length;
  if (total === 0) return res.json({ totalGames: 0 });

  const correct = leaderboard.filter(e => e.correct).length;

  // Accuracy by condition
  const byCondition = {};
  for (const e of leaderboard) {
    if (!byCondition[e.condition]) byCondition[e.condition] = { total: 0, correct: 0 };
    byCondition[e.condition].total++;
    if (e.correct) byCondition[e.condition].correct++;
  }

  // Sort by most played
  const conditionStats = Object.entries(byCondition)
    .map(([name, stats]) => ({ name, ...stats, accuracy: Math.round((stats.correct / stats.total) * 100) }))
    .sort((a, b) => b.total - a.total);

  // Bias analysis — how often each bias fools players
  const biasStats = {};
  for (const e of leaderboard) {
    if (!e.bias) continue;
    if (!biasStats[e.bias]) biasStats[e.bias] = { total: 0, fooled: 0 };
    biasStats[e.bias].total++;
    if (!e.correct) biasStats[e.bias].fooled++;
  }

  const biasBreakdown = Object.entries(biasStats)
    .map(([name, stats]) => ({ name, ...stats, foolRate: Math.round((stats.fooled / stats.total) * 100) }))
    .sort((a, b) => b.foolRate - a.foolRate);

  // Accuracy by difficulty
  const byDifficulty = {};
  for (const e of leaderboard) {
    const d = e.difficulty || 'moderate';
    if (!byDifficulty[d]) byDifficulty[d] = { total: 0, correct: 0 };
    byDifficulty[d].total++;
    if (e.correct) byDifficulty[d].correct++;
  }

  const difficultyStats = Object.entries(byDifficulty)
    .map(([name, stats]) => ({ name, ...stats, accuracy: Math.round((stats.correct / stats.total) * 100) }));

  // Daily challenge stats
  const dailyGames = leaderboard.filter(e => e.daily);
  const dailyCorrect = dailyGames.filter(e => e.correct).length;

  // Unique players
  const uniquePlayers = new Set(leaderboard.map(e => e.name)).size;

  // Hardest condition (lowest accuracy, min 2 games)
  const hardest = conditionStats.filter(c => c.total >= 2).sort((a, b) => a.accuracy - b.accuracy)[0];

  // Most dangerous bias
  const deadliestBias = biasBreakdown[0];

  res.json({
    totalGames: total,
    totalCorrect: correct,
    globalAccuracy: Math.round((correct / total) * 100),
    uniquePlayers,
    conditionStats,
    biasBreakdown,
    difficultyStats,
    dailyGames: dailyGames.length,
    dailyAccuracy: dailyGames.length ? Math.round((dailyCorrect / dailyGames.length) * 100) : 0,
    hardestCondition: hardest || null,
    deadliestBias: deadliestBias || null
  });
});

app.listen(PORT, () => {
  console.log(`Second Opinion running on http://localhost:${PORT}`);
});
