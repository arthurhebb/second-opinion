import { navigateTo } from '../app.js';
import { getCaseHistory } from '../api.js';
import { getPlayerName } from '../player.js';
import { getRank } from '../scoreboard.js';

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

export function renderCaseLibrary() {
  const screen = document.createElement('div');
  screen.style.overflow = 'auto';

  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';

  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.cssText = 'font-size: 28px; text-transform: uppercase; letter-spacing: 3px; text-align: center; margin-bottom: 24px;';
  title.textContent = 'Case Library';
  container.appendChild(title);

  const loading = document.createElement('div');
  loading.className = 'text-dim text-center';
  loading.style.padding = '40px 0';
  loading.textContent = 'Loading your cases...';
  container.appendChild(loading);

  screen.appendChild(container);

  loadCases(container, loading);

  return screen;
}

async function loadCases(container, loading) {
  const name = getPlayerName();
  if (!name) {
    loading.textContent = 'No player name set.';
    addBackButton(container);
    return;
  }

  try {
    const cases = await getCaseHistory(name);
    loading.remove();

    if (!cases || cases.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'text-dim text-center';
      empty.style.cssText = 'font-size: 18px; padding: 20px 0;';
      empty.textContent = 'No cases completed yet. Go play!';
      container.appendChild(empty);
    } else {
      // Summary stats
      const correct = cases.filter(c => c.correct).length;
      const uniqueConditions = new Set(cases.map(c => c.condition)).size;

      const summary = document.createElement('div');
      summary.className = 'stats-top-row';
      summary.innerHTML = `
        <div class="stat-box">
          <div class="stat-value glow">${cases.length}</div>
          <div class="stat-label">Cases</div>
        </div>
        <div class="stat-box">
          <div class="stat-value glow">${correct}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-box">
          <div class="stat-value glow">${uniqueConditions}</div>
          <div class="stat-label">Conditions</div>
        </div>
      `;
      container.appendChild(summary);

      // Case list
      for (const c of cases) {
        container.appendChild(renderCaseEntry(c));
      }
    }

    addBackButton(container);
  } catch (err) {
    loading.textContent = 'Failed to load cases.';
    addBackButton(container);
  }
}

function renderCaseEntry(caseData) {
  const entry = document.createElement('div');
  entry.className = 'case-entry';

  const date = new Date(caseData.created_at);
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const diff = DIFFICULTY_LABELS[caseData.difficulty] || caseData.difficulty;
  const result = caseData.correct ? '✓' : '✗';
  const resultClass = caseData.correct ? 'text-correct' : 'text-wrong';

  // Header row (always visible)
  const header = document.createElement('div');
  header.className = 'case-entry-header';
  header.innerHTML = `
    <span class="${resultClass}" style="font-size: 20px; min-width: 20px;">${result}</span>
    <span style="flex: 1;">${caseData.condition}</span>
    <span class="text-dim" style="min-width: 50px;">${diff}</span>
    <span class="glow" style="min-width: 45px; text-align: right;">+${caseData.score}</span>
    <span class="text-dim" style="min-width: 70px; text-align: right;">${dateStr}</span>
  `;

  // Detail panel (hidden, shown on click)
  const detail = document.createElement('div');
  detail.className = 'case-entry-detail';
  detail.style.display = 'none';

  const reveal = caseData.reveal_data;
  if (reveal) {
    let detailHTML = '';

    detailHTML += `<div class="case-detail-section"><strong>Correct Diagnosis:</strong> ${reveal.actual_diagnosis || 'Unknown'}</div>`;

    if (reveal.previous_doctor_error) {
      detailHTML += `<div class="case-detail-section"><strong>What Was Missed:</strong> ${reveal.previous_doctor_error}</div>`;
    }

    if (reveal.cognitive_bias_planted) {
      const biasLabel = BIAS_LABELS[reveal.cognitive_bias_planted] || reveal.cognitive_bias_planted;
      detailHTML += `<div class="case-detail-section"><strong>Cognitive Bias:</strong> ${biasLabel}</div>`;
      if (reveal.bias_explanation) {
        detailHTML += `<div class="case-detail-section text-dim">${reveal.bias_explanation}</div>`;
      }
    }

    if (reveal.fork_in_the_road) {
      detailHTML += `<div class="case-detail-section"><strong>The Fork in the Road:</strong> ${reveal.fork_in_the_road}</div>`;
    }

    if (reveal.teaching_points && reveal.teaching_points.length > 0) {
      detailHTML += `<div class="case-detail-section"><strong>Teaching Points:</strong></div>`;
      for (const point of reveal.teaching_points) {
        detailHTML += `<div class="teaching-point">${point}</div>`;
      }
    }

    // Withheld info
    const withheld = caseData.withheld_info;
    if (withheld && withheld.length > 0) {
      detailHTML += `<div class="case-detail-section" style="color: var(--amber);"><strong>What the Patient Didn't Tell You:</strong></div>`;
      for (const w of withheld) {
        detailHTML += `<div class="teaching-point" style="border-left-color: var(--amber);"><strong>${w.fact}</strong><br><span class="text-dim">${w.reason}</span></div>`;
      }
    }

    if (caseData.confidence_verdict != null) {
      detailHTML += `<div class="case-detail-section text-dim">Your confidence: ${caseData.confidence_verdict}%${caseData.time_taken ? ` | Time: ${caseData.time_taken}` : ''}</div>`;
    }

    detail.innerHTML = detailHTML;
  } else {
    detail.innerHTML = '<div class="text-dim">No case details available.</div>';
  }

  // Toggle detail on click
  header.style.cursor = 'pointer';
  header.addEventListener('click', () => {
    const showing = detail.style.display !== 'none';
    detail.style.display = showing ? 'none' : 'block';
    entry.classList.toggle('case-entry-open', !showing);
  });

  entry.appendChild(header);
  entry.appendChild(detail);
  return entry;
}

function addBackButton(container) {
  const backBtn = document.createElement('button');
  backBtn.className = 'btn';
  backBtn.style.cssText = 'font-size: 18px; padding: 10px 24px; display: block; margin: 24px auto;';
  backBtn.textContent = '< BACK TO MENU';
  backBtn.addEventListener('click', () => navigateTo('title'));
  container.appendChild(backBtn);
}
