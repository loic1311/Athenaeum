export const MATERIAL_TYPES = {
  source: 'Primaire bron', study: 'Wetenschappelijke literatuur', note: 'Eigen tekst of notities',
};
export const COMPARISON_RELATIONS = {
  open: 'Te beoordelen', supports: 'Ondersteunt', nuance: 'Nuanceert',
  disputes: 'Spreekt tegen', context: 'Biedt context',
};
export const MAX_EXCERPT = 18_000;
export const MAX_COMPARISON_ROWS = 24;

export function addResearchMaterial(dossier, material, id) {
  const { kind, file, location, origin } = material;
  if (!Object.hasOwn(MATERIAL_TYPES, kind)) throw new Error('Kies welk soort materiaal je invoegt.');
  const key = { source: 'sources', study: 'studies', note: 'notes' }[kind];
  const items = dossier[key] ?? [];
  const existing = origin && items.find(row => row.origin === origin);
  const aiNote = material.analysisNote ? { analysisNote: material.analysisNote, analysisPage: material.analysisPage } : {};
  if (existing) {
    if (!aiNote.analysisNote || (existing.analysisNote === aiNote.analysisNote && existing.analysisPage === aiNote.analysisPage)) {
      return { dossier, entry: existing, existed: true };
    }
    const entry = { ...existing, ...aiNote };
    return { dossier: { ...dossier, [key]: items.map(row => row.id === entry.id ? entry : row) }, entry, existed: false };
  }
  const limit = kind === 'source' ? 60 : 100;
  if (items.length >= limit) throw new Error(`Dit dossier heeft al ${limit} fiches van dit type.`);

  const text = String(material.text ?? '').trim();
  if (text.length > MAX_EXCERPT) throw new Error('Kies een kleiner paginabereik of gebruik een korter fragment (maximaal 18.000 tekens).');
  const title = String(material.title ?? '').trim() || file;
  if (!title) throw new Error('Vul een titel in voor dit materiaal.');
  if (kind === 'note' && !text) throw new Error('Plak je tekst of kies een bestand met leesbare tekst.');

  const entry = { id, title, author: String(material.author ?? '').trim(), locator: String(material.locator ?? '').trim(),
    year: String(material.year ?? '').trim(), url: String(material.url ?? '').trim(), origin, file, location, imported: true };
  if (kind === 'source') Object.assign(entry, {
    status: 'tocheck', passage: text, passageKind: location || 'Ingevoerde tekst',
    type: material.type || '', period: material.period || '', place: material.place || '',
  });
  if (kind === 'study') Object.assign(entry, { status: 'tocheck', relation: 'open', fragment: text, ...aiNote });
  if (kind === 'note') entry.text = text;
  return { dossier: { ...dossier, [key]: [...items, entry] }, entry, existed: false };
}

export function evidenceList(dossier) {
  return [
    ...dossier.sources.map(item => ({ ...item, kind: 'source', ref: 'source:' + item.id, text: item.passage })),
    ...dossier.studies.map(item => ({ ...item, kind: 'study', ref: 'study:' + item.id, text: item.fragment })),
  ].map(item => ({
    ...item, citation: [item.author, item.title, item.year, item.locator].filter(Boolean).join(' · ') || MATERIAL_TYPES[item.kind],
  }));
}

export function comparisonFromForm(data, id) {
  const locators = data.getAll('locator');
  const observations = data.getAll('observation');
  const limitations = data.getAll('limits');
  const relations = data.getAll('relation');
  return {
    id, claim: data.get('claim'), discussion: data.get('discussion'),
    conclusion: data.get('conclusion'), nextCheck: data.get('nextCheck'),
    rows: data.getAll('ref').map((ref, i) => ({ ref, locator: locators[i], observation: observations[i],
      limits: limitations[i], relation: relations[i] })),
  };
}

export function validComparison(dossier, comparison) {
  if (!comparison.claim.trim()) throw new Error('Schrijf eerst welke bewering of deelvraag je wilt toetsen.');
  const available = new Set(evidenceList(dossier).map(item => item.ref));
  const rows = [];
  const used = new Set();
  for (const row of comparison.rows) {
    if (!row.ref && ![row.locator, row.observation, row.limits].some(value => value.trim()) && row.relation === 'open') continue;
    if (!available.has(row.ref)) throw new Error('Kies voor elke ingevulde rij een bron uit dit dossier.');
    if (used.has(row.ref)) throw new Error('Kies minstens twee verschillende bronnen en gebruik elke bron één keer per vergelijking.');
    used.add(row.ref);
    rows.push({ ...row, relation: Object.hasOwn(COMPARISON_RELATIONS, row.relation) ? row.relation : 'open' });
  }
  if (rows.length < 2) throw new Error('Kies minstens twee verschillende bronnen om te vergelijken.');
  if (rows.length > MAX_COMPARISON_ROWS) throw new Error('Gebruik maximaal 24 bronnen per vergelijking.');
  return { ...comparison, claim: comparison.claim.trim(), rows };
}
