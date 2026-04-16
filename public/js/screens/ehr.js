import { navigateTo } from '../app.js';
import { orderInvestigation } from '../api.js';
import state from '../state.js';
import { renderNotesViewer } from '../components/notes-viewer.js';
import { renderObsTimeline } from '../components/obs-chart.js';
import { renderBloodsTable, renderABGTable } from '../components/bloods-table.js';
import { renderChatPanel } from '../components/chat-panel.js';
import { renderPatientSprite } from '../components/patient-sprite.js';
import { sfxInvestigationOrder, sfxResultArrived, sfxNavigate, startAmbient, stopAmbient } from '../audio.js';
import { createTimerDisplay } from '../components/game-timer.js';
import { scheduleDoctorCallback } from '../components/doctor-callback.js';
import { startBleeps, stopBleeps } from '../components/bleeps.js';

export function renderEHR() {
  const screen = document.createElement('div');
  const caseData = state.caseData;

  // Timer
  screen.appendChild(createTimerDisplay());

  // Schedule doctor callback, bleeps, and ambient sound
  scheduleDoctorCallback(caseData);
  startBleeps();
  startAmbient();

  // Modifier banner
  if (caseData.modifier) {
    const modBanner = document.createElement('div');
    modBanner.className = 'modifier-banner';
    modBanner.innerHTML = `<span class="modifier-label">${caseData.modifier.label}</span> <span class="text-dim">— ${caseData.modifier.description}</span>`;
    screen.appendChild(modBanner);
  }

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
  verdictBar.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 20px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); background: var(--bg); border-top: 1px solid var(--border-bright); z-index: 100; display: flex; justify-content: flex-end;';

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

function getReportedTime() {
  // Generate a plausible "reported at" time based on current case time
  const currentTime = state.caseData?.patient?.current_time || '02:15';
  const [h, m] = currentTime.split(':').map(Number);
  const mins = m + 5 + Math.floor(Math.random() * 15);
  const newH = (h + Math.floor(mins / 60)) % 24;
  const newM = mins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function renderInvestigationResult(key, data, resultsArea) {
  const resultPanel = document.createElement('div');
  resultPanel.className = 'panel mt-1 investigation-result-panel';

  const headerText = `${data.label} — RESULTS`;
  const timeText = `Reported at ${data.reportedTime || getReportedTime()}`;

  const isABG = (key === 'blood_gas' || key === 'arterial_blood_gas' || key === 'abg') && typeof data.result === 'object';
  if (isABG) {
    resultPanel.innerHTML = `
      <div class="panel-header">${headerText}</div>
      <div class="text-dim" style="font-size: 13px; margin-bottom: 8px;">${timeText}</div>
    `;
    resultPanel.appendChild(renderABGTable(data.result));
    resultsArea.appendChild(resultPanel);
  } else if (data.imageUrl) {
    resultPanel.innerHTML = `
      <div class="panel-header">${headerText}</div>
      <div class="text-dim" style="font-size: 13px; margin-bottom: 8px;">${timeText}</div>
    `;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'xray-viewer';
    const img = document.createElement('img');
    img.src = data.imageUrl;
    img.className = 'xray-image';
    img.alt = data.label;
    imgContainer.appendChild(img);

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
    resultPanel.innerHTML = `
      <div class="panel-header">${headerText}</div>
      <div class="text-dim" style="font-size: 13px; margin-bottom: 8px;">${timeText}</div>
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
      btn.classList.add('investigation-complete');
      btn.disabled = true;
      btn.innerHTML = `<span class="investigation-btn-label">${inv.label}</span><span class="investigation-btn-status">✓ RESULTS BELOW</span>`;
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.classList.add('investigation-processing');
      btn.innerHTML = `<span class="investigation-btn-label">${inv.label}</span><span class="investigation-btn-status"><span class="loading-dots"></span> PROCESSING</span>`;
      sfxInvestigationOrder();

      try {
        const result = await orderInvestigation(state.sessionId, key);
        state.investigationsOrdered.push(key);

        // Build result data immediately
        const resultData = { label: result.label, result: result.result, imageUrl: null, reportedTime: getReportedTime() };

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

        // Show results after delay
        setTimeout(() => {
          sfxResultArrived();

          // Update button to complete state
          btn.classList.remove('investigation-processing');
          btn.classList.add('investigation-complete');
          btn.innerHTML = `<span class="investigation-btn-label">${inv.label}</span><span class="investigation-btn-status">✓ RESULTS BELOW</span>`;

          // Render if still on this tab
          if (resultsArea.isConnected) {
            renderInvestigationResult(key, resultData, resultsArea);
          }
        }, Math.min(result.delay_ms || 500, 5000));
      } catch (err) {
        console.error('Investigation order failed:', err);
        btn.classList.remove('investigation-processing');
        btn.innerHTML = `<span class="investigation-btn-label">${inv.label}</span><span class="investigation-btn-status" style="color: var(--red);">ERROR</span>`;
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
