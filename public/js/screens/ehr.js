import { navigateTo } from '../app.js';
import { orderInvestigation } from '../api.js';
import state from '../state.js';
import { renderNotesViewer } from '../components/notes-viewer.js';
import { renderObsTimeline } from '../components/obs-chart.js';
import { renderBloodsTable, renderABGTable } from '../components/bloods-table.js';
import { renderChatPanel } from '../components/chat-panel.js';
import { renderPatientSprite } from '../components/patient-sprite.js';

export function renderEHR() {
  const screen = document.createElement('div');
  const caseData = state.caseData;

  // Patient banner
  const banner = document.createElement('div');
  banner.className = 'patient-banner';

  // Sprite
  const sprite = renderPatientSprite(caseData.patient);
  banner.appendChild(sprite);

  const bannerInfo = document.createElement('div');
  bannerInfo.style.display = 'flex';
  bannerInfo.style.alignItems = 'center';
  bannerInfo.style.gap = '24px';
  bannerInfo.style.flexWrap = 'wrap';
  bannerInfo.innerHTML = `
    <span class="patient-name glow">${caseData.patient.name}, ${caseData.patient.age}${caseData.patient.sex[0]}</span>
    <span class="detail">DOB: ${caseData.patient.dob}</span>
    <span class="detail">NHS: ${caseData.patient.nhs_number}</span>
    <span class="detail">PC: ${caseData.patient.presenting_complaint}</span>
    <span class="detail">Admitted: ${caseData.patient.admission_time}</span>
  `;
  banner.appendChild(bannerInfo);
  screen.appendChild(banner);

  // Tab bar
  const tabNames = ['Notes', 'Observations', 'Investigations', 'Talk to Patient'];
  const tabBar = document.createElement('div');
  tabBar.className = 'tabs mt-2';

  const contentArea = document.createElement('div');
  contentArea.className = 'flex-1 overflow-auto mt-1';
  contentArea.style.paddingBottom = '60px';

  const tabs = tabNames.map((name, i) => {
    const tab = document.createElement('button');
    tab.className = 'tab' + (i === 0 ? ' active' : '');
    tab.textContent = name;
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTabContent(name, contentArea, caseData);
    });
    tabBar.appendChild(tab);
    return tab;
  });

  screen.appendChild(tabBar);
  screen.appendChild(contentArea);

  // Submit verdict button (fixed bottom)
  const verdictBar = document.createElement('div');
  verdictBar.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 20px; background: var(--bg); border-top: 1px solid var(--border-bright); z-index: 100; display: flex; justify-content: flex-end;';

  const verdictBtn = document.createElement('button');
  verdictBtn.className = 'btn btn-primary';
  verdictBtn.textContent = 'SUBMIT VERDICT';
  verdictBtn.addEventListener('click', () => {
    navigateTo('verdict');
  });
  verdictBar.appendChild(verdictBtn);
  screen.appendChild(verdictBar);

  // Render initial tab
  renderTabContent('Notes', contentArea, caseData);

  return screen;
}

function renderTabContent(tabName, container, caseData) {
  container.innerHTML = '';

  switch (tabName) {
    case 'Notes':
      container.appendChild(renderNotesViewer(caseData));
      break;

    case 'Observations':
      container.appendChild(renderObsTimeline(caseData.observations.sets));
      break;

    case 'Investigations':
      container.appendChild(renderInvestigationsTab(caseData));
      break;

    case 'Talk to Patient':
      const chatWrapper = document.createElement('div');
      chatWrapper.style.height = 'calc(100vh - 200px)';
      chatWrapper.appendChild(renderChatPanel());
      container.appendChild(chatWrapper);
      break;
  }
}

function renderInvestigationsTab(caseData) {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-2';

  // Bloods (always available — they were sent before handover)
  container.appendChild(renderBloodsTable(caseData.investigations.bloods_initial.results));

  // Orderable investigations
  const orderPanel = document.createElement('div');
  orderPanel.className = 'panel';

  const orderHeader = document.createElement('div');
  orderHeader.className = 'panel-header';
  orderHeader.textContent = 'Order Investigations';
  orderPanel.appendChild(orderHeader);

  const btnRow = document.createElement('div');
  btnRow.className = 'investigation-buttons';

  const orderable = caseData.investigations.orderable;
  const resultsArea = document.createElement('div');
  resultsArea.className = 'mt-2';

  for (const [key, inv] of Object.entries(orderable)) {
    const btn = document.createElement('button');
    btn.className = 'investigation-btn';
    btn.textContent = inv.label;

    if (state.investigationsOrdered.includes(key)) {
      btn.classList.add('ordered');
      btn.disabled = true;
      btn.textContent = `${inv.label} ✓`;
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = `${inv.label}...`;

      try {
        const result = await orderInvestigation(state.sessionId, key);
        state.investigationsOrdered.push(key);
        btn.classList.add('ordered');
        btn.textContent = `${inv.label} ✓`;

        // Show results after delay
        setTimeout(() => {
          if (key === 'blood_gas' && typeof result.result === 'object') {
            resultsArea.appendChild(renderABGTable(result.result));
          } else {
            const resultPanel = document.createElement('div');
            resultPanel.className = 'panel mt-1';
            resultPanel.innerHTML = `
              <div class="panel-header">${result.label}</div>
              <div class="notes-viewer">${typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2)}</div>
            `;
            resultsArea.appendChild(resultPanel);
          }
        }, result.delay_ms || 500);
      } catch (err) {
        btn.textContent = `${inv.label} — ERROR`;
        btn.disabled = false;
      }
    });

    btnRow.appendChild(btn);
  }

  orderPanel.appendChild(btnRow);
  container.appendChild(orderPanel);
  container.appendChild(resultsArea);

  return container;
}
