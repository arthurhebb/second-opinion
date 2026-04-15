// Game modifiers — randomly applied to cases

const MODIFIERS = {
  illegible_notes: {
    id: 'illegible_notes',
    label: 'INCOMPLETE NOTES',
    description: 'Parts of the previous doctor\'s notes are illegible',
    type: 'frontend' // applied client-side
  },
  missing_bloods: {
    id: 'missing_bloods',
    label: 'MISSING RESULTS',
    description: 'Some blood results are unavailable',
    type: 'frontend'
  },
  no_history: {
    id: 'no_history',
    label: 'NO HISTORY',
    description: 'The patient was unresponsive on arrival — no history available from them',
    type: 'frontend'
  },
  verbal_handover: {
    id: 'verbal_handover',
    label: 'VERBAL HANDOVER',
    description: 'No written notes — you received a rushed phone handover',
    type: 'prompt'
  },
  language_barrier: {
    id: 'language_barrier',
    label: 'LANGUAGE BARRIER',
    description: 'The patient has limited English',
    type: 'patient_prompt'
  },
  anxious_patient: {
    id: 'anxious_patient',
    label: 'ANXIOUS PATIENT',
    description: 'The patient is fixated on one symptom and struggles to focus',
    type: 'patient_prompt'
  },
  relative_present: {
    id: 'relative_present',
    label: 'RELATIVE ANSWERING',
    description: 'A family member is answering on the patient\'s behalf',
    type: 'patient_prompt'
  }
};

// Roll for a modifier. Returns null or a modifier object.
export function rollModifier(isDaily = false) {
  // Daily always gets one, regular games 30% chance
  if (!isDaily && Math.random() > 0.3) return null;

  const keys = Object.keys(MODIFIERS);
  const pick = keys[Math.floor(Math.random() * keys.length)];
  return MODIFIERS[pick];
}

// Get patient prompt additions for patient-behaviour modifiers
export function getModifierPatientPrompt(modifier) {
  if (!modifier) return '';

  switch (modifier.id) {
    case 'language_barrier':
      return `
## MODIFIER: LANGUAGE BARRIER
The patient has limited English. You must:
- Use very short, simple sentences (3-6 words)
- Sometimes misunderstand the question and answer something slightly different
- Occasionally use the wrong word or say "I don't know how to say"
- You can still communicate key symptoms but it takes more effort from the player
- If the player speaks slowly or rephrases, you understand better`;

    case 'anxious_patient':
      return `
## MODIFIER: ANXIOUS PATIENT
You are extremely anxious and fixated on one particular symptom. You must:
- Keep bringing the conversation back to the symptom you're most worried about
- Answer other questions briefly but then add "but what about my [symptom]?"
- Be harder to redirect — the player needs patience to explore other areas
- If the player acknowledges your concern first, you become more cooperative`;

    case 'relative_present':
      return `
## MODIFIER: RELATIVE ANSWERING
A family member (daughter/partner/son) is answering questions because the patient is too unwell/confused to speak clearly. You must:
- Speak as the relative, not the patient ("she was complaining about...", "he told me...")
- You only know what the patient told you or what you observed — you may not know everything
- Occasionally say "I'm not sure, you'd have to ask them" for things only the patient would know
- You can provide social context the patient might not mention (how they've been at home, changes you've noticed)`;

    default:
      return '';
  }
}

export default MODIFIERS;
