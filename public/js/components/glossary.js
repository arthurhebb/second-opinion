import { getGlossary } from '../api.js';

let glossary = null;
let termPattern = null;

// Load glossary and build regex
async function ensureGlossary() {
  if (glossary) return;
  glossary = await getGlossary();
  // Sort terms by length (longest first) so "Acute Coronary Syndrome" matches before "acute"
  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  // Escape special regex chars and build alternation
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  termPattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

// Pre-load on import
ensureGlossary();

/**
 * Takes a text string and returns a DocumentFragment with glossary terms
 * wrapped in tappable <span> elements.
 */
export function highlightTerms(text) {
  const frag = document.createDocumentFragment();

  if (!glossary || !termPattern) {
    frag.appendChild(document.createTextNode(text));
    return frag;
  }

  // Reset regex state
  termPattern.lastIndex = 0;
  let lastIndex = 0;
  let match;

  while ((match = termPattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    // Find the glossary definition (case-insensitive lookup)
    const matchedText = match[0];
    const key = Object.keys(glossary).find(k => k.toLowerCase() === matchedText.toLowerCase());
    const definition = key ? glossary[key] : null;

    if (definition) {
      const span = document.createElement('span');
      span.className = 'glossary-term';
      span.textContent = matchedText;
      span.dataset.definition = definition;
      span.addEventListener('click', showDefinition);
      frag.appendChild(span);
    } else {
      frag.appendChild(document.createTextNode(matchedText));
    }

    lastIndex = termPattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return frag;
}

/**
 * Takes an HTML string, creates a temporary element, walks text nodes,
 * and highlights glossary terms. Returns the processed HTML string.
 */
export function highlightHTML(html) {
  if (!glossary || !termPattern) return html;

  const temp = document.createElement('div');
  temp.innerHTML = html;
  processTextNodes(temp);
  return temp.innerHTML;
}

function processTextNodes(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    termPattern.lastIndex = 0;
    if (!termPattern.test(text)) return;

    // Has matches — replace with highlighted fragment
    const frag = highlightTerms(text);
    node.parentNode.replaceChild(frag, node);
    return;
  }

  // Skip elements that shouldn't be processed
  if (node.classList?.contains('glossary-term') || node.classList?.contains('glossary-popup')) return;

  // Process child nodes (iterate backwards since we're modifying the DOM)
  const children = Array.from(node.childNodes);
  for (const child of children) {
    processTextNodes(child);
  }
}

// Popup management
let activePopup = null;

function showDefinition(e) {
  e.stopPropagation();
  dismissPopup();

  const term = e.target;
  const definition = term.dataset.definition;

  const popup = document.createElement('div');
  popup.className = 'glossary-popup';
  popup.textContent = definition;

  // Position near the term
  document.body.appendChild(popup);

  const termRect = term.getBoundingClientRect();
  const popupRect = popup.getBoundingClientRect();

  let top = termRect.bottom + 6;
  let left = termRect.left;

  // Keep within viewport
  if (top + popupRect.height > window.innerHeight) {
    top = termRect.top - popupRect.height - 6;
  }
  if (left + popupRect.width > window.innerWidth - 12) {
    left = window.innerWidth - popupRect.width - 12;
  }
  if (left < 12) left = 12;

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;

  activePopup = popup;

  // Dismiss on click elsewhere
  setTimeout(() => {
    document.addEventListener('click', dismissPopup, { once: true });
  }, 10);
}

function dismissPopup() {
  if (activePopup) {
    activePopup.remove();
    activePopup = null;
  }
}
