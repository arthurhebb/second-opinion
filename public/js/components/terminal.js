import { sfxTypewriter } from '../audio.js';

export function typewriterEffect(element, text, speed = 25) {
  return new Promise((resolve) => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        // Play click sound every few characters (not every one — too noisy)
        if (i % 3 === 0) sfxTypewriter();
        i++;
        setTimeout(type, speed);
      } else {
        cursor.remove();
        resolve();
      }
    }
    type();
  });
}

export function createTerminalLine(text, className = '') {
  const line = document.createElement('div');
  line.className = className;
  line.textContent = text;
  return line;
}
