import { navigateTo, resetTransition } from '../app.js';
import { startCase } from '../api.js';
import { getPlayerName, setPlayerName, hasPlayerName } from '../player.js';
import { initAudio, isMuted, toggleMute, sfxClick, sfxDailyChallenge, sfxNavigate, sfxTypewriter, sfxResultArrived } from '../audio.js';
import { getStats, getRank } from '../scoreboard.js';
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

const DIFFICULTIES = {
  fy1: {
    label: 'FY1',
    description: 'Classic presentation, no red herrings',
    difficulty: {
      presentation_clarity: 'classic',
      red_herrings: 0,
      information_availability: 'full',
      cognitive_bias_traps: 0
    }
  },
  sho: {
    label: 'SHO',
    description: 'Moderate case, some distractors',
    difficulty: {
      presentation_clarity: 'moderate',
      red_herrings: 1,
      information_availability: 'mostly_complete',
      cognitive_bias_traps: 1
    }
  },
  registrar: {
    label: 'REGISTRAR',
    description: 'Atypical, fragmented, multiple biases',
    difficulty: {
      presentation_clarity: 'atypical',
      red_herrings: 2,
      information_availability: 'fragmented',
      cognitive_bias_traps: 2
    }
  }
};

const DAILY_DIFFICULTY = {
  presentation_clarity: 'atypical',
  red_herrings: 3,
  information_availability: 'fragmented',
  cognitive_bias_traps: 3
};

let currentView = 'main'; // 'main' or 'difficulty'

export function renderTitle() {
  const screen = document.createElement('div');
  screen.className = 'flex flex-col title-screen';

  const ascii = document.createElement('pre');
  ascii.className = 'title-ascii';
  ascii.textContent = ASCII_TITLE;
  screen.appendChild(ascii);

  const subtitle = document.createElement('div');
  subtitle.className = 'title-subtitle';
  subtitle.textContent = 'Spot the misdiagnosis';
  screen.appendChild(subtitle);

  // Content area that swaps between main menu and difficulty picker
  const content = document.createElement('div');
  content.className = 'flex flex-col gap-1';
  content.style.alignItems = 'center';
  content.style.width = '100%';
  content.style.maxWidth = '400px';
  screen.appendChild(content);

  if (!hasPlayerName()) {
    renderNamePrompt(content);
  } else {
    renderMainMenu(content);
  }


  // Bottom row: How to Play + Demo
  const helpBtn = document.createElement('button');
  helpBtn.className = 'btn text-dim help-btn';
  helpBtn.textContent = '? HOW TO PLAY';
  helpBtn.addEventListener('click', () => { sfxNavigate(); navigateTo('instructions'); });
  screen.appendChild(helpBtn);

  const demoBtn = document.createElement('button');
  demoBtn.className = 'btn text-dim demo-btn';
  demoBtn.textContent = 'DEMO';
  demoBtn.addEventListener('click', () => {
    sfxClick();
    launchCase(demoBtn, 'easy', DIFFICULTIES.sho.difficulty, false, true);
  });
  screen.appendChild(demoBtn);

  // Mute toggle — bottom left
  const muteBtn = document.createElement('button');
  muteBtn.className = 'btn text-dim mute-btn';
  muteBtn.textContent = isMuted() ? 'SOUND: OFF' : 'SOUND: ON';
  muteBtn.addEventListener('click', () => {
    initAudio();
    const nowMuted = toggleMute();
    muteBtn.textContent = nowMuted ? 'SOUND: OFF' : 'SOUND: ON';
    if (!nowMuted) sfxClick();
  });
  screen.appendChild(muteBtn);

  return screen;
}

function renderNamePrompt(container) {
  container.innerHTML = '';

  const label = document.createElement('div');
  label.className = 'glow';
  label.style.cssText = 'font-size: 18px; text-transform: uppercase; letter-spacing: 2px; text-align: center;';
  label.textContent = 'Enter your name';
  container.appendChild(label);


  const input = document.createElement('input');
  input.className = 'input';
  input.style.cssText = 'text-align: center; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;';
  input.placeholder = 'YOUR NAME';
  input.maxLength = 20;
  input.autofocus = true;
  container.appendChild(input);

  const goBtn = document.createElement('button');
  goBtn.className = 'btn btn-primary';
  goBtn.style.cssText = 'font-size: 20px; padding: 10px 30px; width: 100%;';
  goBtn.textContent = '> START';
  goBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = 'var(--red)';
      setTimeout(() => { input.style.borderColor = ''; }, 1000);
      return;
    }
    initAudio();
    sfxClick();
    setPlayerName(name);
    renderMainMenu(container);
  });
  container.appendChild(goBtn);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goBtn.click();
  });

  setTimeout(() => input.focus(), 100);
}

function renderMainMenu(container) {
  container.innerHTML = '';

  // Player greeting with rank
  const stats = getStats();
  const rank = getRank(stats.totalScore);

  const greeting = document.createElement('div');
  greeting.style.cssText = 'text-align: center; margin-bottom: 4px; cursor: pointer;';
  greeting.title = 'Click to change name';
  greeting.innerHTML = `
    <div class="glow" style="font-size: 16px;">${rank.title}</div>
    <div class="text-dim" style="font-size: 13px;">${getPlayerName()}${rank.nextTitle ? ` — ${rank.pointsToNext} pts to ${rank.nextTitle}` : ' — Max rank!'}</div>
  `;
  greeting.addEventListener('click', () => renderNamePrompt(container));
  container.appendChild(greeting);

  // Play button — primary, big
  const playBtn = document.createElement('button');
  playBtn.className = 'btn btn-primary';
  playBtn.style.cssText = 'font-size: 24px; padding: 14px 36px; width: 100%;';
  playBtn.textContent = '> PLAY';
  playBtn.addEventListener('click', () => { sfxClick(); renderDifficultyPicker(container); });
  container.appendChild(playBtn);

  // Medical mode — secondary, smaller
  const medBtn = document.createElement('button');
  medBtn.className = 'btn text-dim difficulty-btn';
  medBtn.style.cssText = 'font-size: 16px; padding: 8px 16px; width: 100%; text-align: left;';
  medBtn.innerHTML = `
    <div style="font-size: 16px; letter-spacing: 2px;">MEDICAL MODE</div>
    <div class="text-dim" style="font-size: 13px; margin-top: 2px; text-transform: none; letter-spacing: 0;">No multiple choice — type your own diagnosis. For medical students and clinicians.</div>
  `;
  medBtn.addEventListener('click', () => launchCase(medBtn, 'medical', DIFFICULTIES.sho.difficulty));
  container.appendChild(medBtn);

  // Scoreboard
  const statsBtn = document.createElement('button');
  statsBtn.className = 'btn text-dim';
  statsBtn.style.cssText = 'font-size: 16px; padding: 8px 24px; width: 100%;';
  statsBtn.textContent = 'SCOREBOARD';
  statsBtn.addEventListener('click', () => { sfxNavigate(); navigateTo('stats'); });
  container.appendChild(statsBtn);

  // Case Library
  const libraryBtn = document.createElement('button');
  libraryBtn.className = 'btn text-dim';
  libraryBtn.style.cssText = 'font-size: 16px; padding: 8px 24px; width: 100%;';
  libraryBtn.textContent = 'CASE LIBRARY';
  libraryBtn.addEventListener('click', () => { sfxNavigate(); navigateTo('caseLibrary'); });
  container.appendChild(libraryBtn);
}

function renderDifficultyPicker(container) {
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'text-center mb-1';
  header.style.fontSize = '18px';
  header.style.textTransform = 'uppercase';
  header.style.letterSpacing = '2px';
  header.style.opacity = '0.7';
  header.textContent = 'Select Difficulty';
  container.appendChild(header);

  for (const [key, preset] of Object.entries(DIFFICULTIES)) {
    const btn = document.createElement('button');
    btn.className = 'btn difficulty-btn';
    btn.style.cssText = 'width: 100%; text-align: left; padding: 12px 16px;';
    btn.innerHTML = `
      <div style="font-size: 20px; letter-spacing: 2px;">> ${preset.label}</div>
      <div class="text-dim" style="font-size: 14px; margin-top: 4px; text-transform: none; letter-spacing: 0;">${preset.description}</div>
    `;
    btn.addEventListener('click', () => { sfxClick(); launchCase(btn, 'easy', preset.difficulty); });
    container.appendChild(btn);
  }

  // Divider
  const divider = document.createElement('div');
  divider.className = 'daily-divider';
  divider.innerHTML = '<span>or</span>';
  container.appendChild(divider);

  // Daily challenge
  const dailyBtn = document.createElement('button');
  dailyBtn.className = 'btn daily-challenge-btn';
  dailyBtn.style.cssText = 'width: 100%; text-align: left; padding: 14px 16px;';
  const today = new Date();
  const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  dailyBtn.innerHTML = `
    <div style="font-size: 20px; letter-spacing: 2px; color: var(--amber);">> DAILY CHALLENGE</div>
    <div class="text-dim" style="font-size: 14px; margin-top: 4px; text-transform: none; letter-spacing: 0;">${dateStr} — same case for everyone. One shot. How good are you?</div>
  `;
  dailyBtn.addEventListener('click', () => { sfxDailyChallenge(); launchCase(dailyBtn, 'easy', DAILY_DIFFICULTY, true); });
  container.appendChild(dailyBtn);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'btn text-dim';
  backBtn.style.cssText = 'font-size: 14px; padding: 6px 16px; align-self: center; margin-top: 4px;';
  backBtn.textContent = '< BACK';
  backBtn.addEventListener('click', () => renderMainMenu(container));
  container.appendChild(backBtn);
}

const LOADING_MESSAGES = [
  'ACCESSING PATIENT RECORDS',
  'LOADING CLINICAL DATA',
  'REVIEWING BLOOD RESULTS',
  'PULLING IMAGING FROM ARCHIVE',
  'CROSS-REFERENCING GUIDELINES',
  'COMPILING CASE FILE',
  'CONSULTING WITH REGISTRAR',
  'PREPARING HANDOVER'
];

async function launchCase(btn, gameMode, difficulty, daily = false, demo = false) {
  // Take over the whole screen with a loading terminal
  const app = document.getElementById('app');
  app.innerHTML = '';

  const loadingScreen = document.createElement('div');
  loadingScreen.className = 'screen screen-no-scroll';
  loadingScreen.style.cssText = 'justify-content: center; align-items: center; background: var(--bg);';

  const terminal = document.createElement('div');
  terminal.className = 'loading-terminal';
  loadingScreen.appendChild(terminal);
  app.appendChild(loadingScreen);

  // Start cycling loading messages
  let msgIndex = 0;
  let caseReady = false;

  function addLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `loading-line ${className}`;
    line.innerHTML = `> ${text}<span class="loading-dots"></span>`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    sfxTypewriter();
  }

  // Show first message immediately
  addLine(LOADING_MESSAGES[0]);
  msgIndex = 1;

  // Add a new message every 1.5 seconds
  const msgInterval = setInterval(() => {
    if (caseReady) return;
    // Mark previous line as done
    const dots = terminal.querySelectorAll('.loading-dots');
    if (dots.length > 0) {
      const lastDots = dots[dots.length - 1];
      lastDots.classList.remove('loading-dots');
      lastDots.textContent = ' OK';
      lastDots.className = 'glow';
    }
    // Add next message
    if (msgIndex < LOADING_MESSAGES.length) {
      addLine(LOADING_MESSAGES[msgIndex]);
      msgIndex++;
    } else {
      // Loop back if still loading
      msgIndex = 0;
      addLine(LOADING_MESSAGES[msgIndex]);
      msgIndex++;
    }
  }, 1500);

  try {
    resetState();
    state.gameMode = gameMode;
    if (daily) state.isDaily = true;
    if (demo) state.isDemo = true;
    const { sessionId, caseData } = await startCase({ mode: demo ? 'demo' : 'live', gameMode, difficulty, daily });

    caseReady = true;
    clearInterval(msgInterval);

    // Mark last line as done
    const dots = terminal.querySelectorAll('.loading-dots');
    if (dots.length > 0) {
      const lastDots = dots[dots.length - 1];
      lastDots.classList.remove('loading-dots');
      lastDots.textContent = ' OK';
      lastDots.className = 'glow';
    }

    // Show ready message
    const readyLine = document.createElement('div');
    readyLine.className = 'loading-line loading-ready';
    readyLine.textContent = '> CASE READY.';
    terminal.appendChild(readyLine);
    sfxResultArrived();

    // Brief pause then transition
    await new Promise(r => setTimeout(r, 600));

    state.sessionId = sessionId;
    state.caseData = caseData;

    // Clear the loading screen and navigate directly
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.classList.remove('fade-out', 'glitch-out');
    resetTransition();
    navigateTo('briefing');
  } catch (err) {
    caseReady = true;
    clearInterval(msgInterval);
    console.error('Failed to start case:', err);

    const errLine = document.createElement('div');
    errLine.className = 'loading-line';
    errLine.style.color = 'var(--red)';
    errLine.textContent = '> ERROR — CASE GENERATION FAILED';
    terminal.appendChild(errLine);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn mt-2';
    retryBtn.textContent = '< BACK TO MENU';
    retryBtn.addEventListener('click', () => navigateTo('title'));
    terminal.appendChild(retryBtn);
  }
}
