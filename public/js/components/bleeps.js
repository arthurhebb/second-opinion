// Hospital bleep distractions — periodic notifications that break concentration

import { sfxClick } from '../audio.js';

const BLEEP_MESSAGES = [
  "Nurse on Ward 7: \"Can you rewrite the drug chart for bed 12?\"",
  "Pharmacy calling about a warfarin dose query",
  "Can you come and cannulate the patient in bay 3?",
  "Bed 6's family are asking to speak to a doctor",
  "Blood results are ready for bed 14 — can you review?",
  "The registrar wants an update on your patients",
  "Discharge summary for bed 2 still needs completing",
  "Site manager: \"Any discharges expected today?\"",
  "Nurse: \"The patient in side room 4 has pulled out their cannula again\"",
  "ED calling — they want to refer a patient to your team",
  "Bed 9 is asking for more pain relief",
  "Radiology: \"The CT slot is available now if you want it\"",
  "Nurse: \"Can you come and review bed 3? They don't look right\"",
  "Microbiology called — they want to discuss the blood cultures",
  "The physio is asking if the patient in bed 7 is safe to mobilise",
  "Bed 11's IV has tissued — can someone resite it?",
  "Handover in 20 minutes — have you updated the board?",
  "Nurse: \"The patient's daughter is on the phone, wants to speak to the doctor\"",
];

let bleepInterval = null;
let usedIndices = [];

export function startBleeps() {
  stopBleeps();
  usedIndices = [];

  // First bleep after 60 seconds, then every 60 seconds
  bleepInterval = setInterval(() => {
    showBleep();
  }, 60000);
}

export function stopBleeps() {
  if (bleepInterval) {
    clearInterval(bleepInterval);
    bleepInterval = null;
  }
  // Remove any visible bleeps
  document.querySelectorAll('.bleep-notification').forEach(el => el.remove());
}

function showBleep() {
  // Pick a message we haven't used yet
  if (usedIndices.length >= BLEEP_MESSAGES.length) usedIndices = [];
  let idx;
  do {
    idx = Math.floor(Math.random() * BLEEP_MESSAGES.length);
  } while (usedIndices.includes(idx));
  usedIndices.push(idx);

  sfxClick();

  const el = document.createElement('div');
  el.className = 'bleep-notification';
  el.textContent = BLEEP_MESSAGES[idx];
  document.body.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.classList.add('bleep-in');
  });

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    el.classList.add('bleep-out');
    setTimeout(() => el.remove(), 400);
  }, 5000);
}
