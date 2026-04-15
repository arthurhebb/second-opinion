// Player identity — stored in localStorage

const PLAYER_KEY = 'second-opinion-player';

export function getPlayerName() {
  return localStorage.getItem(PLAYER_KEY) || null;
}

export function setPlayerName(name) {
  localStorage.setItem(PLAYER_KEY, name.slice(0, 20));
}

export function hasPlayerName() {
  return !!localStorage.getItem(PLAYER_KEY);
}
