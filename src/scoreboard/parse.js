import { CONDUCT_ABBREV_MAP } from '../data/conducts.js';
import { comboKey } from '../data/combos.js';
import { ROLE_IDS } from '../data/roles.js';

function normalizeText(value) {
  return value.replace(/\u2011/g, '-').replace(/\s+/g, ' ').trim();
}

function headingTable(doc, headingText) {
  const heading = [...doc.querySelectorAll('h3')].find(
    (node) => normalizeText(node.textContent) === headingText,
  );
  const table = heading?.nextElementSibling;
  return table?.matches('table') ? table : null;
}

function tableByFirstHeader(doc, headerLabel) {
  for (const table of doc.querySelectorAll('table.bordered')) {
    const firstHeader = table.querySelector('thead th');
    if (firstHeader && normalizeText(firstHeader.textContent) === headerLabel) {
      return table;
    }
  }
  return null;
}

function tableRowCells(table, rowLabel) {
  const row = [...table.querySelectorAll('tr')].find((candidate) => {
    const header = candidate.querySelector('th');
    return header && normalizeText(header.textContent) === rowLabel;
  });
  if (!row) return null;

  const headers = [...table.querySelectorAll('thead th')]
    .slice(1)
    .map((cell) => normalizeText(cell.textContent));
  const cells = [...row.querySelectorAll('td')];

  const map = {};
  headers.forEach((header, index) => {
    map[header] = cells[index] ?? null;
  });
  return map;
}

function numericRowMap(table, rowLabel) {
  const cells = tableRowCells(table, rowLabel);
  if (!cells) return {};

  return Object.fromEntries(
    Object.entries(cells).map(([key, cell]) => [
      key,
      normalizeText(cell.textContent),
    ]),
  );
}

function parseCharacter(character) {
  const parts = character.split('-');
  if (parts.length !== 4) return null;
  const [role, race, , align] = parts;
  return { role, race, align, key: comboKey(role, race, align) };
}

function parseConductTokens(conductsText) {
  if (!conductsText) return [];
  return conductsText
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseRemainingCell(cell) {
  if (!cell) return [];
  const chunks = cell.innerHTML
    .split(/<br\s*\/?>/i)
    .map((part) => normalizeText(part.replace(/<[^>]+>/g, '')))
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      const [race, align] = chunk.split('-');
      if (!race || !align) return null;
      return { race, align };
    })
    .filter(Boolean);
}

export function parsePlayerPage(html, username) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const pageTitle = normalizeText(doc.querySelector('h1')?.textContent ?? '');

  if (!html.includes(username)) {
    throw new Error(
      `Player "${username}" was not found. NetHack usernames are case-sensitive.`,
    );
  }

  const overallTable = headingTable(doc, 'Overall Stats');
  if (!overallTable) {
    throw new Error('Could not parse overall stats from scoreboard page.');
  }

  const overallCells = [...overallTable.querySelectorAll('tbody tr:first-child td')].map(
    (cell) => normalizeText(cell.textContent),
  );
  const ascensions = Number.parseInt(overallCells[1], 10);
  if (Number.isNaN(ascensions)) {
    throw new Error('Could not parse ascension count.');
  }

  const rolesTable = headingTable(doc, 'Roles, races, alignments');
  if (!rolesTable) {
    throw new Error('Could not parse roles table.');
  }

  const roleAscensions = numericRowMap(rolesTable, 'ascensions');
  const remainingCells = tableRowCells(rolesTable, 'Remaining') ?? {};

  const raceTable = tableByFirstHeader(doc, 'races');
  const alignmentTable = tableByFirstHeader(doc, 'alignments');
  const raceAscensions = raceTable ? numericRowMap(raceTable, 'ascensions') : {};
  const alignmentAscensions = alignmentTable
    ? numericRowMap(alignmentTable, 'ascensions')
    : {};

  const ascendedTable = doc.querySelector('#g-u-table-ascended');
  const ascendedGames = [];
  const completedCombos = new Set();
  const completedConductIds = new Set();

  if (ascendedTable) {
    const headerCells = [...ascendedTable.querySelectorAll('thead th')].map((cell) =>
      normalizeText(cell.textContent),
    );
    const characterIndex = headerCells.indexOf('character');
    const conductsIndex = headerCells.indexOf('conducts');

    for (const row of ascendedTable.querySelectorAll('tbody tr')) {
      const cells = [...row.querySelectorAll('td')];
      const character = normalizeText(cells[characterIndex]?.textContent ?? '');
      if (!character) continue;

      const parsedCharacter = parseCharacter(character);
      if (parsedCharacter) {
        completedCombos.add(parsedCharacter.key);
      }

      const conductTokens = parseConductTokens(
        normalizeText(cells[conductsIndex]?.textContent ?? ''),
      );
      for (const token of conductTokens) {
        const conductId = CONDUCT_ABBREV_MAP[token];
        if (conductId) completedConductIds.add(conductId);
      }

      ascendedGames.push({ character, conducts: conductTokens });
    }
  }

  const remainingCombos = [];
  for (const role of ROLE_IDS) {
    for (const part of parseRemainingCell(remainingCells[role])) {
      remainingCombos.push({
        role,
        race: part.race,
        align: part.align,
        key: comboKey(role, part.race, part.align),
        label: `${role}-${part.race}-${part.align}`,
      });
    }
  }

  return {
    username: pageTitle || username,
    ascensions,
    roleAscensions,
    raceAscensions,
    alignmentAscensions,
    completedCombos: [...completedCombos],
    remainingCombos,
    completedConductIds: [...completedConductIds],
    ascendedGames,
  };
}
