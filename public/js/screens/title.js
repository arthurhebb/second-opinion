import { navigateTo } from '../app.js';
import { startCase } from '../api.js';
import state, { resetState } from '../state.js';

const ASCII_TITLE = `
 ███████╗███████╗ ██████╗ ██████╗ ███╗   ██╗██████╗
 ██╔════╝██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔══██╗
 ███████╗█████╗  ██║     ██║   ██║██╔██╗ ██║██║  ██║
 ╚════██║██╔══╝  ██║     ██║   ██║██║╚██╗██║██║  ██║
 ███████║███████╗╚██████╗╚██████╔╝██║ ╚████║██████╔╝
 ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝

  ██████╗ ██████╗ ██╗███╗   ██╗██╗ ██████╗ ███╗   ██╗
 ██╔═══██╗██╔══██╗██║████╗  ██║██║██╔═══██╗████╗  ██║
 ██║   ██║██████╔╝██║██╔██╗ ██║██║██║   ██║██╔██╗ ██║
 ██║   ██║██╔═══╝ ██║██║╚██╗██║██║██║   ██║██║╚██╗██║
 ╚██████╔╝██║     ██║██║ ╚████║██║╚██████╔╝██║ ╚████║
  ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`.trimStart();

export function renderTitle() {
  const screen = document.createElement('div');
  screen.className = 'flex flex-col';
  screen.style.alignItems = 'center';
  screen.style.justifyContent = 'center';
  screen.style.height = '100vh';
  screen.style.gap = '24px';

  const ascii = document.createElement('pre');
  ascii.className = 'title-ascii';
  ascii.textContent = ASCII_TITLE;
  screen.appendChild(ascii);

  const subtitle = document.createElement('div');
  subtitle.className = 'title-subtitle';
  subtitle.textContent = 'Spot the misdiagnosis';
  screen.appendChild(subtitle);

  // Two mode buttons
  const btnArea = document.createElement('div');
  btnArea.className = 'flex flex-col gap-1';
  btnArea.style.alignItems = 'center';
  btnArea.style.width = '100%';
  btnArea.style.maxWidth = '360px';

  const medBtn = document.createElement('button');
  medBtn.className = 'btn btn-primary';
  medBtn.style.cssText = 'font-size: 22px; padding: 12px 36px; width: 100%;';
  medBtn.textContent = '> MEDICAL MODE';
  medBtn.addEventListener('click', () => launchCase(medBtn, 'medical'));
  btnArea.appendChild(medBtn);

  const easyBtn = document.createElement('button');
  easyBtn.className = 'btn';
  easyBtn.style.cssText = 'font-size: 22px; padding: 12px 36px; width: 100%;';
  easyBtn.textContent = '> EASY MODE';
  easyBtn.addEventListener('click', () => launchCase(easyBtn, 'easy'));
  btnArea.appendChild(easyBtn);

  screen.appendChild(btnArea);

  const credit = document.createElement('div');
  credit.className = 'text-dim';
  credit.style.marginTop = '16px';
  credit.textContent = 'An MBBS SSC Project';
  screen.appendChild(credit);

  return screen;
}

async function launchCase(btn, gameMode) {
  const origText = btn.textContent;
  btn.textContent = '> GENERATING...';
  btn.disabled = true;

  try {
    resetState();
    state.gameMode = gameMode;
    const { sessionId, caseData } = await startCase({ mode: 'live', gameMode });
    state.sessionId = sessionId;
    state.caseData = caseData;
    navigateTo('briefing');
  } catch (err) {
    console.error('Failed to start case:', err);
    btn.textContent = '> ERROR — TRY AGAIN';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 3000);
  }
}
