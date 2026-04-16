import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';
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

// Supabase client for persistent leaderboard
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://hgszupfqsnjzemmhipez.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnc3p1cGZxc25qemVtbWhpcGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzkwNjAsImV4cCI6MjA5MTg1NTA2MH0.FHdGO9CyuZRT791-Heqkq7oPGzyrsefpqDOZ04r97Xw'
);

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    console.log('Fetching leaderboard from Supabase...');
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(500);
    if (error) {
      console.error('Supabase leaderboard error:', JSON.stringify(error));
      throw error;
    }
    console.log('Leaderboard rows:', data?.length);
    res.json(data);
  } catch (err) {
    console.error('Leaderboard fetch error:', err.message || err);
    res.json([]);
  }
});

// POST to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  const { name, score, condition, difficulty, daily, correct, bias } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score required' });
  }

  try {
    const { error } = await supabase.from('leaderboard').insert({
      name: String(name).slice(0, 20),
      score,
      condition: condition || 'Unknown',
      difficulty: difficulty || 'moderate',
      daily: daily || false,
      correct: correct || false,
      bias: bias || null
    });
    if (error) throw error;

    // Get rank
    const { count } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true });

    const { data: players } = await supabase
      .from('leaderboard')
      .select('name');

    const uniquePlayers = new Set((players || []).map(p => p.name)).size;
    res.json({ rank: 0, totalPlayers: uniquePlayers });
  } catch (err) {
    console.error('Leaderboard insert error:', err);
    res.json({ rank: 0, totalPlayers: 0 });
  }
});

// Analytics endpoint — aggregate stats from Supabase
app.get('/api/analytics', async (req, res) => {
  try {
    const { data: all, error } = await supabase
      .from('leaderboard')
      .select('*');
    if (error) throw error;

    const leaderboard = all || [];
    const total = leaderboard.length;
    if (total === 0) return res.json({ totalGames: 0 });

    const correctCount = leaderboard.filter(e => e.correct).length;

    // Accuracy by condition
    const byCondition = {};
    for (const e of leaderboard) {
      if (!byCondition[e.condition]) byCondition[e.condition] = { total: 0, correct: 0 };
      byCondition[e.condition].total++;
      if (e.correct) byCondition[e.condition].correct++;
    }

    const conditionStats = Object.entries(byCondition)
      .map(([name, stats]) => ({ name, ...stats, accuracy: Math.round((stats.correct / stats.total) * 100) }))
      .sort((a, b) => b.total - a.total);

    // Bias analysis
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

    const dailyGames = leaderboard.filter(e => e.daily);
    const dailyCorrect = dailyGames.filter(e => e.correct).length;
    const uniquePlayers = new Set(leaderboard.map(e => e.name)).size;
    const hardest = conditionStats.filter(c => c.total >= 2).sort((a, b) => a.accuracy - b.accuracy)[0];
    const deadliestBias = biasBreakdown[0];

    res.json({
      totalGames: total,
      totalCorrect: correctCount,
      globalAccuracy: Math.round((correctCount / total) * 100),
      uniquePlayers,
      conditionStats,
      biasBreakdown,
      difficultyStats,
      dailyGames: dailyGames.length,
      dailyAccuracy: dailyGames.length ? Math.round((dailyCorrect / dailyGames.length) * 100) : 0,
      hardestCondition: hardest || null,
      deadliestBias: deadliestBias || null
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.json({ totalGames: 0 });
  }
});

// Case history — save completed cases for the case library
app.post('/api/case-history', async (req, res) => {
  const { name, condition, correct, score, difficulty, confidence_verdict, time_taken, reveal_data, withheld_info } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    const { error } = await supabase.from('case_history').insert({
      name: String(name).slice(0, 20),
      condition: condition || 'Unknown',
      correct: correct || false,
      score: score || 0,
      difficulty: difficulty || 'moderate',
      confidence_verdict: confidence_verdict ?? null,
      time_taken: time_taken || null,
      reveal_data: reveal_data || null,
      withheld_info: withheld_info || null
    });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('Case history insert error:', err);
    res.json({ ok: false });
  }
});

// Get case history for a player
app.get('/api/case-history/:name', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('case_history')
      .select('*')
      .eq('name', req.params.name)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Case history fetch error:', err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Second Opinion running on http://localhost:${PORT}`);
});
