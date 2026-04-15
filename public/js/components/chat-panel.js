import { streamChat } from '../api.js';
import { getSpriteFilename } from '../components/patient-sprite.js';
import state from '../state.js';

const CATEGORIES = {
  symptoms: {
    label: 'Symptoms',
    questions: [
      'When exactly did this start?',
      'Has it changed since you arrived?',
      'Is there anything that makes it better or worse?'
    ]
  },
  history: {
    label: 'History',
    questions: [
      'Has anything like this happened before?',
      'Have you been in hospital recently?',
      'Any conditions you haven\'t mentioned?'
    ]
  },
  medications: {
    label: 'Medications',
    questions: [
      'Are you taking everything as prescribed?',
      'Any new medications recently?',
      'Have you taken anything yourself before coming in?'
    ]
  },
  social: {
    label: 'Social',
    questions: [
      'Do you live alone?',
      'Have you travelled recently?',
      'Does anyone at home have similar symptoms?'
    ]
  }
};

export function renderChatPanel() {
  const container = document.createElement('div');
  container.className = 'chat-container';

  // Demo mode — no API available for chat
  if (state.isDemo) {
    const notice = document.createElement('div');
    notice.className = 'text-dim text-center';
    notice.style.cssText = 'padding: 40px 20px; font-size: 18px; line-height: 1.6;';
    notice.innerHTML = 'Patient chat is not available in demo mode.<br><span style="font-size: 15px;">Use the Notes, Observations, and Investigations tabs to review the case.</span>';
    container.appendChild(notice);
    return container;
  }

  const spriteUrl = `/assets/sprites/${getSpriteFilename(state.caseData.patient)}`;
  const difficulty = state.caseData?.meta?.difficulty?.presentation_clarity || 'moderate';

  const messages = document.createElement('div');
  messages.className = 'chat-messages';
  container.appendChild(messages);

  // Re-render existing conversation history
  for (const msg of state.conversationHistory) {
    appendMessage(messages, msg.role === 'user' ? 'You' : 'Patient', msg.content, msg.role === 'user' ? 'user' : 'assistant', spriteUrl);
  }

  // Category buttons (FY1 and SHO only — Registrar gets free text only)
  const showCategories = difficulty !== 'atypical';
  const showSuggestions = difficulty === 'classic'; // FY1 only

  let suggestionsArea = null;

  if (showCategories) {
    const categoryRow = document.createElement('div');
    categoryRow.className = 'chat-categories';

    for (const [key, cat] of Object.entries(CATEGORIES)) {
      const btn = document.createElement('button');
      btn.className = 'btn chat-category-btn';
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        // Toggle suggestions for FY1
        if (showSuggestions && suggestionsArea) {
          renderSuggestions(suggestionsArea, cat.questions, input, sendMessage);
        } else {
          // For SHO, just set focus to input with a hint
          input.placeholder = `Ask about their ${cat.label.toLowerCase()}...`;
          input.focus();
        }
      });
      categoryRow.appendChild(btn);
    }

    container.appendChild(categoryRow);

    if (showSuggestions) {
      suggestionsArea = document.createElement('div');
      suggestionsArea.className = 'chat-suggestions';
      container.appendChild(suggestionsArea);
    }
  }

  const inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';

  const input = document.createElement('input');
  input.className = 'input';
  input.placeholder = difficulty === 'atypical'
    ? 'Ask the patient anything...'
    : 'Ask the patient a question...';
  input.type = 'text';

  const sendBtn = document.createElement('button');
  sendBtn.className = 'btn';
  sendBtn.textContent = 'Ask';

  let streaming = false;

  async function sendMessage(textOverride) {
    const text = (textOverride || input.value).trim();
    if (!text || streaming) return;

    input.value = '';
    if (suggestionsArea) suggestionsArea.innerHTML = '';
    streaming = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    // Add user message
    appendMessage(messages, 'You', text, 'user', spriteUrl);
    state.conversationHistory.push({ role: 'user', content: text });

    // Create assistant message placeholder
    const assistantMsg = appendMessage(messages, 'Patient', '', 'assistant', spriteUrl);
    const contentEl = assistantMsg.querySelector('.chat-content');
    let fullResponse = '';

    try {
      await streamChat(
        state.sessionId,
        text,
        (chunk) => {
          fullResponse += chunk;
          contentEl.textContent = fullResponse;
          messages.scrollTop = messages.scrollHeight;
        },
        () => {
          state.conversationHistory.push({ role: 'assistant', content: fullResponse });
          streaming = false;
          sendBtn.disabled = false;
          sendBtn.textContent = 'Ask';
        }
      );
    } catch (err) {
      console.error('Chat stream error:', err);
      contentEl.textContent = '[Error: could not reach patient — check console]';
      streaming = false;
      sendBtn.disabled = false;
      sendBtn.textContent = 'Ask';
    }
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);
  container.appendChild(inputRow);

  // Auto-focus input
  setTimeout(() => input.focus(), 100);

  return container;
}

function renderSuggestions(container, questions, input, sendFn) {
  container.innerHTML = '';
  for (const q of questions) {
    const btn = document.createElement('button');
    btn.className = 'btn chat-suggestion-btn';
    btn.textContent = q;
    btn.addEventListener('click', () => {
      sendFn(q);
    });
    container.appendChild(btn);
  }
}

function appendMessage(container, sender, text, type, spriteUrl) {
  const row = document.createElement('div');
  row.className = `chat-message-row ${type}`;

  // Show patient avatar for assistant messages
  if (type === 'assistant' && spriteUrl) {
    const avatar = document.createElement('img');
    avatar.src = spriteUrl;
    avatar.className = 'chat-avatar';
    avatar.alt = sender;
    avatar.onerror = () => { avatar.style.display = 'none'; };
    row.appendChild(avatar);
  }

  const msg = document.createElement('div');
  msg.className = `chat-message ${type}`;
  msg.innerHTML = `
    <div class="sender">${sender}</div>
    <div class="chat-content">${text}</div>
  `;
  row.appendChild(msg);

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return msg;
}
