import { ALIGNMENTS } from '../data/alignments.js';
import { allValidCombos } from '../data/combos.js';
import { CONDUCTS } from '../data/conducts.js';
import { RACES } from '../data/races.js';
import { ROLES } from '../data/roles.js';

function countCompleted(map, ids) {
  return ids.filter((id) => Number.parseInt(map[id] ?? '0', 10) > 0).length;
}

function progress(completed, total) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, pct };
}

export function buildProgress(parsed) {
  const validCombos = allValidCombos();
  const completedComboSet = new Set(parsed.completedCombos);
  const completedConductSet = new Set(parsed.completedConductIds);

  const roles = ROLES.map((role) => ({
    ...role,
    completed: Number.parseInt(parsed.roleAscensions[role.id] ?? '0', 10) > 0,
  }));

  const races = RACES.map((race) => ({
    ...race,
    completed: Number.parseInt(parsed.raceAscensions[race.id] ?? '0', 10) > 0,
  }));

  const alignments = ALIGNMENTS.map((alignment) => ({
    ...alignment,
    completed:
      Number.parseInt(parsed.alignmentAscensions[alignment.id] ?? '0', 10) > 0,
  }));

  const combos = validCombos.map((combo) => ({
    ...combo,
    completed: completedComboSet.has(combo.key),
  }));

  const conducts = CONDUCTS.map((conduct) => ({
    ...conduct,
    completed: completedConductSet.has(conduct.id),
  }));

  return {
    username: parsed.username,
    ascensions: parsed.ascensions,
    roles,
    races,
    alignments,
    combos,
    conducts,
    remainingCombos: parsed.remainingCombos,
    summary: {
      roles: progress(countCompleted(parsed.roleAscensions, ROLES.map((r) => r.id)), ROLES.length),
      races: progress(countCompleted(parsed.raceAscensions, RACES.map((r) => r.id)), RACES.length),
      alignments: progress(
        countCompleted(parsed.alignmentAscensions, ALIGNMENTS.map((a) => a.id)),
        ALIGNMENTS.length,
      ),
      combos: progress(
        combos.filter((combo) => combo.completed).length,
        combos.length,
      ),
      conducts: progress(
        conducts.filter((conduct) => conduct.completed).length,
        conducts.length,
      ),
    },
  };
}
