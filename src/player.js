const STORAGE_KEY = 'stairway-player';
const DEFAULT_PLAYER = 'TheLocehiliosan';

export function scoreboardUrl(username) {
  const letter = username.charAt(0);
  return `https://nethackscoreboard.org/players/${letter}/${username}.nh.html`;
}

export function getPlayerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const player = params.get('player');
  return player?.trim() || null;
}

export function getStoredPlayer() {
  return localStorage.getItem(STORAGE_KEY);
}

export function storePlayer(username) {
  localStorage.setItem(STORAGE_KEY, username);
}

export function resolvePlayer() {
  return getPlayerFromUrl() || getStoredPlayer() || DEFAULT_PLAYER;
}

export function setPlayer(username) {
  const trimmed = username.trim();
  if (!trimmed) return;

  storePlayer(trimmed);
  const url = new URL(window.location.href);
  url.searchParams.set('player', trimmed);
  window.history.replaceState({}, '', url);
}
