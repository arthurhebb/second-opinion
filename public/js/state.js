const state = {
  sessionId: null,
  caseData: null,
  conversationHistory: [],
  confidenceRatings: [],
  investigationsOrdered: [],
  investigationResults: {},  // key -> { label, result, imageUrl }
  playerVerdict: null,
  revealData: null,
  guidelineReference: null,
  withheldInfo: [],
  gameMode: 'medical', // 'medical' or 'easy'
  isDaily: false,
  isDemo: false,
  currentScreen: 'title'
};

import { resetTimer } from './components/game-timer.js';

export function resetState() {
  resetTimer();
  state.sessionId = null;
  state.caseData = null;
  state.conversationHistory = [];
  state.confidenceRatings = [];
  state.investigationsOrdered = [];
  state.investigationResults = {};
  state.playerVerdict = null;
  state.revealData = null;
  state.guidelineReference = null;
  state.withheldInfo = [];
  state.gameMode = 'medical';
  state.isDaily = false;
  state.isDemo = false;
  state.currentScreen = 'title';
}

export function addConfidenceRating(label, value) {
  state.confidenceRatings.push({ label, value, time: Date.now() });
}

export default state;
