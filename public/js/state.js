const state = {
  sessionId: null,
  caseData: null,
  conversationHistory: [],
  confidenceRatings: [],
  investigationsOrdered: [],
  playerVerdict: null,
  revealData: null,
  guidelineReference: null,
  gameMode: 'medical', // 'medical' or 'easy'
  currentScreen: 'title'
};

export function resetState() {
  state.sessionId = null;
  state.caseData = null;
  state.conversationHistory = [];
  state.confidenceRatings = [];
  state.investigationsOrdered = [];
  state.playerVerdict = null;
  state.revealData = null;
  state.guidelineReference = null;
  state.gameMode = 'medical';
  state.currentScreen = 'title';
}

export function addConfidenceRating(label, value) {
  state.confidenceRatings.push({ label, value, time: Date.now() });
}

export default state;
