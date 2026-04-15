import { Router } from 'express';
import crypto from 'crypto';
import demoCases from '../data/demo-cases.js';
import conditions, { getAllConditions, getCondition, getGuidelineText } from '../data/conditions.js';
import { generateCase } from '../agents/gamemaster.js';
import { rollModifier } from '../data/modifiers.js';

const router = Router();

// In-memory session store: sessionId -> { fullCase, conversationHistory }
export const sessions = new Map();

// Strip hidden fields and spoilers from case data for client
function filterCaseForClient(fullCase) {
  const { hidden, patient_agent_context, ...visible } = fullCase;
  // Remove guideline reference from meta (would reveal the condition)
  if (visible.meta) {
    const { guideline_reference, ...safeMeta } = visible.meta;
    visible.meta = safeMeta;
  }
  return visible;
}

// GET /api/conditions — list available conditions
router.get('/conditions', (req, res) => {
  res.json({ conditions: getAllConditions() });
});

// POST /api/case/start — start a new game session
router.post('/start', async (req, res) => {
  const { conditionId, mode, gameMode } = req.body || {};
  const sessionId = crypto.randomUUID();
  const isEasyMode = gameMode === 'easy';
  let fullCase;

  console.log('Start case request:', { mode, conditionId, gameMode });

  if (mode === 'live') {
    // Live generation via Game Master agent
    try {
      // Pick condition — daily challenge uses date-seeded selection
      let condition;
      if (conditionId) {
        condition = getCondition(conditionId);
      } else if (req.body.daily) {
        // Same condition for everyone on the same day
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
          hash = ((hash << 5) - hash) + today.charCodeAt(i);
          hash |= 0;
        }
        condition = conditions[Math.abs(hash) % conditions.length];
      } else {
        condition = conditions[Math.floor(Math.random() * conditions.length)];
      }
      console.log('Generating case for:', condition.name);
      const guidelineText = getGuidelineText(condition.id);
      const difficulty = req.body.difficulty || {
        presentation_clarity: 'moderate',
        red_herrings: 1,
        information_availability: 'mostly_complete',
        cognitive_bias_traps: 1
      };
      // 10% chance the previous doctor got it right (red herring)
      const doctorCorrect = Math.random() < 0.1;
      fullCase = await generateCase(difficulty, guidelineText, condition, doctorCorrect, isEasyMode);
    } catch (err) {
      console.error('Case generation failed:', err);
      return res.status(500).json({ error: 'Case generation failed. Try demo mode.' });
    }
  } else {
    // Demo mode: use hardcoded case
    fullCase = demoCases[0];
  }

  // Roll for a modifier
  const modifier = rollModifier(req.body.daily || false);

  sessions.set(sessionId, {
    fullCase,
    conversationHistory: [],
    investigationsOrdered: [],
    verdictSubmitted: false,
    easyMode: isEasyMode,
    modifier
  });

  const clientCase = filterCaseForClient(fullCase);
  if (modifier) clientCase.modifier = { id: modifier.id, label: modifier.label, description: modifier.description };

  res.json({
    sessionId,
    caseData: clientCase
  });
});

// GET /api/case/:sessionId — get filtered case data
router.get('/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  res.json({ caseData: filterCaseForClient(session.fullCase) });
});

// POST /api/case/:sessionId/investigate — order an investigation
router.post('/:sessionId/investigate', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { investigation } = req.body;
  const orderable = session.fullCase.investigations.orderable[investigation];

  if (!orderable) {
    return res.status(400).json({ error: 'Investigation not available' });
  }

  session.investigationsOrdered.push(investigation);

  res.json({
    investigation,
    label: orderable.label,
    result: orderable.result,
    delay_ms: orderable.delay_ms
  });
});

// GET /api/case/:sessionId/choices — get multiple choice options (easy mode only, no spoilers)
router.get('/:sessionId/choices', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const mc = session.fullCase.hidden?.multiple_choice;
  if (!mc) {
    return res.json({ choices: null });
  }

  // Return options without revealing which is correct
  res.json({
    choices: {
      question: mc.question,
      options: mc.options.map(o => ({ id: o.id, text: o.text }))
    }
  });
});

// POST /api/case/:sessionId/verdict — submit player's verdict and get reveal
router.post('/:sessionId/verdict', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { diagnosis, missed, confidence, selectedOptionId } = req.body;
  session.verdictSubmitted = true;

  // For easy mode: check if selected answer was correct
  let selectedCorrect = null;
  let correctOptionId = null;
  const mc = session.fullCase.hidden?.multiple_choice;
  if (mc && mc.options) {
    const correctOpt = mc.options.find(o => o.correct);
    if (correctOpt) correctOptionId = correctOpt.id;
    if (selectedOptionId) {
      const picked = mc.options.find(o => o.id === selectedOptionId);
      selectedCorrect = picked ? picked.correct : false;
    }
  }

  res.json({
    playerVerdict: { diagnosis, missed, confidence },
    reveal: session.fullCase.hidden,
    guideline_reference: session.fullCase.meta?.guideline_reference || '',
    withheld_info: session.fullCase.patient_agent_context?.withheld_info || [],
    selectedCorrect,
    correctOptionId
  });
});

export default router;
