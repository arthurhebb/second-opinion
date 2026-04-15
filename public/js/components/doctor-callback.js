import { sfxResultArrived } from '../audio.js';

let callbackShown = false;
let callbackTimeout = null;

/**
 * Schedule the doctor callback message to appear after a delay.
 * Call this when the EHR screen loads.
 */
export function scheduleDoctorCallback(caseData) {
  if (callbackShown) return; // Only show once per case

  const message = caseData.previous_doctor?.callback_message;
  if (!message) return;

  const doctorName = caseData.previous_doctor.name;
  const doctorGrade = caseData.previous_doctor.grade;

  // Show after 60-90 seconds (randomised so it feels organic)
  const delay = 60000 + Math.random() * 30000;

  callbackTimeout = setTimeout(() => {
    showCallback(doctorName, doctorGrade, message);
  }, delay);
}

/**
 * Cancel any pending callback (e.g. if player leaves EHR).
 */
export function cancelDoctorCallback() {
  if (callbackTimeout) {
    clearTimeout(callbackTimeout);
    callbackTimeout = null;
  }
}

/**
 * Reset for a new game.
 */
export function resetDoctorCallback() {
  cancelDoctorCallback();
  callbackShown = false;
}

function showCallback(name, grade, message) {
  if (callbackShown) return;
  callbackShown = true;

  sfxResultArrived();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'doctor-callback-overlay';

  const card = document.createElement('div');
  card.className = 'doctor-callback-card';

  card.innerHTML = `
    <div class="doctor-callback-header">MESSAGE FROM ${name.toUpperCase()} (${grade})</div>
    <div class="doctor-callback-body">"${message}"</div>
  `;

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn';
  dismissBtn.style.cssText = 'align-self: flex-end; font-size: 16px; padding: 6px 20px;';
  dismissBtn.textContent = 'DISMISS';
  dismissBtn.addEventListener('click', () => {
    overlay.classList.add('doctor-callback-out');
    setTimeout(() => overlay.remove(), 300);
  });

  card.appendChild(dismissBtn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('doctor-callback-in');
  });
}
