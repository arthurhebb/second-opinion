import { navigateTo } from '../app.js';

export function renderInstructions() {
  const screen = document.createElement('div');
  screen.style.overflow = 'auto';

  const container = document.createElement('div');
  container.style.maxWidth = '700px';
  container.style.margin = '0 auto';

  // Title
  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.cssText = 'font-size: 28px; text-transform: uppercase; letter-spacing: 3px; text-align: center; margin-bottom: 24px;';
  title.textContent = 'How to Play';
  container.appendChild(title);

  // Premise
  const premise = document.createElement('div');
  premise.className = 'reveal-section';
  premise.innerHTML = `
    <h3>The Premise</h3>
    <div style="font-size: 18px; line-height: 1.7;">
      A previous doctor has seen this patient and written up their notes. They sound confident. They sound thorough.<br><br>
      But they made a mistake.<br><br>
      Your job: review the case, find what was missed, and submit your diagnosis.
    </div>
  `;
  container.appendChild(premise);

  // How to play
  const howTo = document.createElement('div');
  howTo.className = 'reveal-section';
  howTo.innerHTML = `
    <h3>Game Flow</h3>
    <div class="instructions-steps">
      <div class="instruction-step">
        <span class="step-number">1</span>
        <div>
          <strong>Read the handover</strong><br>
          <span class="text-dim">You inherit a case from the previous doctor. Read their notes carefully — the error is buried in there.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">2</span>
        <div>
          <strong>Review the record</strong><br>
          <span class="text-dim">Check the patient's notes, observations, blood results, and order investigations like chest X-rays.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">3</span>
        <div>
          <strong>Talk to the patient</strong><br>
          <span class="text-dim">Ask them questions directly. They might reveal something the doctor missed.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">4</span>
        <div>
          <strong>Submit your verdict</strong><br>
          <span class="text-dim">Pick what you think went wrong — and rate how confident you are.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">5</span>
        <div>
          <strong>Learn from the review</strong><br>
          <span class="text-dim">See the full breakdown: what was missed, which cognitive bias was at play, and teaching points.</span>
        </div>
      </div>
    </div>
  `;
  container.appendChild(howTo);

  // Scoring
  const scoring = document.createElement('div');
  scoring.className = 'reveal-section';
  scoring.innerHTML = `
    <h3>Scoring</h3>
    <div style="line-height: 1.8;">
      <div><span class="glow">+100 pts</span> <span class="text-dim">— correct diagnosis (base)</span></div>
      <div><span class="glow">x1.5 / x2</span> <span class="text-dim">— difficulty multiplier (SHO / Registrar)</span></div>
      <div><span class="glow">+10 per streak</span> <span class="text-dim">— consecutive correct answers</span></div>
      <div style="margin-top: 8px;"><span class="glow">+20 bonus</span> <span class="text-dim">— high confidence + correct (you trusted your reasoning)</span></div>
      <div><span class="glow">+10 bonus</span> <span class="text-dim">— low confidence + wrong (honestly uncertain)</span></div>
      <div style="margin-top: 8px;"><span class="text-red">-20 penalty</span> <span class="text-dim">— high confidence + wrong (confidently wrong is dangerous)</span></div>
      <div><span class="text-red">-10 penalty</span> <span class="text-dim">— low confidence + correct (got lucky, trust yourself more)</span></div>
    </div>
  `;
  container.appendChild(scoring);

  // Difficulty
  const difficulty = document.createElement('div');
  difficulty.className = 'reveal-section';
  difficulty.innerHTML = `
    <h3>Difficulty Levels</h3>
    <div style="line-height: 1.8;">
      <div><span class="glow">FY1</span> <span class="text-dim">— Classic presentation, no red herrings, all information available. A gentle start.</span></div>
      <div><span class="glow">SHO</span> <span class="text-dim">— Moderate presentation with distractors and one cognitive bias trap. Closer to real life.</span></div>
      <div><span class="glow">Registrar</span> <span class="text-dim">— Atypical presentation, fragmented information, multiple biases. The real challenge.</span></div>
    </div>
  `;
  container.appendChild(difficulty);

  // Tips
  const tips = document.createElement('div');
  tips.className = 'reveal-section';
  tips.innerHTML = `
    <h3>Tips</h3>
    <div style="line-height: 1.8;">
      <div class="teaching-point">Don't trust the previous doctor's confidence — well-written notes can hide serious errors.</div>
      <div class="teaching-point">Check the observations trend. A single set of vitals can look fine; the trend tells the real story.</div>
      <div class="teaching-point">Order investigations — sometimes the key finding is in a test the previous doctor didn't request.</div>
      <div class="teaching-point">Talk to the patient. They know things the notes don't capture.</div>
      <div class="teaching-point">Not every case has an error — sometimes the previous doctor got it right. Saying so takes confidence too.</div>
      <div class="teaching-point">Tap <span style="border-bottom: 1px dashed var(--green-dim);">underlined terms</span> for plain-English definitions.</div>
    </div>
  `;
  container.appendChild(tips);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-primary';
  backBtn.style.cssText = 'font-size: 20px; padding: 10px 30px; display: block; margin: 24px auto;';
  backBtn.textContent = '< BACK TO MENU';
  backBtn.addEventListener('click', () => navigateTo('title'));
  container.appendChild(backBtn);

  screen.appendChild(container);
  return screen;
}
