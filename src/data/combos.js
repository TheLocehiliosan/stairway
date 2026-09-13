// Valid role/race/alignment combos from the NetHack Wiki role table.
// https://nethackwiki.com/wiki/Role#Role_table_by_alignment_and_race

export const COMBO_GRID = {
  Arc: { Hum: ['Law', 'Neu'], Dwa: ['Law'], Gno: ['Neu'] },
  Bar: { Hum: ['Neu', 'Cha'], Orc: ['Cha'] },
  Cav: { Hum: ['Law', 'Neu'], Dwa: ['Law'], Gno: ['Neu'] },
  Hea: { Hum: ['Neu'], Gno: ['Neu'] },
  Kni: { Hum: ['Law'] },
  Mon: { Hum: ['Law', 'Neu', 'Cha'] },
  Pri: { Hum: ['Law', 'Neu', 'Cha'], Elf: ['Cha'] },
  Ran: { Hum: ['Neu', 'Cha'], Elf: ['Cha'], Gno: ['Neu'], Orc: ['Cha'] },
  Rog: { Hum: ['Cha'], Orc: ['Cha'] },
  Sam: { Hum: ['Law'] },
  Tou: { Hum: ['Neu'] },
  Val: { Hum: ['Law', 'Neu'], Dwa: ['Law'] },
  Wiz: { Hum: ['Neu', 'Cha'], Elf: ['Cha'], Gno: ['Neu'], Orc: ['Cha'] },
};

export function allValidCombos() {
  const combos = [];
  for (const [role, races] of Object.entries(COMBO_GRID)) {
    for (const [race, alignments] of Object.entries(races)) {
      for (const align of alignments) {
        combos.push({ role, race, align, key: comboKey(role, race, align) });
      }
    }
  }
  return combos;
}

export function comboKey(role, race, align) {
  return `${role}-${race}-${align}`;
}
