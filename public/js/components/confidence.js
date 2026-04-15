import { addConfidenceRating } from '../state.js';

export function renderConfidenceSlider(label, onSubmit) {
  const container = document.createElement('div');
  container.className = 'panel mt-2';

  const question = document.createElement('div');
  question.className = 'mb-1';
  question.textContent = label;
  container.appendChild(question);

  // Warning text
  const warning = document.createElement('div');
  warning.className = 'confidence-warning';
  warning.textContent = 'Choose carefully — confidence counts. Get it right and your conviction is rewarded. Get it wrong, and overconfidence will cost you.';
  container.appendChild(warning);

  const sliderRow = document.createElement('div');
  sliderRow.className = 'slider-container';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = '50';
  slider.className = 'slider';

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value glow';
  valueDisplay.textContent = '50%';

  slider.addEventListener('input', () => {
    valueDisplay.textContent = slider.value + '%';
  });

  sliderRow.appendChild(slider);
  sliderRow.appendChild(valueDisplay);
  container.appendChild(sliderRow);

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary mt-1';
  btn.textContent = 'Confirm';
  btn.addEventListener('click', () => {
    const value = parseInt(slider.value);
    addConfidenceRating(label, value);
    onSubmit?.(value);
  });
  container.appendChild(btn);

  return container;
}
