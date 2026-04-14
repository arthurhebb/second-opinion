import state from './state.js';
import { renderTitle } from './screens/title.js';
import { renderBriefing } from './screens/briefing.js';
import { renderEHR } from './screens/ehr.js';
import { renderVerdict } from './screens/verdict.js';
import { renderReveal } from './screens/reveal.js';

const screens = {
  title: renderTitle,
  briefing: renderBriefing,
  ehr: renderEHR,
  verdict: renderVerdict,
  reveal: renderReveal
};

export function navigateTo(screenName, data) {
  state.currentScreen = screenName;
  const app = document.getElementById('app');
  app.innerHTML = '';

  const renderFn = screens[screenName];
  if (renderFn) {
    const el = renderFn(data);
    el.classList.add('screen', 'fade-in');
    app.appendChild(el);
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('title');
});
