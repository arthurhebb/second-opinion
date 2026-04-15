import { navigateTo } from '../app.js';
import { orderInvestigation } from '../api.js';
import state from '../state.js';
import { renderNotesViewer } from '../components/notes-viewer.js';
import { renderObsTimeline } from '../components/obs-chart.js';
import { renderBloodsTable, renderABGTable } from '../components/bloods-table.js';
import { renderChatPanel } from '../components/chat-panel.js';
import { renderPatientSprite } from '../components/patient-sprite.js';
import { sfxInvestigationOrder, sfxResultArrived, sfxNavigate } from '../audio.js';
import { createTimerDisplay } from '../components/game-timer.js';

export function renderEHR() {
  const screen = document.createElement('div');
  const caseData = state.caseData;

  // Timer
  screen.appendChild(createTimerDisplay());

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
      sfxNavigate();
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

const CXR_GUIDE = `How to read this X-ray:
  \u2022 The white shape in the middle is the heart \u2014 if it takes up more than half the chest, it's enlarged
  \u2022 Lungs should look dark (that's air) \u2014 bright white patches could mean fluid or infection
  \u2022 Both sides should look roughly symmetrical \u2014 if one side is whiter, something's wrong there
  \u2022 The bottom corners where the lungs meet the diaphragm should be sharp and clear \u2014 if they're blurry, there may be fluid
  \u2022 Look at the edges of the lungs \u2014 you should see faint lines all the way out. If there's a gap with no lines, the lung may have collapsed`;

function renderInvestigationResult(key, data, resultsArea) {
  if (key === 'blood_gas' && typeof data.result === 'object') {
    resultsArea.appendChild(renderABGTable(data.result));
  } else if (data.imageUrl) {
    const resultPanel = document.createElement('div');
    resultPanel.className = 'panel mt-1';
    resultPanel.innerHTML = `<div class="panel-header">${data.label}</div>`;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'xray-viewer';
    const img = document.createElement('img');
    img.src = data.imageUrl;
    img.className = 'xray-image';
    img.alt = 'Chest X-Ray';
    imgContainer.appendChild(img);

    // FY1/SHO: show full report. Registrar: show reading guide instead.
    const difficulty = state.caseData?.meta?.difficulty?.presentation_clarity;
    const isHard = difficulty === 'atypical';

    const report = document.createElement('div');
    report.className = isHard ? 'imaging-hint mt-1' : 'notes-viewer mt-1';
    report.textContent = isHard
      ? CXR_GUIDE
      : (typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2));

    resultPanel.appendChild(imgContainer);
    resultPanel.appendChild(report);
    resultsArea.appendChild(resultPanel);
  } else {
    const resultPanel = document.createElement('div');
    resultPanel.className = 'panel mt-1';
    resultPanel.innerHTML = `
      <div class="panel-header">${data.label}</div>
      <div class="notes-viewer">${typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2)}</div>
    `;
    resultsArea.appendChild(resultPanel);
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

  const orderable = caseData.investigations.orderable || {};
  const resultsArea = document.createElement('div');
  resultsArea.className = 'mt-2';

  // Re-render previously ordered investigation results
  for (const [key, data] of Object.entries(state.investigationResults)) {
    renderInvestigationResult(key, data, resultsArea);
  }

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
      sfxInvestigationOrder();

      try {
        const result = await orderInvestigation(state.sessionId, key);
        state.investigationsOrdered.push(key);
        btn.classList.add('ordered');
        btn.textContent = `${inv.label} ✓`;

        // Build result data immediately
        const resultData = { label: result.label, result: result.result, imageUrl: null };

        // Fetch X-ray image if applicable
        if (key === 'chest_xray' && caseData.investigations.imaging_category) {
          try {
            const imgRes = await fetch(`/api/imaging/xray/${caseData.investigations.imaging_category}`);
            const imgData = await imgRes.json();
            if (imgData.url) resultData.imageUrl = imgData.url;
          } catch (e) { /* fall back to text-only */ }
        }

        // Save to state immediately so tab switches preserve it
        state.investigationResults[key] = resultData;

        // Show results after delay (if still on this tab)
        setTimeout(() => {
          sfxResultArrived();
          // Only render if resultsArea is still in the DOM
          if (resultsArea.isConnected) {
            renderInvestigationResult(key, resultData, resultsArea);
          }
        }, Math.min(result.delay_ms || 500, 5000));
      } catch (err) {
        console.error('Investigation order failed:', err);
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
