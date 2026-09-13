import { WIKI_LINKS } from '../data/wiki-links.js';

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function roleGoal(role) {
  return {
    type: 'role',
    label: `Ascend as ${role.name}`,
    wikiUrl: WIKI_LINKS.roles[role.id],
    wikiLabel: role.name,
  };
}

function alignmentGoal(alignment) {
  return {
    type: 'alignment',
    label: `Ascend ${alignment.name}`,
    wikiUrl: WIKI_LINKS.alignments[alignment.id],
    wikiLabel: 'Alignment',
  };
}

function raceGoal(race) {
  return {
    type: 'race',
    label: `Ascend as ${race.name}`,
    wikiUrl: WIKI_LINKS.races[race.id],
    wikiLabel: race.name,
  };
}

function comboGoal(combo, roles, races, alignments) {
  const role = roles.find((item) => item.id === combo.role);
  const race = races.find((item) => item.id === combo.race);
  const align = alignments.find((item) => item.id === combo.align);
  return {
    type: 'combo',
    label: `Ascend ${combo.role}-${combo.race}-${combo.align}`,
    detail: `${role?.name ?? combo.role} / ${race?.name ?? combo.race} / ${align?.name ?? combo.align}`,
    wikiUrl: WIKI_LINKS.roles[combo.role],
    wikiLabel: role?.name ?? combo.role,
  };
}

function conductGoal(conduct) {
  return {
    type: 'conduct',
    label: `Ascend with ${conduct.name} conduct`,
    wikiUrl: conduct.wikiUrl,
    wikiLabel: 'Conduct',
  };
}

export function suggestNextGoal(progress) {
  const missingRoles = progress.roles.filter((role) => !role.completed);
  if (missingRoles.length > 0) {
    return roleGoal(pickRandom(missingRoles));
  }

  const pool = [];

  for (const alignment of progress.alignments.filter((item) => !item.completed)) {
    pool.push(() => alignmentGoal(alignment));
  }
  for (const race of progress.races.filter((item) => !item.completed)) {
    pool.push(() => raceGoal(race));
  }
  for (const combo of progress.combos.filter((item) => !item.completed)) {
    pool.push(() => comboGoal(combo, progress.roles, progress.races, progress.alignments));
  }
  for (const conduct of progress.conducts.filter((item) => !item.completed)) {
    pool.push(() => conductGoal(conduct));
  }

  if (pool.length === 0) {
    return {
      type: 'complete',
      label: 'All tracked goals complete!',
      detail: 'You have ascended every role, alignment, race, combo, and conduct.',
      wikiUrl: WIKI_LINKS.role,
      wikiLabel: 'Roles',
    };
  }

  return pickRandom(pool)();
}
