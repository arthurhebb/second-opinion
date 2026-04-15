import state from './state.js';
import { renderTitle } from './screens/title.js';
import { renderBriefing } from './screens/briefing.js';
import { renderEHR } from './screens/ehr.js';
import { renderVerdict } from './screens/verdict.js';
import { renderReveal } from './screens/reveal.js';
import { renderStats } from './screens/stats.js';
import { renderInstructions } from './screens/instructions.js';
import { renderCaseLibrary } from './screens/case-library.js';
import { stopBleeps } from './components/bleeps.js';
import { stopAmbient } from './audio.js';

const screens = {
  title: renderTitle,
  briefing: renderBriefing,
  ehr: renderEHR,
  verdict: renderVerdict,
  reveal: renderReveal,
  stats: renderStats,
  instructions: renderInstructions,
  caseLibrary: renderCaseLibrary
};

let transitioning = false;

export function resetTransition() {
  transitioning = false;
}

export function navigateTo(screenName, data) {
  if (transitioning) return;
  // Stop bleeps and ambient when leaving EHR
  if (screenName !== 'ehr') { stopBleeps(); stopAmbient(); }
  state.currentScreen = screenName;
  const app = document.getElementById('app');
  const useGlitch = screenName === 'reveal';

  const renderFn = screens[screenName];
  if (!renderFn) return;

  // If no existing content, skip transition
  if (!app.firstChild) {
    const el = renderFn(data);
    el.classList.add('screen');
    if (screenName === 'title' || screenName === 'ehr') el.classList.add('screen-no-scroll');
    app.appendChild(el);
    return;
  }

  transitioning = true;

  if (useGlitch) {
    // Glitch cut for reveal screen
    app.classList.add('glitch-out');
    setTimeout(() => {
      app.innerHTML = '';
      app.classList.remove('glitch-out');
      const el = renderFn(data);
      el.classList.add('screen', 'glitch-in');
      if (screenName === 'title' || screenName === 'ehr') el.classList.add('screen-no-scroll');
      app.appendChild(el);
      transitioning = false;
    }, 300);
  } else {
    // Fade through black for everything else
    app.classList.add('fade-out');
    setTimeout(() => {
      app.innerHTML = '';
      app.classList.remove('fade-out');
      const el = renderFn(data);
      el.classList.add('screen', 'fade-in');
      if (screenName === 'title' || screenName === 'ehr') el.classList.add('screen-no-scroll');
      app.appendChild(el);
      transitioning = false;
    }, 250);
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('title');
});
