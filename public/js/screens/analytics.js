import { navigateTo } from '../app.js';
import { getAnalytics } from '../api.js';

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

export function renderAnalytics() {
  const screen = document.createElement('div');
  screen.style.overflow = 'auto';

  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';

  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.cssText = 'font-size: 28px; text-transform: uppercase; letter-spacing: 3px; text-align: center; margin-bottom: 24px;';
  title.textContent = 'Analytics';
  container.appendChild(title);

  const loading = document.createElement('div');
  loading.className = 'text-dim text-center';
  loading.style.padding = '40px 0';
  loading.textContent = 'Loading global data...';
  container.appendChild(loading);

  screen.appendChild(container);

  // Fetch and render
  loadAnalytics(container, loading);

  return screen;
}

async function loadAnalytics(container, loading) {
  try {
    const data = await getAnalytics();
    loading.remove();

    if (data.totalGames === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-dim text-center';
      empty.style.padding = '40px 0';
      empty.textContent = 'No games played yet across any players.';
      container.appendChild(empty);
    } else {
      container.appendChild(renderOverview(data));
      container.appendChild(renderHighlights(data));
      if (data.conditionStats.length > 0) container.appendChild(renderConditions(data));
      if (data.biasBreakdown.length > 0) container.appendChild(renderBiases(data));
      if (data.difficultyStats.length > 0) container.appendChild(renderDifficulty(data));
      if (data.dailyGames > 0) container.appendChild(renderDaily(data));
    }

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn';
    backBtn.style.cssText = 'font-size: 18px; padding: 10px 24px; display: block; margin: 24px auto;';
    backBtn.textContent = '< BACK TO MENU';
    backBtn.addEventListener('click', () => navigateTo('title'));
    container.appendChild(backBtn);
  } catch (err) {
    loading.textContent = 'Failed to load analytics.';
  }
}

function renderOverview(data) {
  const section = document.createElement('div');
  section.className = 'stats-top-row';
  section.innerHTML = `
    <div class="stat-box">
      <div class="stat-value glow">${data.totalGames}</div>
      <div class="stat-label">Total Games</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${data.uniquePlayers}</div>
      <div class="stat-label">Players</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${data.globalAccuracy}%</div>
      <div class="stat-label">Global Accuracy</div>
    </div>
    <div class="stat-box">
      <div class="stat-value glow">${data.totalCorrect}</div>
      <div class="stat-label">Correct</div>
    </div>
  `;
  return section;
}

function renderHighlights(data) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Key Findings</h3>';

  const findings = document.createElement('div');
  findings.style.lineHeight = '1.8';

  if (data.hardestCondition) {
    findings.innerHTML += `<div class="teaching-point">Hardest condition: <span class="glow">${data.hardestCondition.name}</span> — only ${data.hardestCondition.accuracy}% accuracy across ${data.hardestCondition.total} games</div>`;
  }

  if (data.deadliestBias) {
    const biasLabel = BIAS_LABELS[data.deadliestBias.name] || data.deadliestBias.name;
    findings.innerHTML += `<div class="teaching-point">Most dangerous bias: <span class="text-amber">${biasLabel}</span> — fools ${data.deadliestBias.foolRate}% of players</div>`;
  }

  if (data.dailyGames > 0) {
    findings.innerHTML += `<div class="teaching-point">Daily challenge: ${data.dailyGames} attempts, ${data.dailyAccuracy}% accuracy</div>`;
  }

  section.appendChild(findings);
  return section;
}

function renderConditions(data) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Accuracy by Condition</h3>';

  for (const cond of data.conditionStats.slice(0, 15)) {
    const bar = document.createElement('div');
    bar.className = 'confidence-bar';
    const color = cond.accuracy < 40 ? 'var(--red)' : cond.accuracy < 60 ? 'var(--amber)' : 'var(--green)';
    bar.innerHTML = `
      <span class="confidence-bar-label" style="min-width: 200px; font-size: 13px;">${cond.name}</span>
      <div style="flex: 1; background: var(--green-faint); height: 14px;">
        <div class="confidence-bar-fill" style="width: ${cond.accuracy}%; height: 14px; background: ${color};"></div>
      </div>
      <span class="confidence-bar-value" style="font-size: 14px;">${cond.accuracy}% <span class="text-dim">(${cond.total})</span></span>
    `;
    section.appendChild(bar);
  }

  return section;
}

function renderBiases(data) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Cognitive Bias Fool Rate</h3><div class="text-dim mb-1" style="font-size: 14px;">How often each bias tricks players into the wrong answer</div>';

  for (const bias of data.biasBreakdown) {
    const label = BIAS_LABELS[bias.name] || bias.name;
    const bar = document.createElement('div');
    bar.className = 'confidence-bar';
    const color = bias.foolRate > 60 ? 'var(--red)' : bias.foolRate > 40 ? 'var(--amber)' : 'var(--green)';
    bar.innerHTML = `
      <span class="confidence-bar-label" style="min-width: 180px; font-size: 13px;">${label}</span>
      <div style="flex: 1; background: var(--green-faint); height: 14px;">
        <div class="confidence-bar-fill" style="width: ${bias.foolRate}%; height: 14px; background: ${color};"></div>
      </div>
      <span class="confidence-bar-value" style="font-size: 14px;">${bias.foolRate}% <span class="text-dim">(${bias.total})</span></span>
    `;
    section.appendChild(bar);
  }

  return section;
}

function renderDifficulty(data) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = '<h3>Accuracy by Difficulty</h3>';

  for (const diff of data.difficultyStats) {
    const label = DIFFICULTY_LABELS[diff.name] || diff.name;
    const accuracy = diff.accuracy;
    const bar = document.createElement('div');
    bar.className = 'confidence-bar';
    bar.innerHTML = `
      <span class="confidence-bar-label">${label}</span>
      <div style="flex: 1; background: var(--green-faint); height: 14px;">
        <div class="confidence-bar-fill" style="width: ${accuracy}%; height: 14px;"></div>
      </div>
      <span class="confidence-bar-value" style="font-size: 14px;">${accuracy}% <span class="text-dim">(${diff.total})</span></span>
    `;
    section.appendChild(bar);
  }

  return section;
}

function renderDaily(data) {
  const section = document.createElement('div');
  section.className = 'reveal-section';
  section.innerHTML = `
    <h3>Daily Challenge</h3>
    <div style="line-height: 1.8;">
      <div><span class="glow">${data.dailyGames}</span> <span class="text-dim">attempts</span></div>
      <div><span class="glow">${data.dailyAccuracy}%</span> <span class="text-dim">accuracy</span></div>
    </div>
  `;
  return section;
}
