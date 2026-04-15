// Retro digital clock timer — tracks time spent on the case

let startTime = null;
let timerEl = null;
let intervalId = null;

export function startTimer() {
  startTime = Date.now();
}

export function getElapsedMs() {
  if (!startTime) return 0;
  return Date.now() - startTime;
}

export function getElapsedFormatted() {
  const ms = getElapsedMs();
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  return getElapsedMs();
}

export function resetTimer() {
  stopTimer();
  startTime = null;
}

/**
 * Creates a floating timer element and starts updating it.
 * Returns the DOM element to append wherever needed.
 */
export function createTimerDisplay() {
  timerEl = document.createElement('div');
  timerEl.className = 'game-timer';
  timerEl.textContent = '00:00';

  if (!startTime) startTimer();

  intervalId = setInterval(() => {
    if (timerEl) timerEl.textContent = getElapsedFormatted();
  }, 1000);

  return timerEl;
}
