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
      Your job: review the case, find what was missed, and submit your verdict. Be careful though — sometimes the doctor got it right, and second-guessing them is the real mistake.
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
          <span class="text-dim">You inherit a case from the previous doctor. Read their notes carefully — the error is subtle and the reasoning sounds convincing.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">2</span>
        <div>
          <strong>Review the record</strong><br>
          <span class="text-dim">Check observations, blood results, ECGs, and order investigations like chest X-rays and blood gases. Not every abnormal result points to the answer — some are red herrings.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">3</span>
        <div>
          <strong>Talk to the patient</strong><br>
          <span class="text-dim">Ask them questions using the category buttons — Symptoms, History, Medications, Social. The patient may be holding back information they didn't think was relevant. Ask the right questions to uncover it.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">4</span>
        <div>
          <strong>Submit your verdict</strong><br>
          <span class="text-dim">Pick what you think went wrong and rate your confidence. Be honest — overconfidence is penalised, but so is getting lucky with low confidence.</span>
        </div>
      </div>
      <div class="instruction-step">
        <span class="step-number">5</span>
        <div>
          <strong>Learn from the review</strong><br>
          <span class="text-dim">See the full breakdown: the correct diagnosis, what the doctor missed, which cognitive bias was at play, what the patient was hiding, and teaching points. Every completed case is saved to your Case Library.</span>
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
      <div style="margin-top: 8px;"><span class="glow">+20 bonus</span> <span class="text-dim">— high confidence + correct</span></div>
      <div><span class="glow">+10 bonus</span> <span class="text-dim">— low confidence + wrong (honestly uncertain)</span></div>
      <div style="margin-top: 8px;"><span class="text-red">-20 penalty</span> <span class="text-dim">— high confidence + wrong (confidently wrong is dangerous)</span></div>
      <div><span class="text-red">-10 penalty</span> <span class="text-dim">— low confidence + correct (got lucky)</span></div>
    </div>
  `;
  container.appendChild(scoring);

  // Ranks
  const ranks = document.createElement('div');
  ranks.className = 'reveal-section';
  ranks.innerHTML = `
    <h3>Ranks</h3>
    <div style="line-height: 1.8;">
      <div><span class="glow">First Aider</span> <span class="text-dim">— 0 pts</span></div>
      <div><span class="glow">Medical Student</span> <span class="text-dim">— 100 pts</span></div>
      <div><span class="glow">FY1</span> <span class="text-dim">— 300 pts</span></div>
      <div><span class="glow">FY2</span> <span class="text-dim">— 600 pts</span></div>
      <div><span class="glow">SHO</span> <span class="text-dim">— 1,000 pts</span></div>
      <div><span class="glow">Registrar</span> <span class="text-dim">— 1,500 pts</span></div>
      <div><span class="glow">Consultant</span> <span class="text-dim">— 2,500 pts</span></div>
      <div><span class="glow">Professor</span> <span class="text-dim">— 4,000 pts</span></div>
    </div>
  `;
  container.appendChild(ranks);

  // Difficulty
  const difficulty = document.createElement('div');
  difficulty.className = 'reveal-section';
  difficulty.innerHTML = `
    <h3>Difficulty Levels</h3>
    <div style="line-height: 1.8;">
      <div><span class="glow">FY1</span> <span class="text-dim">— Classic presentation. No red herrings. All information available. Patient is cooperative.</span></div>
      <div><span class="glow">SHO</span> <span class="text-dim">— Moderate presentation. Some distractors. One cognitive bias trap. Patient may be holding back one piece of information.</span></div>
      <div><span class="glow">Registrar</span> <span class="text-dim">— Atypical presentation. Fragmented information. Multiple stacked biases. Patient holds back two pieces of information and gives vague answers.</span></div>
      <div style="margin-top: 8px;"><span style="color: var(--amber);">Daily Challenge</span> <span class="text-dim">— Same case for everyone. Harder than Registrar. One shot.</span></div>
    </div>
  `;
  container.appendChild(difficulty);

  // Modifiers
  const modifiers = document.createElement('div');
  modifiers.className = 'reveal-section';
  modifiers.innerHTML = `
    <h3>Modifiers</h3>
    <div style="line-height: 1.7;">
      <div class="text-dim" style="margin-bottom: 8px;">Some cases have random modifiers that change the rules. You'll see an amber banner if one is active.</div>
      <div><span class="text-amber">Incomplete Notes</span> <span class="text-dim">— parts of the doctor's notes are illegible</span></div>
      <div><span class="text-amber">Missing Results</span> <span class="text-dim">— some blood results are unavailable</span></div>
      <div><span class="text-amber">No History</span> <span class="text-dim">— patient was unresponsive on arrival</span></div>
      <div><span class="text-amber">Verbal Handover</span> <span class="text-dim">— no written notes, just a rushed phone call</span></div>
      <div><span class="text-amber">Language Barrier</span> <span class="text-dim">— patient has limited English</span></div>
      <div><span class="text-amber">Anxious Patient</span> <span class="text-dim">— patient fixates on one symptom</span></div>
      <div><span class="text-amber">Relative Answering</span> <span class="text-dim">— a family member answers instead</span></div>
    </div>
  `;
  container.appendChild(modifiers);

  // Tips
  const tips = document.createElement('div');
  tips.className = 'reveal-section';
  tips.innerHTML = `
    <h3>Tips</h3>
    <div style="line-height: 1.8;">
      <div class="teaching-point">Don't trust the previous doctor's confidence — well-written notes can hide serious errors.</div>
      <div class="teaching-point">Check the observations trend, not just individual readings. A patient who improved then deteriorated is more concerning than one who was always slightly off.</div>
      <div class="teaching-point">Not every abnormal blood result points to the answer — some support the wrong diagnosis deliberately.</div>
      <div class="teaching-point">Order investigations. The key finding might be in a test the previous doctor didn't request.</div>
      <div class="teaching-point">Talk to the patient using the category buttons. They may be holding back information they didn't think was relevant — you need to ask the right questions.</div>
      <div class="teaching-point">The previous doctor might message you mid-case defending their diagnosis. Don't let their confidence shake yours.</div>
      <div class="teaching-point">Not every case has an error — about 10% of the time, the previous doctor got it right.</div>
      <div class="teaching-point">Tap <span style="border-bottom: 1px dashed var(--green-dim);">underlined terms</span> for plain-English definitions.</div>
      <div class="teaching-point">Your completed cases are saved in the Case Library — revisit them to learn from your mistakes.</div>
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
