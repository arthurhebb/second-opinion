import state from '../state.js';

export function renderBloodsTable(results) {
  const container = document.createElement('div');
  container.className = 'panel';
  const isEasy = state.gameMode === 'easy';
  const mod = state.caseData?.modifier?.id;

  // MODIFIER: missing bloods — hide 2-3 results
  let filteredResults = { ...results };
  if (mod === 'missing_bloods') {
    const keys = Object.keys(filteredResults);
    const hideCount = Math.min(3, keys.length - 4);
    const hideIndices = [];
    while (hideIndices.length < hideCount) {
      const idx = Math.floor(Math.random() * keys.length);
      if (!hideIndices.includes(idx)) hideIndices.push(idx);
    }
    for (const idx of hideIndices) {
      filteredResults[keys[idx]] = { value: '—', unit: '', range: '', flag: 'NORMAL', meaning: 'Sample haemolysed — result unavailable', _hidden: true };
    }
  }

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.textContent = isEasy ? 'Blood Test Results' : 'Blood Results';
  container.appendChild(header);

  const table = document.createElement('table');
  table.className = 'bloods-table';

  const thead = document.createElement('thead');
  if (isEasy) {
    thead.innerHTML = `<tr><th>Test</th><th>Result</th><th>Normal Range</th><th>Status</th><th>What This Means</th></tr>`;
  } else {
    thead.innerHTML = `<tr><th>Test</th><th>Result</th><th>Unit</th><th>Reference</th><th>Flag</th></tr>`;
  }
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const [test, data] of Object.entries(filteredResults)) {
    const tr = document.createElement('tr');
    const flagClass = data.flag === 'NORMAL' ? 'flag-normal' : 'flag-high';

    if (isEasy) {
      const statusText = data.flag === 'NORMAL' ? 'Normal' : data.flag === 'HIGH' ? 'Too High' : 'Too Low';
      const statusClass = data.flag === 'NORMAL' ? 'flag-normal' : 'flag-high';
      tr.innerHTML = `
        <td>${test}</td>
        <td class="${flagClass}">${data.value} ${data.unit}</td>
        <td class="text-dim">${data.range}</td>
        <td class="${statusClass}">${statusText}</td>
        <td class="text-dim" style="font-size: 14px; max-width: 250px;">${data.meaning || ''}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${test}</td>
        <td class="${flagClass}">${data.value}${data.flag !== 'NORMAL' ? ' *' : ''}</td>
        <td class="text-dim">${data.unit}</td>
        <td class="text-dim">${data.range}</td>
        <td class="${flagClass}">${data.flag !== 'NORMAL' ? data.flag : ''}</td>
      `;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  if (isEasy) {
    const note = document.createElement('div');
    note.className = 'text-dim mt-1';
    note.style.fontSize = '14px';
    note.textContent = 'Values highlighted in amber are outside the normal range.';
    container.appendChild(note);
  }

  return container;
}

export function renderABGTable(results) {
  const container = document.createElement('div');
  container.className = 'panel mt-2';
  const isEasy = state.gameMode === 'easy';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.textContent = isEasy ? 'Blood Gas Test (measures oxygen and acid levels)' : 'Arterial Blood Gas';
  container.appendChild(header);

  const table = document.createElement('table');
  table.className = 'bloods-table';

  const thead = document.createElement('thead');
  if (isEasy) {
    thead.innerHTML = `<tr><th>Test</th><th>Result</th><th>Normal Range</th><th>Status</th></tr>`;
  } else {
    thead.innerHTML = `<tr><th>Test</th><th>Result</th><th>Reference</th><th>Flag</th></tr>`;
  }
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const [test, data] of Object.entries(results)) {
    const tr = document.createElement('tr');
    const displayName = test.replace(/_/g, ' ');

    // Handle both object format {value, range, flag} and flat values
    if (typeof data === 'object' && data !== null && 'value' in data) {
      const flagClass = data.flag === 'NORMAL' ? 'flag-normal' : 'flag-high';
      if (isEasy) {
        const statusText = data.flag === 'NORMAL' ? 'Normal' : data.flag === 'HIGH' ? 'Too High' : 'Too Low';
        tr.innerHTML = `
          <td>${displayName}</td>
          <td class="${flagClass}">${data.value}</td>
          <td class="text-dim">${data.range || ''}</td>
          <td class="${flagClass}">${statusText}</td>
        `;
      } else {
        tr.innerHTML = `
          <td>${displayName}</td>
          <td class="${flagClass}">${data.value}</td>
          <td class="text-dim">${data.range || ''}</td>
          <td class="${flagClass}">${data.flag !== 'NORMAL' ? data.flag : ''}</td>
        `;
      }
    } else {
      // Flat value — just display it
      tr.innerHTML = `
        <td>${displayName}</td>
        <td>${data}</td>
        <td class="text-dim">—</td>
        <td>—</td>
      `;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
