import OpenAI from 'openai';
import { buildGameMasterSystemPrompt } from '../prompts/gamemaster-system.js';

const openai = new OpenAI();

export async function generateCase(difficulty = {}, guidelineText = '', condition = null, doctorCorrect = false, easyMode = false) {
  const systemPrompt = buildGameMasterSystemPrompt(difficulty, guidelineText, condition, doctorCorrect, easyMode);

  let userMessage;
  if (doctorCorrect) {
    userMessage = condition
      ? `Generate a case about ${condition.name} (${condition.guideline}). IMPORTANT: In this case, the previous doctor's diagnosis and management are CORRECT. The player must recognise that no error was made. The case should still be complex and make the player doubt the doctor, but ultimately the doctor got it right. Return only the JSON, no markdown formatting or explanation.`
      : 'Generate a case where the previous doctor got it right. Return only the JSON, no markdown formatting or explanation.';
  } else {
    userMessage = condition
      ? `Generate a case about ${condition.name} (${condition.guideline}). The previous doctor should make an error related to: ${condition.description}. Use one of these cognitive biases: ${condition.good_biases.join(', ')}. Return only the JSON, no markdown formatting or explanation.`
      : 'Generate a new case. Return only the JSON, no markdown formatting or explanation.';
  }

  if (easyMode) {
    userMessage += '\n\nREMEMBER: This is EASY MODE. All text must be in plain English with no medical jargon. Include the multiple_choice field in the hidden section.';
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  const text = response.choices[0].message.content;

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  return JSON.parse(jsonStr.trim());
}
