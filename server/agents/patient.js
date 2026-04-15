import OpenAI from 'openai';
import { buildPatientSystemPrompt } from '../prompts/patient-system.js';
import { getModifierPatientPrompt } from '../data/modifiers.js';

const openai = new OpenAI();

export async function streamPatientResponse(session, userMessage) {
  const { fullCase, conversationHistory, easyMode, modifier } = session;
  let systemPrompt = buildPatientSystemPrompt(
    fullCase.patient_agent_context,
    fullCase.patient,
    easyMode,
    fullCase.meta?.difficulty
  );

  // Inject modifier behaviour into patient prompt
  const modifierPrompt = getModifierPatientPrompt(modifier);
  if (modifierPrompt) systemPrompt += modifierPrompt;

  // Add user message to history
  conversationHistory.push({ role: 'user', content: userMessage });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ]
  });

  return stream;
}

export function finalizePatientResponse(session, fullResponse) {
  session.conversationHistory.push({ role: 'assistant', content: fullResponse });
}
