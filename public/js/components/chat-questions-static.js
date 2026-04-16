// Static fallback questions — used when Game Master doesn't generate case-specific ones
// To switch back to these, import STATIC_CATEGORIES in chat-panel.js and use instead of dynamic questions

export const STATIC_CATEGORIES = {
  symptoms: {
    label: 'Symptoms',
    questions: [
      'When exactly did this start?',
      'Has it changed since you arrived?',
      'Is there anything that makes it better or worse?',
      'Can you describe exactly what you feel right now?'
    ]
  },
  history: {
    label: 'History',
    questions: [
      'Has anything like this happened before?',
      'Have you been in hospital recently?',
      'Any conditions you haven\'t mentioned?',
      'Any operations or procedures in the past?'
    ]
  },
  medications: {
    label: 'Medications',
    questions: [
      'Are you taking everything as prescribed?',
      'Any new medications recently?',
      'Have you stopped taking anything lately?',
      'Have you taken anything yourself before coming in?'
    ]
  },
  social: {
    label: 'Social',
    questions: [
      'Who do you live with?',
      'Have you travelled recently?',
      'Does anyone at home have similar symptoms?',
      'What do you do for work?'
    ]
  }
};
