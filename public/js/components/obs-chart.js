export function renderObsTimeline(obsSets) {
  const container = document.createElement('div');
  container.className = 'panel';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.textContent = 'Observations';
  container.appendChild(header);

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
      ['HR', obs.hr, 'bpm'],
      ['BP', obs.bp, ''],
      ['Temp', obs.temp, '°C'],
      ['RR', obs.rr, '/min'],
      ['SpO2', obs.spo2, '%'],
      ['NEWS2', obs.news2, ''],
      ['AVPU', obs.avpu, '']
    ];

    for (const [label, value, unit] of rows) {
      const row = document.createElement('div');
      row.className = 'obs-set-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'obs-set-label';
      labelEl.textContent = label;

      const valueEl = document.createElement('span');
      const valueStr = `${value}${unit ? ' ' + unit : ''}`;
      valueEl.textContent = valueStr;

      // Highlight concerning values
      if (label === 'NEWS2' && value >= 7) {
        valueEl.className = 'text-red';
      } else if (label === 'NEWS2' && value >= 5) {
        valueEl.className = 'text-amber';
      }

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      set.appendChild(row);
    }

    timeline.appendChild(set);
  }

  container.appendChild(timeline);
  return container;
}

export function renderCurrentObs(obs) {
  const container = document.createElement('div');
  container.className = 'obs-grid';

  const items = [
    { label: 'HR', value: obs.hr, unit: 'bpm', warn: obs.hr > 100 },
    { label: 'BP', value: obs.bp, unit: '', warn: true },
    { label: 'Temp', value: obs.temp, unit: '°C', warn: obs.temp > 38 },
    { label: 'RR', value: obs.rr, unit: '/min', warn: obs.rr > 20 },
    { label: 'SpO2', value: obs.spo2 + '%', unit: '', warn: obs.spo2 < 95 },
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
