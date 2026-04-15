import { navigateTo } from '../app.js';
import { highlightTerms } from '../components/glossary.js';
import state, { resetState } from '../state.js';

export function renderReveal() {
  const screen = document.createElement('div');
  screen.style.overflow = 'auto';

  const container = document.createElement('div');
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';

  // Title
  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.fontSize = '28px';
  title.style.textTransform = 'uppercase';
  title.style.letterSpacing = '3px';
  title.style.textAlign = 'center';
  title.style.marginBottom = '24px';
  title.textContent = 'Case Review';
  container.appendChild(title);

  const reveal = state.revealData;
  const verdict = state.playerVerdict;
  const doctorWasCorrect = reveal.doctor_was_correct === true;
  const playerSaidCorrect = verdict.playerSaysDoctorCorrect === true;

  // Doctor correct / incorrect banner
  if (doctorWasCorrect) {
    const banner = document.createElement('div');
    banner.className = 'reveal-section';
    banner.style.borderColor = playerSaidCorrect ? 'var(--green)' : 'var(--red)';
    banner.innerHTML = playerSaidCorrect
      ? `<h3 style="color: var(--green);">Correct — The Previous Doctor Got It Right</h3>
         <div>Well spotted. The previous doctor's assessment was sound. Not every case has an error — knowing when to trust good clinical work is just as important as catching mistakes.</div>`
      : `<h3 style="color: var(--red);">The Previous Doctor Was Actually Correct</h3>
         <div>This time, there was no error to find. The previous doctor's diagnosis and management were appropriate. Be careful of assuming there must always be a mistake — that's a cognitive bias in itself.</div>`;
    container.appendChild(banner);
  }

  // Correct diagnosis
  const diagSection = document.createElement('div');
  diagSection.className = 'reveal-section';
  diagSection.innerHTML = `
    <h3>Correct Diagnosis</h3>
    <div class="glow" style="font-size: 20px; margin-bottom: 12px;">${reveal.actual_diagnosis}</div>
    <div class="text-dim" style="margin-top: 8px;">Your answer: ${verdict.diagnosis}</div>
  `;
  container.appendChild(diagSection);

  // What was missed (or confirmation doctor was right)
  const missedSection = document.createElement('div');
  missedSection.className = 'reveal-section';
  missedSection.innerHTML = `
    <h3>${doctorWasCorrect ? 'Previous Doctor\'s Assessment' : 'What Was Missed'}</h3>
    <div>${reveal.previous_doctor_error}</div>
  `;
  container.appendChild(missedSection);

  // Cognitive bias
  const biasSection = document.createElement('div');
  biasSection.className = 'reveal-section';
  biasSection.innerHTML = `
    <h3>Cognitive Bias: ${(reveal.cognitive_bias_planted || '').toUpperCase()}</h3>
    <div>${reveal.bias_explanation || ''}</div>
  `;
  container.appendChild(biasSection);

  // Fork in the road
  const forkSection = document.createElement('div');
  forkSection.className = 'reveal-section';
  forkSection.innerHTML = `
    <h3>The Fork in the Road</h3>
    <div>${reveal.fork_in_the_road}</div>
  `;
  container.appendChild(forkSection);

  // Ideal management
  const mgmtSection = document.createElement('div');
  mgmtSection.className = 'reveal-section';
  mgmtSection.innerHTML = `
    <h3>Ideal Management</h3>
    <div>${reveal.ideal_management}</div>
  `;
  container.appendChild(mgmtSection);

  // Confidence journey
  if (state.confidenceRatings.length > 0) {
    const confSection = document.createElement('div');
    confSection.className = 'reveal-section';
    confSection.innerHTML = `<h3>Your Confidence Journey</h3>`;

    for (const rating of state.confidenceRatings) {
      const bar = document.createElement('div');
      bar.className = 'confidence-bar';
      bar.innerHTML = `
        <span class="confidence-bar-label">${rating.label}</span>
        <div style="flex: 1; background: var(--green-faint); height: 16px;">
          <div class="confidence-bar-fill" style="width: ${rating.value}%;"></div>
        </div>
        <span class="confidence-bar-value">${rating.value}%</span>
      `;
      confSection.appendChild(bar);
    }

    container.appendChild(confSection);
  }

  // Red herrings
  if (reveal.red_herrings && reveal.red_herrings.length > 0) {
    const rhSection = document.createElement('div');
    rhSection.className = 'reveal-section';
    rhSection.innerHTML = `<h3>Red Herrings</h3>`;
    for (const rh of reveal.red_herrings) {
      const item = document.createElement('div');
      item.className = 'teaching-point';
      item.textContent = rh;
      rhSection.appendChild(item);
    }
    container.appendChild(rhSection);
  }

  // Withheld information
  const withheld = state.withheldInfo || [];
  if (withheld.length > 0) {
    const withheldSection = document.createElement('div');
    withheldSection.className = 'reveal-section';
    withheldSection.style.borderColor = 'var(--amber)';
    withheldSection.innerHTML = `<h3 style="color: var(--amber);">What the Patient Didn't Tell You</h3>`;
    for (const w of withheld) {
      const item = document.createElement('div');
      item.className = 'teaching-point';
      item.style.borderLeftColor = 'var(--amber)';
      item.innerHTML = `<strong>${w.fact}</strong><br><span class="text-dim" style="font-size: 14px;">Why they didn't mention it: ${w.reason}</span>`;
      withheldSection.appendChild(item);
    }
    container.appendChild(withheldSection);
  }

  // Teaching points
  const teachSection = document.createElement('div');
  teachSection.className = 'reveal-section';
  teachSection.innerHTML = `<h3>Teaching Points</h3>`;
  for (const point of reveal.teaching_points) {
    const item = document.createElement('div');
    item.className = 'teaching-point';
    item.textContent = point;
    teachSection.appendChild(item);
  }
  container.appendChild(teachSection);

  // Guideline reference
  const guideRef = document.createElement('div');
  guideRef.className = 'reveal-section';
  guideRef.innerHTML = `
    <h3>Guideline Reference</h3>
    <div class="glow">${state.guidelineReference || 'See NICE guidelines'}</div>
  `;
  container.appendChild(guideRef);

  // Highlight glossary terms in easy mode
  if (state.gameMode === 'easy') {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      if (!node.textContent.trim()) continue;
      // Skip button text and headers
      if (node.parentNode.tagName === 'BUTTON' || node.parentNode.tagName === 'H2') continue;
      const frag = highlightTerms(node.textContent);
      node.parentNode.replaceChild(frag, node);
    }
  }

  // Play again
  const playAgain = document.createElement('button');
  playAgain.className = 'btn btn-primary mt-3';
  playAgain.style.fontSize = '22px';
  playAgain.style.padding = '12px 30px';
  playAgain.style.display = 'block';
  playAgain.style.margin = '24px auto';
  playAgain.textContent = 'PLAY AGAIN';
  playAgain.addEventListener('click', () => {
    resetState();
    navigateTo('title');
  });
  container.appendChild(playAgain);

  screen.appendChild(container);
  return screen;
}
