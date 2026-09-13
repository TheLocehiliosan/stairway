import { COMBO_GRID } from '../data/combos.js';
import { ROLES } from '../data/roles.js';
import { RACES } from '../data/races.js';
import { WIKI_LINKS } from '../data/wiki-links.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const ALIGN_LETTERS = { Law: 'L', Neu: 'N', Cha: 'C' };

export function renderSummaryCard(label, { completed, total, pct }) {
  return `
    <article class="summary-card card">
      <h3>${escapeHtml(label)}</h3>
      <div class="progress-meta">
        <span>${completed}/${total}</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${total}" aria-label="${escapeHtml(label)} progress">
        <div class="progress-fill" style="width: ${pct}%"></div>
      </div>
    </article>
  `;
}

function renderChip(item, wikiUrl, label) {
  const state = item.completed ? 'done' : 'missing';
  const mark = item.completed ? '✓' : '○';
  const title = label !== item.name ? ` title="${escapeHtml(item.name)}"` : '';

  if (wikiUrl) {
    return `<a class="chip ${state}" href="${escapeHtml(wikiUrl)}" target="_blank" rel="noopener noreferrer"${title}>${mark} ${escapeHtml(label)}</a>`;
  }

  return `<span class="chip ${state}"${title}>${mark} ${escapeHtml(label)}</span>`;
}

export function renderChipRow(title, items, wikiMap, labelKey = 'name') {
  const chips = items
    .map((item) => renderChip(item, wikiMap?.[item.id], item[labelKey] ?? item.name))
    .join('');

  return `
    <section class="chip-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="chip-row">${chips}</div>
    </section>
  `;
}

export function renderConductChips(conducts) {
  const chips = conducts
    .map((conduct) => renderChip(conduct, conduct.wikiUrl, conduct.name))
    .join('');

  return `
    <section class="chip-section">
      <h3>Conducts</h3>
      <div class="chip-row">${chips}</div>
    </section>
  `;
}

export function renderComboGrid(combos) {
  const completedSet = new Set(
    combos.filter((combo) => combo.completed).map((combo) => combo.key),
  );

  const header = ROLES.map(
    (role) =>
      `<th><a href="${escapeHtml(WIKI_LINKS.roles[role.id])}" target="_blank" rel="noopener noreferrer">${escapeHtml(role.id)}</a></th>`,
  ).join('');

  const body = RACES.map((race) => {
    const cells = ROLES.map((role) => {
      const alignments = COMBO_GRID[role.id]?.[race.id];
      if (!alignments) {
        return '<td class="combo-cell invalid"></td>';
      }

      const marks = alignments
        .map((align) => {
          const key = `${role.id}-${race.id}-${align}`;
          const done = completedSet.has(key);
          return `<span class="align-mark ${done ? 'done' : 'missing'}" title="${escapeHtml(`${role.id}-${race.id}-${align}`)}">${ALIGN_LETTERS[align]}</span>`;
        })
        .join('');

      return `<td class="combo-cell">${marks}</td>`;
    }).join('');

    return `
      <tr>
        <th scope="row">
          <a href="${escapeHtml(WIKI_LINKS.races[race.id])}" target="_blank" rel="noopener noreferrer">${escapeHtml(race.id)}</a>
        </th>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <section class="combo-grid-section">
      <div class="combo-grid-header">
        <h3>Role / race / alignment combos</h3>
        <div class="combo-legend">
          <p class="combo-legend-status">
            <span class="align-mark done align-mark--legend">Ascended</span>
            <span class="align-mark missing align-mark--legend">Missing</span>
          </p>
          <p class="combo-legend-alignments">
            <span class="combo-legend-pair"><span class="align-mark missing">L</span> Lawful</span>
            <span class="combo-legend-pair"><span class="align-mark missing">N</span> Neutral</span>
            <span class="combo-legend-pair"><span class="align-mark missing">C</span> Chaotic</span>
          </p>
        </div>
      </div>
      <div class="combo-grid-wrap">
        <table class="combo-grid">
          <thead>
            <tr>
              <th></th>
              ${header}
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderGoalCard(goal) {
  if (!goal) {
    return `
      <section class="goal-card card" id="goal-card">
        <div class="goal-header">
          <div class="goal-content">
            <h2>Next game goal</h2>
            <p class="goal-placeholder">Get a random suggestion for your next ascension.</p>
          </div>
          <button type="button" class="btn-primary btn-compact" id="suggest-goal-btn">Suggest goal</button>
        </div>
      </section>
    `;
  }

  const detail = goal.detail
    ? `<p class="goal-detail">${escapeHtml(goal.detail)}</p>`
    : '';

  return `
    <section class="goal-card card" id="goal-card">
      <div class="goal-header">
        <div class="goal-content">
          <h2>Next game goal</h2>
          <p class="goal-label">${escapeHtml(goal.label)}</p>
          ${detail}
          <p class="goal-wiki">
            <a href="${escapeHtml(goal.wikiUrl)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(goal.wikiLabel)} on NetHack Wiki ↗
            </a>
          </p>
        </div>
        <button type="button" class="btn-primary btn-compact" id="suggest-goal-btn" title="Suggest another goal">↻</button>
      </div>
    </section>
  `;
}

export function renderLoading() {
  return `
    <div class="loading-state card" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading scoreboard data…</p>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="status-banner error" role="alert">
      <strong>Could not load player data</strong>
      <p>${escapeHtml(message)}</p>
      <p class="error-hint">NetHack usernames are case-sensitive. Check the spelling and try again.</p>
    </div>
  `;
}
