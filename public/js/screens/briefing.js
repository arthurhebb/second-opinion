import { navigateTo } from '../app.js';
import { typewriterEffect } from '../components/terminal.js';
import { renderConfidenceSlider } from '../components/confidence.js';
import { renderPatientSprite } from '../components/patient-sprite.js';
import { startTimer, createTimerDisplay } from '../components/game-timer.js';
import state from '../state.js';

export function renderBriefing() {
  const screen = document.createElement('div');
  const caseData = state.caseData;

  // Start the game timer
  startTimer();
  screen.appendChild(createTimerDisplay());

  const briefingContainer = document.createElement('div');
  briefingContainer.className = 'briefing-container';

  // Modifier banner (if active) — placed before the briefing container so it's always visible
  if (caseData.modifier) {
    const modBanner = document.createElement('div');
    modBanner.className = 'modifier-banner mb-1';
    modBanner.innerHTML = `<span class="modifier-label">${caseData.modifier.label}</span> <span class="text-dim">— ${caseData.modifier.description}</span>`;
    screen.appendChild(modBanner);
  }

  // Header
  const header = document.createElement('div');
  header.className = 'briefing-header';
  header.textContent = 'INCOMING CASE TRANSFER';
  briefingContainer.appendChild(header);

  // Portrait + notes layout
  const bodyRow = document.createElement('div');
  bodyRow.className = 'briefing-body';

  // Large patient portrait
  const sprite = renderPatientSprite(caseData.patient);
  const spriteImg = sprite.querySelector('img');
  if (spriteImg) {
    spriteImg.classList.add('sprite-img-portrait', 'sprite-breathing');
  }
  sprite.className = 'briefing-portrait';
  bodyRow.appendChild(sprite);

  // Right side: context + notes
  const rightSide = document.createElement('div');
  rightSide.className = 'briefing-right';
  bodyRow.appendChild(rightSide);

  briefingContainer.appendChild(bodyRow);

  // Context line
  const context = document.createElement('div');
  context.className = 'mb-2';
  context.style.opacity = '0.7';
  context.style.fontSize = '16px';

  const entryText = {
    inheriting_case: `You are inheriting this case from ${caseData.previous_doctor.name} (${caseData.previous_doctor.grade}), who has gone off shift. The patient was admitted at ${caseData.patient.admission_time} and it is now ${caseData.patient.current_time}. Read their notes carefully.`
  };
  context.textContent = entryText[caseData.meta.entry_type] || entryText.inheriting_case;
  rightSide.appendChild(context);

  // Apply modifier to notes text
  let doctorNotes = caseData.previous_doctor.notes;
  const mod = caseData.modifier?.id;

  // Doctor's notes with typewriter effect
  const notesSection = document.createElement('div');
  notesSection.className = 'briefing-notes';

  const notesLabel = document.createElement('div');
  notesLabel.className = 'glow mb-1';
  notesLabel.style.fontSize = '16px';
  notesLabel.textContent = mod === 'verbal_handover'
    ? `► Verbal Handover from ${caseData.previous_doctor.name}:`
    : `► ${caseData.previous_doctor.name}'s Notes:`;
  notesSection.appendChild(notesLabel);

  const notesText = document.createElement('div');
  notesText.className = 'typewriter';
  notesText.style.marginTop = '8px';
  notesSection.appendChild(notesText);

  rightSide.appendChild(notesSection);

  // Bottom area for confidence + proceed button
  const bottomArea = document.createElement('div');
  bottomArea.className = 'mt-2';
  bottomArea.style.display = 'none';
  briefingContainer.appendChild(bottomArea);

  screen.appendChild(briefingContainer);

  if (mod === 'illegible_notes') {
    const sentences = doctorNotes.split('. ');
    if (sentences.length > 3) {
      const redactIndices = [];
      while (redactIndices.length < Math.min(2, sentences.length - 2)) {
        const idx = 1 + Math.floor(Math.random() * (sentences.length - 2));
        if (!redactIndices.includes(idx)) redactIndices.push(idx);
      }
      for (const idx of redactIndices) {
        sentences[idx] = '████████████████████';
      }
      doctorNotes = sentences.join('. ');
    }
  } else if (mod === 'verbal_handover') {
    doctorNotes = '"' + doctorNotes + '"';
  }

  // Start typewriter after render
  setTimeout(async () => {
    await typewriterEffect(notesText, doctorNotes, 20);

    // Show confidence slider
    bottomArea.style.display = 'block';

    const slider = renderConfidenceSlider(
      "How confident are you in this doctor's assessment?",
      (value) => {
        // Replace slider with proceed button
        bottomArea.innerHTML = '';
        const proceedBtn = document.createElement('button');
        proceedBtn.className = 'btn btn-primary';
        proceedBtn.style.fontSize = '20px';
        proceedBtn.style.padding = '10px 30px';
        proceedBtn.textContent = 'OPEN PATIENT RECORD →';
        proceedBtn.addEventListener('click', () => {
          navigateTo('ehr');
        });
        bottomArea.appendChild(proceedBtn);
      }
    );
    bottomArea.appendChild(slider);
  }, 300);

  return screen;
}
