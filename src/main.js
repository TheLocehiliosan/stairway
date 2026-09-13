import './styles.css';
import { resolvePlayer, scoreboardUrl, setPlayer } from './player.js';
import { fetchPlayerPage } from './scoreboard/fetch.js';
import { parsePlayerPage } from './scoreboard/parse.js';
import { buildProgress } from './progress/model.js';
import { suggestNextGoal } from './progress/suggest-goal.js';
import { WIKI_LINKS } from './data/wiki-links.js';
import {
  escapeHtml,
  renderChipRow,
  renderComboGrid,
  renderConductChips,
  renderError,
  renderGoalCard,
  renderLoading,
  renderSummaryCard,
} from './ui/render.js';

let currentProgress = null;
let currentGoal = null;

function renderShell(player) {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <header class="site-header">
      <div class="header-top">
        <h1 class="site-title">Stairway to Ascension</h1>
        <form class="player-form" id="player-form">
          <label class="sr-only" for="player-input">NetHack username</label>
          <input
            id="player-input"
            name="player"
            type="text"
            value="${escapeHtml(player)}"
            placeholder="NetHack username"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit">Look up</button>
        </form>
      </div>
      <div class="player-bar">
        <p class="player-name">
          Player: <strong id="current-player">${escapeHtml(player)}</strong>
        </p>
        <a
          class="scoreboard-link"
          id="scoreboard-link"
          href="${escapeHtml(scoreboardUrl(player))}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on NetHack Scoreboard ↗
        </a>
      </div>
    </header>

    <main class="main-content" id="main-content">
      ${renderLoading()}
    </main>

    <footer class="site-footer">
      <p>
        Data from
        <a href="https://nethackscoreboard.org/" target="_blank" rel="noopener noreferrer"
          >nethackscoreboard.org</a
        >. Usernames are case-sensitive.
      </p>
      <p>
        Created by
        <a href="https://github.com/TheLocehiliosan" target="_blank" rel="noopener noreferrer"
          >Tim Byrne</a
        >.
      </p>
    </footer>
  `;

  document.getElementById('player-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('player-input');
    const nextPlayer = input.value.trim();
    if (!nextPlayer) return;
    setPlayer(nextPlayer);
    boot();
  });
}

function wireGoalButton() {
  const button = document.getElementById('suggest-goal-btn');
  if (!button || !currentProgress) return;

  button.addEventListener('click', () => {
    currentGoal = suggestNextGoal(currentProgress);
    const card = document.getElementById('goal-card');
    if (card) {
      card.outerHTML = renderGoalCard(currentGoal);
      wireGoalButton();
    }
  });
}

function renderProgress(progress, source) {
  currentProgress = progress;
  currentGoal = null;

  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section class="hero-stat card" aria-live="polite">
      <p class="hero-label">Ascensions</p>
      <p class="hero-value" id="ascension-count">${progress.ascensions}</p>
    </section>

    <section class="summary-row" id="summary-row" aria-label="Progress summary">
      ${renderSummaryCard('Roles', progress.summary.roles)}
      ${renderSummaryCard('Alignments', progress.summary.alignments)}
      ${renderSummaryCard('Races', progress.summary.races)}
      ${renderSummaryCard('Combos', progress.summary.combos)}
      ${renderSummaryCard('Conducts', progress.summary.conducts)}
    </section>

    ${renderGoalCard(null)}

    <section class="detail-section card">
      <h2>Progress details</h2>
      ${renderChipRow('Roles', progress.roles, WIKI_LINKS.roles, 'id')}
      ${renderChipRow('Alignments', progress.alignments, WIKI_LINKS.alignments, 'id')}
      ${renderChipRow('Races', progress.races, WIKI_LINKS.races, 'id')}
      ${renderConductChips(progress.conducts)}
      ${renderComboGrid(progress.combos)}
    </section>
  `;

  wireGoalButton();
}

async function loadPlayerData(player) {
  const { html, source } = await fetchPlayerPage(player);
  const parsed = parsePlayerPage(html, player);
  const progress = buildProgress(parsed);
  sessionStorage.setItem(
    `stairway-cache:${player}`,
    JSON.stringify({ progress, source, fetchedAt: Date.now() }),
  );
  return { progress, source };
}

async function boot() {
  const player = resolvePlayer();
  setPlayer(player);
  renderShell(player);

  try {
    const { progress } = await loadPlayerData(player);
    renderProgress(progress);
  } catch (error) {
    const main = document.getElementById('main-content');
    main.innerHTML = renderError(error.message);
  }
}

boot();
