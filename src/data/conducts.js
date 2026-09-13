// Conducts trackable via scoreboard ascension "conducts" column abbreviations.
// Abbreviations list intact conducts kept at ascension.
// Pauper and Unrerolled omitted — not reliably reported by the scoreboard.

export const CONDUCTS = [
  {
    id: 'foodless',
    name: 'Foodless',
    abbrev: ['food'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Foodless',
  },
  {
    id: 'vegan',
    name: 'Vegan',
    abbrev: ['vegn'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Vegan',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    abbrev: ['vegt', 'vege'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Vegetarian',
  },
  {
    id: 'atheist',
    name: 'Atheist',
    abbrev: ['athe'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Atheist',
  },
  {
    id: 'pacifist',
    name: 'Pacifist',
    abbrev: ['paci'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Pacifist',
  },
  {
    id: 'weaponless',
    name: 'Weaponless',
    abbrev: ['weap'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Weaponless',
  },
  {
    id: 'illiterate',
    name: 'Illiterate',
    abbrev: ['illi'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Illiterate',
  },
  {
    id: 'polypileless',
    name: 'Never polymorph an object',
    abbrev: ['pile'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Never_polymorph_an_object',
  },
  {
    id: 'polyselfless',
    name: 'Never change form',
    abbrev: ['self'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Never_change_form',
  },
  {
    id: 'genocideless',
    name: 'Genocideless',
    abbrev: ['geno'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Genocideless',
  },
  {
    id: 'wishless',
    name: 'Wishless',
    abbrev: ['wish'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Wishless,_artifact_wishless',
  },
  {
    id: 'artifact-wishless',
    name: 'Artifact wishless',
    abbrev: ['arti'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Wishless,_artifact_wishless',
  },
  {
    id: 'zen',
    name: 'Zen',
    abbrev: ['zen'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Zen',
  },
  {
    id: 'nudist',
    name: 'Nudist',
    abbrev: ['nude'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Nudist',
  },
  {
    id: 'permadeaf',
    name: 'Permadeaf',
    abbrev: ['deaf'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Permadeaf',
  },
  {
    id: 'petless',
    name: 'Petless',
    abbrev: ['pets'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Petless',
  },
  {
    id: 'sokoban',
    name: 'Sokoban',
    abbrev: ['soko'],
    wikiUrl: 'https://nethackwiki.com/wiki/Conduct#Sokoban',
  },
];

export const CONDUCT_ABBREV_MAP = Object.fromEntries(
  CONDUCTS.flatMap((conduct) => conduct.abbrev.map((abbrev) => [abbrev, conduct.id])),
);
