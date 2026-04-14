import { navigateTo } from '../app.js';
import { submitVerdict } from '../api.js';
import { renderPatientSprite } from '../components/patient-sprite.js';
import state, { addConfidenceRating } from '../state.js';

export function renderVerdict() {
  if (state.gameMode === 'easy') {
    return renderEasyVerdict();
  }
  return renderMedicalVerdict();
}

// ===== MEDICAL MODE (original) =====
function renderMedicalVerdict() {
  const screen = document.createElement('div');
  screen.style.display = 'flex';
  screen.style.justifyContent = 'center';
  screen.style.alignItems = 'flex-start';
  screen.style.overflow = 'auto';
  screen.style.padding = '20px 0';

  const form = document.createElement('div');
  form.className = 'verdict-form';

  // Patient sprite — they're watching you decide
  const spriteWrap = document.createElement('div');
  spriteWrap.className = 'verdict-sprite';
  const sprite = renderPatientSprite(state.caseData.patient);
  const spriteImg = sprite.querySelector('img');
  if (spriteImg) spriteImg.classList.add('sprite-breathing');
  spriteWrap.appendChild(sprite);
  form.appendChild(spriteWrap);

  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.fontSize = '28px';
  title.style.textTransform = 'uppercase';
  title.style.letterSpacing = '3px';
  title.style.textAlign = 'center';
  title.textContent = 'Submit Your Assessment';
  form.appendChild(title);

  // Diagnosis input
  const diagGroup = document.createElement('div');
  diagGroup.className = 'form-group';
  diagGroup.innerHTML = `<label>What is your diagnosis?</label>`;
  const diagInput = document.createElement('input');
  diagInput.className = 'input';
  diagInput.placeholder = 'Enter your diagnosis...';
  diagGroup.appendChild(diagInput);
  form.appendChild(diagGroup);

  // Doctor correct checkbox
  const correctGroup = document.createElement('div');
  correctGroup.className = 'form-group';
  const correctLabel = document.createElement('label');
  correctLabel.style.display = 'flex';
  correctLabel.style.alignItems = 'center';
  correctLabel.style.gap = '10px';
  correctLabel.style.cursor = 'pointer';
  const correctCheckbox = document.createElement('input');
  correctCheckbox.type = 'checkbox';
  correctCheckbox.style.width = '18px';
  correctCheckbox.style.height = '18px';
  correctCheckbox.style.accentColor = 'var(--green)';
  correctLabel.appendChild(correctCheckbox);
  correctLabel.appendChild(document.createTextNode('The previous doctor got it right — no error was made'));
  correctGroup.appendChild(correctLabel);
  form.appendChild(correctGroup);

  // What was missed
  const missedGroup = document.createElement('div');
  missedGroup.className = 'form-group';
  missedGroup.innerHTML = `<label>What did the previous doctor miss or get wrong?</label>`;
  const missedInput = document.createElement('textarea');
  missedInput.className = 'textarea';
  missedInput.rows = 4;
  missedInput.placeholder = 'Describe what was missed...';
  missedGroup.appendChild(missedInput);
  form.appendChild(missedGroup);

  correctCheckbox.addEventListener('change', () => {
    missedGroup.style.display = correctCheckbox.checked ? 'none' : 'flex';
    diagInput.placeholder = correctCheckbox.checked ? 'Confirm the diagnosis you agree with...' : 'Enter your diagnosis...';
  });

  // Confidence slider
  const confGroup = document.createElement('div');
  confGroup.className = 'form-group';
  confGroup.innerHTML = `<label>How confident are you in your assessment?</label>`;
  const sliderRow = document.createElement('div');
  sliderRow.className = 'slider-container';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '50'; slider.className = 'slider';
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value glow';
  valueDisplay.textContent = '50%';
  slider.addEventListener('input', () => { valueDisplay.textContent = slider.value + '%'; });
  sliderRow.appendChild(slider);
  sliderRow.appendChild(valueDisplay);
  confGroup.appendChild(sliderRow);
  form.appendChild(confGroup);

  // Submit
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary';
  submitBtn.style.cssText = 'font-size: 22px; padding: 12px 30px; align-self: center;';
  submitBtn.textContent = 'SUBMIT FINAL VERDICT';
  submitBtn.addEventListener('click', () => doSubmit(submitBtn, {
    diagnosis: diagInput.value.trim(),
    missed: correctCheckbox.checked ? 'No error — doctor was correct' : missedInput.value.trim(),
    confidence: parseInt(slider.value),
    playerSaysDoctorCorrect: correctCheckbox.checked
  }));
  form.appendChild(submitBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'btn text-dim';
  backBtn.style.alignSelf = 'center';
  backBtn.textContent = '← BACK TO RECORD';
  backBtn.addEventListener('click', () => navigateTo('ehr'));
  form.appendChild(backBtn);

  screen.appendChild(form);
  return screen;
}

// ===== EASY MODE (multiple choice) =====
function renderEasyVerdict() {
  const screen = document.createElement('div');
  screen.style.display = 'flex';
  screen.style.justifyContent = 'center';
  screen.style.alignItems = 'flex-start';
  screen.style.overflow = 'auto';
  screen.style.padding = '20px 0';

  const form = document.createElement('div');
  form.className = 'verdict-form';

  // Patient sprite — they're watching you decide
  const spriteWrap = document.createElement('div');
  spriteWrap.className = 'verdict-sprite';
  const sprite = renderPatientSprite(state.caseData.patient);
  const spriteImg = sprite.querySelector('img');
  if (spriteImg) spriteImg.classList.add('sprite-breathing');
  spriteWrap.appendChild(sprite);
  form.appendChild(spriteWrap);

  const title = document.createElement('h2');
  title.className = 'glow-strong';
  title.style.fontSize = '28px';
  title.style.textTransform = 'uppercase';
  title.style.letterSpacing = '3px';
  title.style.textAlign = 'center';
  title.textContent = 'What Do You Think?';
  form.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.className = 'text-dim text-center mb-2';
  subtitle.textContent = 'Pick the answer you think is right. The previous doctor might have got it right — or they might have missed something.';
  form.appendChild(subtitle);

  // Multiple choice options
  const choicesArea = document.createElement('div');
  choicesArea.className = 'flex flex-col gap-1';
  choicesArea.style.width = '100%';

  let selectedOption = null;
  const optionButtons = {}; // Map option ID -> button element

  // Load choices
  loadChoices(choicesArea, optionButtons, (option) => { selectedOption = option; });

  form.appendChild(choicesArea);

  // Feedback area (shown after submit)
  const feedbackArea = document.createElement('div');
  feedbackArea.style.display = 'none';
  form.appendChild(feedbackArea);

  // Confidence slider
  const confGroup = document.createElement('div');
  confGroup.className = 'form-group mt-2';
  confGroup.innerHTML = `<label>How confident are you?</label>`;
  const sliderRow = document.createElement('div');
  sliderRow.className = 'slider-container';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '50'; slider.className = 'slider';
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value glow';
  valueDisplay.textContent = '50%';
  slider.addEventListener('input', () => { valueDisplay.textContent = slider.value + '%'; });
  sliderRow.appendChild(slider);
  sliderRow.appendChild(valueDisplay);
  confGroup.appendChild(sliderRow);
  form.appendChild(confGroup);

  // Submit
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary';
  submitBtn.style.cssText = 'font-size: 22px; padding: 12px 30px; align-self: center;';
  submitBtn.textContent = 'LOCK IN ANSWER';
  submitBtn.addEventListener('click', async () => {
    if (!selectedOption) {
      choicesArea.style.outline = '1px solid var(--red)';
      setTimeout(() => { choicesArea.style.outline = 'none'; }, 1500);
      return;
    }

    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    addConfidenceRating('Final verdict', parseInt(slider.value));

    try {
      const verdictData = {
        diagnosis: selectedOption.text,
        missed: selectedOption.text,
        confidence: parseInt(slider.value),
        playerSaysDoctorCorrect: selectedOption.text.toLowerCase().includes('right') || selectedOption.text.toLowerCase().includes('correct') || selectedOption.text.toLowerCase().includes('nothing was missed'),
        selectedOptionId: selectedOption.id
      };

      const result = await submitVerdict(state.sessionId, verdictData);
      state.playerVerdict = result.playerVerdict;
      state.revealData = result.reveal;
      state.guidelineReference = result.guideline_reference;

      // Show inline feedback
      const isCorrect = result.selectedCorrect;

      // Disable all option buttons and highlight correct/incorrect
      for (const [id, btn] of Object.entries(optionButtons)) {
        btn.disabled = true;
        btn.classList.remove('btn-primary');
        if (id === result.correctOptionId) {
          btn.style.borderColor = 'var(--green)';
          btn.style.background = 'rgba(0, 255, 65, 0.15)';
          btn.style.opacity = '1';
        } else if (id === selectedOption.id && !isCorrect) {
          btn.style.borderColor = 'var(--red)';
          btn.style.background = 'rgba(255, 51, 51, 0.15)';
          btn.style.opacity = '1';
        } else {
          btn.style.opacity = '0.3';
        }
      }

      // Hide confidence slider
      confGroup.style.display = 'none';

      // Show feedback message
      feedbackArea.style.display = 'block';
      if (isCorrect) {
        feedbackArea.innerHTML = `
          <div style="text-align: center; padding: 16px; border: 1px solid var(--green); margin-top: 16px;">
            <div class="glow-strong" style="font-size: 24px; margin-bottom: 8px;">CORRECT</div>
            <div class="text-dim">Good catch. Let's see the full breakdown.</div>
          </div>
        `;
      } else {
        feedbackArea.innerHTML = `
          <div style="text-align: center; padding: 16px; border: 1px solid var(--red); margin-top: 16px;">
            <div style="font-size: 24px; color: var(--red); margin-bottom: 8px;">NOT QUITE</div>
            <div class="text-dim">The correct answer is highlighted above. Let's look at why.</div>
          </div>
        `;
      }

      // Replace submit button with "continue to review"
      submitBtn.style.display = 'none';
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn btn-primary';
      continueBtn.style.cssText = 'font-size: 22px; padding: 12px 30px; align-self: center;';
      continueBtn.textContent = 'SEE FULL REVIEW →';
      continueBtn.addEventListener('click', () => navigateTo('reveal'));
      form.appendChild(continueBtn);

    } catch (err) {
      console.error('Verdict submission failed:', err);
      submitBtn.textContent = 'ERROR — TRY AGAIN';
      submitBtn.disabled = false;
    }
  });
  form.appendChild(submitBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'btn text-dim';
  backBtn.style.alignSelf = 'center';
  backBtn.textContent = '← BACK TO RECORD';
  backBtn.addEventListener('click', () => navigateTo('ehr'));
  form.appendChild(backBtn);

  screen.appendChild(form);
  return screen;
}

async function loadChoices(container, optionButtons, onSelect) {
  try {
    const res = await fetch(`/api/case/${state.sessionId}/choices`);
    const data = await res.json();

    if (!data.choices || !data.choices.options) {
      container.innerHTML = '<div class="text-dim">Multiple choice not available for this case. Use Medical Mode instead.</div>';
      return;
    }

    container.innerHTML = '';
    const question = document.createElement('div');
    question.className = 'mb-2';
    question.style.fontSize = '20px';
    question.textContent = data.choices.question;
    container.appendChild(question);

    let selectedBtn = null;

    for (const opt of data.choices.options) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = 'width: 100%; text-align: left; padding: 12px 16px; font-size: 18px; line-height: 1.4;';
      btn.textContent = `${opt.id}. ${opt.text}`;
      optionButtons[opt.id] = btn;
      btn.addEventListener('click', () => {
        if (selectedBtn) selectedBtn.classList.remove('btn-primary');
        btn.classList.add('btn-primary');
        selectedBtn = btn;
        onSelect(opt);
      });
      container.appendChild(btn);
    }
  } catch (err) {
    console.error('Failed to load choices:', err);
    container.innerHTML = '<div class="text-dim">Failed to load choices.</div>';
  }
}

// Shared submit logic
async function doSubmit(btn, verdictData) {
  if (!verdictData.diagnosis && !verdictData.selectedOptionId) {
    return;
  }

  btn.textContent = 'SUBMITTING...';
  btn.disabled = true;

  addConfidenceRating('Final verdict', verdictData.confidence);

  try {
    const result = await submitVerdict(state.sessionId, verdictData);
    state.playerVerdict = result.playerVerdict;
    state.revealData = result.reveal;
    state.guidelineReference = result.guideline_reference;
    navigateTo('reveal');
  } catch (err) {
    console.error('Verdict submission failed:', err);
    btn.textContent = 'ERROR — TRY AGAIN';
    btn.disabled = false;
  }
}
