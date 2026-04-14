import state from '../state.js';

export function renderBloodsTable(results) {
  const container = document.createElement('div');
  container.className = 'panel';
  const isEasy = state.gameMode === 'easy';

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
  for (const [test, data] of Object.entries(results)) {
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
    const flagClass = data.flag === 'NORMAL' ? 'flag-normal' : 'flag-high';
    const displayName = test.replace(/_/g, ' ');

    if (isEasy) {
      const statusText = data.flag === 'NORMAL' ? 'Normal' : data.flag === 'HIGH' ? 'Too High' : 'Too Low';
      tr.innerHTML = `
        <td>${displayName}</td>
        <td class="${flagClass}">${data.value}</td>
        <td class="text-dim">${data.range}</td>
        <td class="${flagClass}">${statusText}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${displayName}</td>
        <td class="${flagClass}">${data.value}</td>
        <td class="text-dim">${data.range}</td>
        <td class="${flagClass}">${data.flag !== 'NORMAL' ? data.flag : ''}</td>
      `;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
