import { esc, heading, icon, sectionHeading } from './views.js?v=150';

export const SCRIPTORIUM_CHANNEL = 'athenaeum-scriptorium-v1';
const SCRIPTORIUM_VIEWS = {
  overzicht: ['Conspectus · Overzicht', 'home', 'Bekijk je onderzoek en kies een volgende stap.', 'dashboard'],
  corpus: ['Corpus · Mijn verzameling', 'knowledge', 'Vind je opgeslagen werken, PDF’s en analyses.', 'corpus'],
  ontdekken: ['Inventio · Bronnen zoeken', 'globe', 'Zoek aanvullend vergelijkingsmateriaal.', 'discovery'],
  ontleden: ['Analysis · Corpusanalyse', 'scriptorium', 'Analyseer werken uit je corpus.', 'exchange'],
  oefenen: ['Exercitatio · Oefenatelier', 'check', 'Oefen onderzoeksvragen, bronnenkritiek en argumentatie.', 'training'],
  theorie: ['Theoria · Onderzoeksmethode', 'pen', 'Raadpleeg de uitleg bij historische onderzoeksmethoden.', 'atelier'],
  voortgang: ['Progressus · Voortgang', 'graph', 'Bekijk welke onderzoeksvaardigheden aan bod komen.', 'progress'],
};

export function scriptoriumURL(section, profileId) {
  const page = Object.hasOwn(SCRIPTORIUM_VIEWS, section) ? SCRIPTORIUM_VIEWS[section][3] : 'dashboard';
  const url = new URL('../apps/scriptorium/', import.meta.url);
  url.searchParams.set('ath_profile', profileId);
  url.searchParams.set('page', page);
  return url.href;
}

function launchLink(section, profileId, css, label) {
  return profileId
    ? `<a class="${css}" href="${esc(scriptoriumURL(section, profileId))}">${label}</a>`
    : `<button type="button" class="${css}" data-action="scriptorium-open" data-value="${section}">${label}</button>`;
}

export function scriptoriumShell(key, researchId, profileId) {
  if (key === 'invoegen') return heading('Werk uit Scriptorium', 'Gebruik de gegevens die je bij een werk in Scriptorium hebt gekopieerd.', 'Onderzoeksdossiers') + `
    <form class="panel stack" id="scriptorium-paste-form">
      <div class="field"><label for="scriptorium-work">Plak hier de gegevens van het werk</label>
        <textarea id="scriptorium-work" name="work" rows="5" maxlength="16000" required></textarea></div>
      <p class="notice" role="status" hidden></p>
      <div class="row"><button class="button primary" type="submit">Kies een dossier</button><a class="button quiet" href="#scriptorium">Terug naar Scriptorium</a></div>
    </form>`;
  const section = Object.hasOwn(SCRIPTORIUM_VIEWS, key) ? key : 'overzicht';
  const selected = SCRIPTORIUM_VIEWS[section];
  const research = researchId ? '#onderzoek/' + esc(researchId) + '/invoegen' : '#onderzoek';
  const label = section === 'overzicht' ? 'Open Scriptorium' : 'Open ' + selected[0];
  return sectionHeading('scriptorium') + `
    <section class="panel course-start stack scriptorium-start">
      <div><h2>${section === 'overzicht' ? 'Je onderzoekswerkruimte' : selected[0]}</h2>
        <p>${section === 'overzicht' ? 'Werk verder in je eigen corpus, analyseer teksten of bereid je onderzoek voor.' : selected[2]}</p></div>
      <div class="row">${launchLink(section, profileId, 'button primary', esc(label))}
        <a class="button" href="${research}">Onderzoeksdossiers</a></div>
    </section>
    <section class="block" aria-label="Onderdelen van Scriptorium">
      <div class="columns three">${Object.entries(SCRIPTORIUM_VIEWS).filter(([id]) => id !== section).map(([id, [name, symbol, text]]) =>
        launchLink(id, profileId, 'panel track-card', `<span class="track-icon">${icon(symbol)}</span><strong>${esc(name)}</strong>
          <span class="muted">${esc(text)}</span>`)).join('')}</div>
    </section>
    <section class="block panel stack">
      <h2>Oefenen en bronnen meenemen</h2>
      <div class="row"><button type="button" class="button" data-action="scriptorium-practice">Probeer een bronoefening</button>
        <a class="button quiet" href="#scriptorium/invoegen">Plak een werk uit Scriptorium</a></div>
    </section>`;
}

export function scriptoriumPaste(value) {
  if (typeof value !== 'string' || value.length > 16000) return null;
  try {
    const data = JSON.parse(value);
    return data?.format === SCRIPTORIUM_CHANNEL ? scriptoriumTransfer(data.work) : null;
  } catch {
    return null;
  }
}

export function scriptoriumTransfer(raw) {
  if (!raw || !['number','string'].includes(typeof raw.id) || typeof raw.title !== 'string' || !raw.title.trim()) return null;
  const short = (value, max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
  let url = '';
  try {
    const target = new URL(raw.url);
    if (['https:','http:'].includes(target.protocol)) url = target.href;
  } catch { /* Records may lack a source URL. */ }
  const page = Number(raw.finding?.page);
  return {
    kind: 'study', title: short(raw.title,400), author: short(raw.author,350), year: short(raw.year,80),
    origin: 'scriptorium:' + String(raw.id).slice(0,160), url, file: short(raw.filename,250),
    analysisNote: short(raw.finding?.text,6000), analysisPage: Number.isSafeInteger(page) && page > 0 ? page : undefined,
  };
}

export function scriptoriumTransferDialog(material, dossiers, selected) {
  return `<form id="scriptorium-transfer-form" class="stack">
    <p><strong>${esc(material.title)}</strong></p>
    <p class="small-text muted">${esc([material.author,material.year,
      material.analysisNote ? 'Met AI-notitie' + (material.analysisPage ? ' van PDF-pagina ' + material.analysisPage : '') : '',
    ].filter(Boolean).join(' · '))}</p>
    <div class="field"><label for="scriptorium-target">Onderzoeksdossier</label>
      <select id="scriptorium-target" name="dossier"><option value="">Nieuw dossier maken</option>
        ${dossiers.map(dossier => `<option value="${esc(dossier.id)}" ${dossier.id === selected ? 'selected' : ''}>${esc(dossier.title || 'Nieuw onderzoeksdossier')}</option>`).join('')}
      </select></div>
    <div><button class="button primary" type="submit">Voeg toe aan dossier</button></div>
  </form>`;
}
