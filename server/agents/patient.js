import OpenAI from 'openai';
import { buildPatientSystemPrompt } from '../prompts/patient-system.js';

const openai = new OpenAI();

export async function streamPatientResponse(session, userMessage) {
  const { fullCase, conversationHistory, easyMode } = session;
  const systemPrompt = buildPatientSystemPrompt(
    fullCase.patient_agent_context,
    fullCase.patient,
    easyMode,
    fullCase.meta?.difficulty
  );

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
