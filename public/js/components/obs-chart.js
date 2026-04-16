import state from '../state.js';

// Normal ranges for vital signs
const NORMAL_RANGES = {
  hr:   { low: 51, high: 90, unit: 'bpm', name: 'Heart Rate', meaning: 'How fast the heart is beating. Too fast could mean pain, infection, dehydration, or a heart problem. Too slow could mean a heart rhythm issue.' },
  temp: { low: 36.1, high: 38.0, unit: '°C', name: 'Temperature', meaning: 'Body temperature. Above 38°C is a fever, suggesting infection. Below 36°C can also be a sign of serious illness.' },
  rr:   { low: 12, high: 20, unit: '/min', name: 'Breathing Rate', meaning: 'Number of breaths per minute. Fast breathing can mean the body is struggling to get enough oxygen or is trying to compensate for something.' },
  spo2: { low: 96, high: 100, unit: '%', name: 'Oxygen Level', meaning: 'How much oxygen is in the blood. Below 94% usually needs oxygen treatment. Below 92% is concerning.' }
};

const NEWS2_MEANINGS = {
  low: 'A low NEWS2 score suggests the patient is relatively stable.',
  medium: 'A NEWS2 score of 5-6 means the patient needs urgent clinical review — something may be deteriorating.',
  high: 'A NEWS2 score of 7 or above is an emergency — the patient is critically unwell and needs immediate attention.'
};

function getVitalStatus(key, value) {
  const range = NORMAL_RANGES[key];
  if (!range) return 'normal';
  const num = parseFloat(value);
  if (isNaN(num)) return 'normal';
  if (num < range.low) return 'low';
  if (num > range.high) return 'high';
  return 'normal';
}

function getVitalClass(key, value) {
  const status = getVitalStatus(key, value);
  if (status === 'normal') return '';
  return 'text-amber';
}

function getBpStatus(bp) {
  if (!bp || typeof bp !== 'string') return 'normal';
  const parts = bp.split('/');
  if (parts.length !== 2) return 'normal';
  const systolic = parseInt(parts[0]);
  const diastolic = parseInt(parts[1]);
  if (systolic < 90 || diastolic < 60) return 'low';
  if (systolic > 140 || diastolic > 90) return 'high';
  return 'normal';
}

export function renderObsTimeline(obsSets) {
  const container = document.createElement('div');
  container.className = 'panel';
  const isEasy = state.gameMode === 'easy';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.textContent = isEasy ? 'Patient Observations (Vital Signs)' : 'Observations';
  container.appendChild(header);

  // Explanation for easy mode
  if (isEasy) {
    const explainer = document.createElement('div');
    explainer.className = 'text-dim mb-1';
    explainer.style.cssText = 'font-size: 14px; line-height: 1.6; padding: 8px 0;';
    explainer.textContent = 'These are the patient\'s vital signs taken at different times. Look at how they change over time — are things getting better or worse? Values highlighted in amber are outside the normal range.';
    container.appendChild(explainer);
  }

  const timeline = document.createElement('div');
  timeline.className = 'obs-timeline';

  for (const obs of obsSets) {
    const set = document.createElement('div');
    set.className = 'obs-set';

    const time = document.createElement('div');
    time.className = 'obs-set-time';
    time.textContent = obs.time;
    set.appendChild(time);

    const rows = [
      ['hr', 'HR', obs.hr, 'bpm'],
      ['bp', 'BP', obs.bp, ''],
      ['temp', 'Temp', obs.temp, '°C'],
      ['rr', 'RR', obs.rr, '/min'],
      ['spo2', 'SpO2', obs.spo2, '%'],
      ['news2', 'NEWS2', obs.news2, ''],
      ['avpu', 'AVPU', obs.avpu, '']
    ];

    for (const [key, label, value, unit] of rows) {
      const row = document.createElement('div');
      row.className = 'obs-set-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'obs-set-label';
      labelEl.textContent = isEasy ? (NORMAL_RANGES[key]?.name || label) : label;

      const valueEl = document.createElement('span');
      const valueStr = `${value}${unit ? ' ' + unit : ''}`;
      valueEl.textContent = valueStr;

      // Colour coding
      if (key === 'news2') {
        if (value >= 7) valueEl.className = 'text-red';
        else if (value >= 5) valueEl.className = 'text-amber';
      } else if (key === 'bp') {
        const bpStatus = getBpStatus(value);
        if (bpStatus !== 'normal') valueEl.className = 'text-amber';
      } else if (key === 'avpu') {
        if (value && value !== 'Alert') valueEl.className = 'text-amber';
      } else {
        valueEl.className = getVitalClass(key, value);
      }

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      set.appendChild(row);
    }

    timeline.appendChild(set);
  }

  container.appendChild(timeline);

  // Easy mode: explanations below the timeline
  if (isEasy) {
    const explanations = document.createElement('div');
    explanations.className = 'obs-explanations mt-1';
    explanations.style.cssText = 'font-size: 14px; line-height: 1.7; border-top: 1px solid var(--border); padding-top: 10px;';

    // NEWS2 explanation based on latest score
    const latestObs = obsSets[obsSets.length - 1];
    if (latestObs) {
      const newsLevel = latestObs.news2 >= 7 ? 'high' : latestObs.news2 >= 5 ? 'medium' : 'low';
      const newsEl = document.createElement('div');
      newsEl.className = newsLevel === 'high' ? 'text-red' : newsLevel === 'medium' ? 'text-amber' : 'text-dim';
      newsEl.style.marginBottom = '8px';
      newsEl.innerHTML = `<strong>Latest NEWS2: ${latestObs.news2}</strong> — ${NEWS2_MEANINGS[newsLevel]}`;
      explanations.appendChild(newsEl);
    }

    // Individual vital explanations
    const bpExplainer = document.createElement('div');
    bpExplainer.className = 'text-dim';
    bpExplainer.style.marginBottom = '6px';
    bpExplainer.innerHTML = '<strong>Blood Pressure</strong> — shown as systolic/diastolic (e.g. 120/80). Low blood pressure (below 90/60) can mean the body isn\'t pumping blood effectively. High blood pressure (above 140/90) puts strain on organs.';
    explanations.appendChild(bpExplainer);

    for (const [key, range] of Object.entries(NORMAL_RANGES)) {
      const el = document.createElement('div');
      el.className = 'text-dim';
      el.style.marginBottom = '6px';
      el.innerHTML = `<strong>${range.name}</strong> (normal: ${range.low}–${range.high} ${range.unit}) — ${range.meaning}`;
      explanations.appendChild(el);
    }

    const avpuEl = document.createElement('div');
    avpuEl.className = 'text-dim';
    avpuEl.innerHTML = '<strong>AVPU</strong> — consciousness level. Alert is normal. Responding to Voice or Pain means reduced consciousness. Unresponsive is an emergency.';
    explanations.appendChild(avpuEl);

    container.appendChild(explanations);
  }

  return container;
}

export function renderCurrentObs(obs) {
  const container = document.createElement('div');
  container.className = 'obs-grid';

  const items = [
    { label: 'HR', value: obs.hr, unit: 'bpm', warn: obs.hr > 100 || obs.hr < 51 },
    { label: 'BP', value: obs.bp, unit: '', warn: getBpStatus(obs.bp) !== 'normal' },
    { label: 'Temp', value: obs.temp, unit: '°C', warn: obs.temp > 38 || obs.temp < 36.1 },
    { label: 'RR', value: obs.rr, unit: '/min', warn: obs.rr > 20 || obs.rr < 12 },
    { label: 'SpO2', value: obs.spo2 + '%', unit: '', warn: obs.spo2 < 96 },
    { label: 'NEWS2', value: obs.news2, unit: '', warn: obs.news2 >= 5 }
  ];

  for (const item of items) {
    const box = document.createElement('div');
    box.className = 'obs-box';

    box.innerHTML = `
      <div class="obs-label">${item.label}</div>
      <div class="obs-value ${item.warn ? 'text-amber' : ''}">${item.value}</div>
    `;
    container.appendChild(box);
  }

  return container;
}
