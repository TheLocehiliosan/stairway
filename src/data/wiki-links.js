import { ROLES } from './roles.js';
import { RACES } from './races.js';

const WIKI_BASE = 'https://nethackwiki.com/wiki';

export const WIKI_LINKS = {
  conduct: `${WIKI_BASE}/Conduct`,
  alignment: `${WIKI_BASE}/Alignment`,
  role: `${WIKI_BASE}/Role`,
  roles: Object.fromEntries(
    ROLES.map((role) => [role.id, `${WIKI_BASE}/${role.name}`]),
  ),
  races: Object.fromEntries(
    RACES.map((race) => [
      race.id,
      `${WIKI_BASE}/${race.name}_(starting_race)`,
    ]),
  ),
  alignments: {
    Law: `${WIKI_BASE}/Alignment#Lawful`,
    Neu: `${WIKI_BASE}/Alignment#Neutral`,
    Cha: `${WIKI_BASE}/Alignment#Chaotic`,
  },
};
