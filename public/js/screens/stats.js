import { navigateTo } from '../app.js';
import { getStats, resetScoreboard, getRank } from '../scoreboard.js';
import { getLeaderboard, getAnalytics } from '../api.js';
import { getPlayerName } from '../player.js';

const DIFFICULTY_LABELS = { classic: 'FY1', moderate: 'SHO', atypical: 'Registrar' };
const BIAS_LABELS = {
  anchoring: 'Anchoring',
  premature_closure: 'Premature Closure',
  availability: 'Availability',
  representativeness: 'Representativeness',
  base_rate_neglect: 'Base Rate Neglect',
  normalcy_bias: 'Normalcy Bias',
  inattentional_blindness: 'Inattentional Blindness',
  confirmation_bias: 'Confirmation Bias'
};

export function renderStats() {
  const screen = document.createElement('div');
  screen.style.overflow = 'auto';

  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';

  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.cssText = 'font-size: 28px; text-transform: uppercase; letter-spacing: 3px; text-align: center; margin-bottom: 24px;';
  title.textContent = 'Scoreboard';
  container.appendChild(title);

  const stats = getStats();

  // === YOUR STATS ===
  if (stats.totalGames === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-dim text-center';
    empty.style.cssText = 'font-size: 18px; padding: 16px 0;';
    empty.textContent = 'No games played yet. Go diagnose something.';
    container.appendChild(empty);
  } else {
    // Section header
    const yourHeader = document.createElement('div');
    yourHeader.className = 'stats-section-header';
    yourHeader.textContent = 'Your Stats';
    container.appendChild(yourHeader);

    container.appendChild(renderTopStats(stats));
    container.appendChild(renderConfidenceCalibration(stats));

    if (Object.keys(stats.byBias).length > 0) {
      container.appendChild(renderBiasProfile(stats));
    }

    container.appendChild(renderByDifficulty(stats));
    container.appendChild(renderRecentGames(stats));
  }

  // === GLOBAL ===
  const globalHeader = document.createElement('div');
  globalHeader.className = 'stats-section-header mt-2';
  globalHeader.textContent = 'Global';
  container.appendChild(globalHeader);

  // Leaderboard
  const leaderboardSection = document.createElement('div');
  leaderboardSection.className = 'reveal-section';
  leaderboardSection.innerHTML = '<h3>Leaderboard</h3><div class="text-dim">Loading...</div>';
  container.appendChild(leaderboardSection);
  loadLeaderboard(leaderboardSection);

  // Analytics
  const analyticsSection = document.createElement('div');
  analyticsSection.innerHTML = '<div class="text-dim" style="padding: 8px 0;">Loading global analytics...</div>';
  container.appendChild(analyticsSection);
  loadAnalytics(analyticsSection);

  // Reset button (only if has local games)
  if (stats.totalGames > 0) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-danger';
    resetBtn.style.cssText = 'font-size: 14px; padding: 6px 16px; display: block; margin: 24px auto;';
    resetBtn.textContent = 'RESET YOUR STATS';
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset your local stats? Global leaderboard entries will remain.')) {
        resetScoreboard();
        navigateTo('stats');
      }
    });
    container.appendChild(resetBtn);
  }

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'btn';
  backBtn.style.cssText = 'font-size: 18px; padding: 10px 24px; display: block; margin: 16px auto 24px;';
  backBtn.textContent = '< BACK TO MENU';
  backBtn.addEventListener('click', () => navigateTo('title'));
  container.appendChild(backBtn);

  screen.appendChild(container);
  return screen;
}

// === YOUR STATS RENDERERS ===

function renderTopStats(stats) {
  const rank = getRank(stats.totalScore);
  const section = document.createElement('div');

  // Rank display
  const rankDisplay = document.createElement('div');
  rankDisplay.style.cssText = 'text-align: center; margin-bottom: 16px;';
  rankDisplay.innerHTML = `
    <div class="glow-strong" style="font-size: 26px; letter-spacing: 2px; text-transform: uppercase;">${rank.title}</div>
    ${rank.nextTitle ? `<div class="text-dim" style="font-size: 14px; margin-top: 4px;">${rank.pointsToNext} pts to ${rank.nextTitle}</div>` : '<div class="text-amber" style="font-size: 14px; margin-top: 4px;">Max rank achieved</div>'}
  `;
  section.appendChild(rankDisplay);

  const statsRow = document.createElement('div');
  statsRow.className = 'stats-top-row';
  statsRow.innerHTML = `
    <div class="stat-box">
      <div class="stat-value glow">${stats.totalScore}</div>
      <div class="stat-label">Score</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${stats.accuracy}%</div>
      <div class="stat-label">Accuracy</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${stats.streak}</div>
      <div class="stat-label">Streak</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${stats.bestStreak}</div>
      <div class="stat-label">Best</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${stats.totalGames}</div>
      <div class="stat-label">Cases</div>
    </div>
  `;
  section.appendChild(statsRow);
  return section;
}

function renderConfidenceCalibration(stats) {
  const section = document.createElement('div');
  section.className = 'reveal-section';

  const rightConf = stats.avgConfidenceWhenRight;
  const wrongConf = stats.avgConfidenceWhenWrong;

  let calibrationMsg = '';
  if (wrongConf > 60) calibrationMsg = 'You tend to be overconfident when wrong — watch out for premature closure.';
  else if (rightConf < 40) calibrationMsg = 'You tend to doubt yourself even when right — trust your reasoning more.';
  else calibrationMsg = 'Your confidence generally matches your accuracy — good calibration.';

  section.innerHTML = `
    <h3>Confidence Calibration</h3>
    <div class="confidence-bar">
      <span class="confidence-bar-label">When correct</span>
      <div style="flex: 1; background: var(--green-faint); height: 16px;">
        <div class="confidence-bar-fill" style="width: ${rightConf}%;"></div>
      </div>
      <span class="confidence-bar-value">${rightConf}%</span>
    </div>
    <div class="confidence-bar">
      <span class="confidence-bar-label">When wrong</span>
      <div style="flex: 1; background: var(--green-faint); height: 16px;">
        <div class="confidence-bar-fill" style="width: ${wrongConf}%; background: var(--red);"></div>
      </div>
      <span class="confidence-bar-value">${wrongConf}%</span>
    </div>
    <div class="text-dim mt-1" style="font-size: 15px;">${calibrationMsg}</div>
  `;
  return section;
}

function renderByDifficulty(stats) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>By Difficulty</h3>';

  for (const [diff, data] of Object.entries(stats.byDifficulty)) {
    const pct = Math.round((data.correct / data.total) * 100);
    const label = DIFFICULTY_LABELS[diff] || diff;
    const bar = document.createElement('div');
    bar.className = 'confidence-bar';
    bar.innerHTML = `
      <span class="confidence-bar-label">${label}</span>
      <div style="flex: 1; background: var(--green-faint); height: 14px;">
        <div class="confidence-bar-fill" style="width: ${pct}%; height: 14px;"></div>
      </div>
      <span class="confidence-bar-value" style="font-size: 15px;">${pct}% (${data.total})</span>
    `;
    section.appendChild(bar);
  }

  return section;
}

function renderBiasProfile(stats) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Biases That Caught You</h3>';

  const sorted = Object.entries(stats.byBias).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] || 1;

  for (const [bias, count] of sorted) {
    const label = BIAS_LABELS[bias] || bias;
    const pct = Math.round((count / maxCount) * 100);
    const bar = document.createElement('div');
    bar.className = 'confidence-bar';
    bar.innerHTML = `
      <span class="confidence-bar-label" style="min-width: 180px; font-size: 14px;">${label}</span>
      <div style="flex: 1; background: var(--green-faint); height: 14px;">
        <div class="confidence-bar-fill" style="width: ${pct}%; height: 14px; background: var(--amber);"></div>
      </div>
      <span class="confidence-bar-value" style="font-size: 15px;">×${count}</span>
    `;
    section.appendChild(bar);
  }

  return section;
}

function renderRecentGames(stats) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Recent Cases</h3>';

  const table = document.createElement('div');
  table.className = 'recent-games';

  for (const game of stats.recentGames) {
    const row = document.createElement('div');
    row.className = 'recent-game-row';
    const date = new Date(game.date);
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
    const diff = DIFFICULTY_LABELS[game.difficulty] || game.difficulty;
    const result = game.correct ? '✓' : '✗';
    const resultClass = game.correct ? 'text-correct' : 'text-wrong';
    row.innerHTML = `
      <span class="text-dim" style="min-width: 45px;">${dateStr}</span>
      <span class="${resultClass}" style="min-width: 20px; font-size: 20px;">${result}</span>
      <span style="flex: 1;">${game.condition}</span>
      <span class="text-dim" style="min-width: 55px;">${diff}</span>
      <span class="glow" style="min-width: 45px; text-align: right;">+${game.score}</span>
    `;
    table.appendChild(row);
  }

  section.appendChild(table);
  return section;
}

// === GLOBAL RENDERERS ===

async function loadLeaderboard(section) {
  try {
    const data = await getLeaderboard();
    const playerName = getPlayerName();

    if (!data || data.length === 0) {
      section.innerHTML = '<h3>Leaderboard</h3><div class="text-dim">No scores yet — be the first!</div>';
      return;
    }

    section.innerHTML = '<h3>Leaderboard</h3>';

    const table = document.createElement('div');
    table.className = 'recent-games';

    const byPlayer = {};
    for (const entry of data) {
      if (!byPlayer[entry.name]) byPlayer[entry.name] = { totalScore: 0, games: 0, correct: 0 };
      byPlayer[entry.name].totalScore += entry.score;
      byPlayer[entry.name].games++;
      if (entry.correct) byPlayer[entry.name].correct++;
    }

    const sorted = Object.entries(byPlayer)
      .sort((a, b) => b[1].totalScore - a[1].totalScore)
      .slice(0, 20);

    for (let i = 0; i < sorted.length; i++) {
      const [name, s] = sorted[i];
      const isYou = name === playerName;
      const row = document.createElement('div');
      row.className = 'recent-game-row';
      if (isYou) row.style.borderColor = 'var(--green-dim)';
      const rank = i + 1;
      const medal = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`;
      const accuracy = s.games > 0 ? Math.round((s.correct / s.games) * 100) : 0;
      const playerRank = getRank(s.totalScore);
      row.innerHTML = `
        <span class="glow" style="min-width: 35px; font-size: 16px;">${medal}</span>
        <span style="flex: 1; ${isYou ? 'color: var(--green); text-shadow: var(--text-glow);' : ''}"><span class="text-dim" style="font-size: 12px;">${playerRank.title}</span> ${name}${isYou ? ' (you)' : ''}</span>
        <span class="text-dim" style="min-width: 50px;">${s.games} games</span>
        <span class="glow" style="min-width: 55px; text-align: right;">${s.totalScore}</span>
      `;
      table.appendChild(row);
    }

    section.appendChild(table);
  } catch (err) {
    section.innerHTML = '<h3>Leaderboard</h3><div class="text-dim">Could not load leaderboard.</div>';
  }
}

async function loadAnalytics(container) {
  try {
    const data = await getAnalytics();
    container.innerHTML = '';

    if (data.totalGames === 0) return;

    // Key findings
    if (data.hardestCondition || data.deadliestBias) {
      const findings = document.createElement('div');
      findings.className = 'reveal-section';
      findings.innerHTML = '<h3>Key Findings</h3>';
      const list = document.createElement('div');
      list.style.lineHeight = '1.8';

      list.innerHTML += `<div class="teaching-point"><span class="glow">${data.totalGames}</span> games played by <span class="glow">${data.uniquePlayers}</span> players — <span class="glow">${data.globalAccuracy}%</span> global accuracy</div>`;

      if (data.hardestCondition) {
        list.innerHTML += `<div class="teaching-point">Hardest condition: <span class="text-amber">${data.hardestCondition.name}</span> — only ${data.hardestCondition.accuracy}% accuracy (${data.hardestCondition.total} games)</div>`;
      }
      if (data.deadliestBias) {
        const biasLabel = BIAS_LABELS[data.deadliestBias.name] || data.deadliestBias.name;
        list.innerHTML += `<div class="teaching-point">Most dangerous bias: <span class="text-amber">${biasLabel}</span> — fools ${data.deadliestBias.foolRate}% of players</div>`;
      }
      if (data.dailyGames > 0) {
        list.innerHTML += `<div class="teaching-point">Daily challenge: ${data.dailyGames} attempts, ${data.dailyAccuracy}% accuracy</div>`;
      }

      findings.appendChild(list);
      container.appendChild(findings);
    }

    // Global accuracy by condition
    if (data.conditionStats.length > 0) {
      const condSection = document.createElement('div');
      condSection.className = 'reveal-section';
      condSection.innerHTML = '<h3>Global Accuracy by Condition</h3>';
      for (const cond of data.conditionStats.slice(0, 10)) {
        const color = cond.accuracy < 40 ? 'var(--red)' : cond.accuracy < 60 ? 'var(--amber)' : 'var(--green)';
        const bar = document.createElement('div');
        bar.className = 'confidence-bar';
        bar.innerHTML = `
          <span class="confidence-bar-label" style="min-width: 180px; font-size: 13px;">${cond.name}</span>
          <div style="flex: 1; background: var(--green-faint); height: 14px;">
            <div class="confidence-bar-fill" style="width: ${cond.accuracy}%; height: 14px; background: ${color};"></div>
          </div>
          <span class="confidence-bar-value" style="font-size: 14px;">${cond.accuracy}% <span class="text-dim">(${cond.total})</span></span>
        `;
        condSection.appendChild(bar);
      }
      container.appendChild(condSection);
    }

    // Global bias fool rates
    if (data.biasBreakdown.length > 0) {
      const biasSection = document.createElement('div');
      biasSection.className = 'reveal-section';
      biasSection.innerHTML = '<h3>Cognitive Bias Fool Rate</h3><div class="text-dim mb-1" style="font-size: 14px;">How often each bias tricks players</div>';
      for (const bias of data.biasBreakdown) {
        const label = BIAS_LABELS[bias.name] || bias.name;
        const color = bias.foolRate > 60 ? 'var(--red)' : bias.foolRate > 40 ? 'var(--amber)' : 'var(--green)';
        const bar = document.createElement('div');
        bar.className = 'confidence-bar';
        bar.innerHTML = `
          <span class="confidence-bar-label" style="min-width: 180px; font-size: 13px;">${label}</span>
          <div style="flex: 1; background: var(--green-faint); height: 14px;">
            <div class="confidence-bar-fill" style="width: ${bias.foolRate}%; height: 14px; background: ${color};"></div>
          </div>
          <span class="confidence-bar-value" style="font-size: 14px;">${bias.foolRate}%<span class="text-dim"> (${bias.total})</span></span>
        `;
        biasSection.appendChild(bar);
      }
      container.appendChild(biasSection);
    }
  } catch {
    container.innerHTML = '<div class="text-dim">Could not load global analytics.</div>';
  }
}
