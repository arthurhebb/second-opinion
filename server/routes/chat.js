import { Router } from 'express';
import { sessions } from './case.js';
import { streamPatientResponse, finalizePatientResponse } from '../agents/patient.js';

const router = Router();

// POST /api/chat — stream patient response via SSE
router.post('/', async (req, res) => {
  const { sessionId, message } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await streamPatientResponse(session, message);
    let fullResponse = '';

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    finalizePatientResponse(session, fullResponse);
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response' })}\n\n`);
    res.end();
  }
});

export default router;
