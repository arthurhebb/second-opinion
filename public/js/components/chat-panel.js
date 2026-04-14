import { streamChat } from '../api.js';
import { getSpriteFilename } from '../components/patient-sprite.js';
import state from '../state.js';

export function renderChatPanel() {
  const container = document.createElement('div');
  container.className = 'chat-container';

  const spriteUrl = `/assets/sprites/${getSpriteFilename(state.caseData.patient)}`;

  const messages = document.createElement('div');
  messages.className = 'chat-messages';
  container.appendChild(messages);

  // Re-render existing conversation history
  for (const msg of state.conversationHistory) {
    appendMessage(messages, msg.role === 'user' ? 'You' : 'Patient', msg.content, msg.role === 'user' ? 'user' : 'assistant', spriteUrl);
  }

  const inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';

  const input = document.createElement('input');
  input.className = 'input';
  input.placeholder = 'Ask the patient a question...';
  input.type = 'text';

  const sendBtn = document.createElement('button');
  sendBtn.className = 'btn';
  sendBtn.textContent = 'Ask';

  let streaming = false;

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || streaming) return;

    input.value = '';
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

  sendBtn.addEventListener('click', sendMessage);
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
