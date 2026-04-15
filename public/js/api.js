const API_BASE = '/api';

let glossaryCache = null;

export async function getGlossary() {
  if (glossaryCache) return glossaryCache;
  const res = await fetch(`${API_BASE}/glossary`);
  glossaryCache = await res.json();
  return glossaryCache;
}

export async function getConditions() {
  const res = await fetch(`${API_BASE}/case/conditions`);
  return res.json();
}

export async function startCase(options = {}) {
  const res = await fetch(`${API_BASE}/case/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start case');
  }
  return res.json();
}

export async function orderInvestigation(sessionId, investigation) {
  const res = await fetch(`${API_BASE}/case/${sessionId}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ investigation })
  });
  return res.json();
}

export async function submitVerdict(sessionId, verdict) {
  const res = await fetch(`${API_BASE}/case/${sessionId}/verdict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verdict)
  });
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  return res.json();
}

export async function submitToLeaderboard({ name, score, condition, difficulty, daily, correct, bias }) {
  const res = await fetch(`${API_BASE}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score, condition, difficulty, daily, correct, bias })
  });
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}

export async function streamChat(sessionId, message, onChunk, onDone) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') {
        onDone?.();
        return;
      }
      try {
        const parsed = JSON.parse(data);
        if (parsed.text) onChunk(parsed.text);
        if (parsed.error) console.error('Chat error:', parsed.error);
      } catch (e) {
        // skip unparseable lines
      }
    }
  }
  onDone?.();
}
