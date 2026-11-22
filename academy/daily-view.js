import { TRACKS, ROUTES } from './learning.js?v=13r6';
import { DAY_FOCI, PACE, STAGES, dayKey } from './daily.js?v=13r6';
import { esc, exampleView, heading, languageGrammar, languageVocabulary, lessonExplanation, sourceView } from './views.js?v=13r6';
import { workedExample } from './practice.js?v=13r6';

function dateName(date) {
  const value = new Date(date + 'T12:00:00');
  return value.toLocaleDateString('nl-BE', { weekday:'long', day:'numeric', month:'long' });
}

function archiveView(archive, current, month) {
  const other = archive.filter(row => row.date !== current);
  if (!other.length) return '';
  const months = [...new Set(other.map(row => row.date.slice(0,7)))];
  const previous = month ? other.filter(row => row.date.startsWith(month)) : other.slice(0,14);
  const monthName = key => new Date(key + '-01T12:00:00').toLocaleDateString('nl-BE',{month:'long',year:'numeric'});
  return `<section class="block stack"><h2>Eerdere daglessen</h2>
    <div class="field course-search"><label for="daily-month">Zoek op maand</label><select id="daily-month"><option value="">Recent</option>
      ${months.map(key => '<option value="' + esc(key) + '"' + (month === key ? ' selected' : '') + '>' + esc(monthName(key)) + '</option>').join('')}
    </select></div><div class="unit-list">
    ${previous.map(p => `<a class="unit daily-previous" href="#dagles/${esc(p.date)}">
      <div><h3>${esc(dateName(p.date))}</h3><small>${esc(p.units.map(u => u.title).join(' · '))}</small></div>
      <span class="unit-trailing">${p.completed ? 'Afgerond' : 'Hervatten'}</span></a>`).join('')}
  </div></section>`;
}

function theory(lesson) {
  const topic = [TRACKS[lesson.track]?.name, lesson.period, lesson.level, ROUTES[lesson.route]].filter(Boolean).join(' · ');
  return `<article class="panel daily-theory stack">
    <div><p class="eyebrow">${esc(topic)}</p><h3>${esc(lesson.title)}</h3></div>
    ${lessonExplanation(lesson)}
    ${lesson.languageTopic ? '<h3>Woordenschat</h3>' + languageVocabulary(lesson, 4) + languageGrammar(lesson) +
      '<details><summary>Volledige woordenlijst</summary>' + languageVocabulary(lesson) + '</details>' : exampleView(workedExample(lesson))}
    ${lesson.sources?.length ? `<details><summary>Bronnen</summary><div class="stack">${lesson.sources.map(sourceView).join('')}</div></details>` : ''}
    <a class="text-link" href="#les/${esc(lesson.id)}">Open de volledige les</a>
  </article>`;
}

function stepList(plan) {
  return `<ol class="daily-steps" aria-label="Stappen van de dagles">
    ${plan.stages.map((stage, index) => {
      const done = index < plan.cursor;
      const current = index === plan.cursor;
      return `<li class="${done ? 'done' : current ? 'current' : ''}" ${current ? 'aria-current="step"' : ''}>
      <span class="step-indicator" aria-hidden="true">${done ? '✓' : index + 1}</span>
      <span>${STAGES[stage.id].title}${done ? '<span class="sr-only">, afgerond</span>' : ''}</span></li>`;
    }).join('')}
  </ol>`;
}

function planView(plan, lessons, resume) {
  const entries = Object.values(plan.results);
  const total = entries.reduce((n, row) => n + row.total, 0);
  const correct = entries.reduce((n, row) => n + row.correct, 0);
  const hinted = entries.reduce((n, row) => n + (row.hinted ?? 0), 0);
  const independent = Math.max(0, correct - entries.reduce((n, row) => n + (row.assisted ?? 0), 0));
  if (plan.completed) {
    const revisit = [...new Map(entries.flatMap(row => row.revisit ?? []).map(r => [r.key,r])).values()].slice(0,6);
    return `<div class="panel daily-done stack">
      <h2>Dagles afgerond</h2>
      <p>Je oefende ${total} ${total === 1 ? 'vraag' : 'vragen'}. ${independent} goed op eigen kracht${hinted ? ' · ' + hinted + ' met hulp geoefend' : ''}.</p>
      <p class="muted">Athenaeum neemt je antwoorden mee bij de volgende dagles.</p>
      ${revisit.length ? '<div class="notice"><strong>Begrippen om opnieuw te bekijken</strong><ul>' + revisit.map(r =>
        '<li><a class="text-link" href="#les/' + esc(r.lesson) + '">' + esc(r.label) + '</a></li>').join('') + '</ul></div>' : ''}
      <div class="row">${revisit.length ? `<button type="button" class="button primary" data-action="daily-practice-again" data-value="${esc(plan.date)}">Oefen deze begrippen opnieuw</button>` : ''}
        <a class="button ${revisit.length ? 'quiet' : 'primary'}" href="#vandaag">Naar Vandaag</a>
        <a class="button quiet" href="#voortgang">Bekijk voortgang</a></div>
    </div>
    <section class="block stack"><h2>Behandeld</h2>
      <ul>${plan.units.map(unit => `<li><a class="text-link" href="#les/${esc(unit.id)}">${esc(unit.title)}</a></li>`).join('')}</ul>
    </section>`;
  }
  const stage = plan.stages[plan.cursor];
  const info = STAGES[stage.id];
  const following = plan.stages[plan.cursor+1];
  const noQuestions = !stage.questions.length;
  const selected = plan.units.flatMap(unit => lessons.filter(l => l.id === unit.id));
  return `<div class="daily-layout">
    <aside class="panel daily-outline stack"><h2>Jouw les in stappen</h2>${stepList(plan)}</aside>
    <div class="stack">
      <section class="panel daily-current stack" aria-labelledby="step-current">
        <p class="eyebrow">Stap ${plan.cursor + 1} van ${plan.stages.length}</p>
        <h2 id="step-current">${stage.id === 'recall' && noQuestions ? 'Kennismaken' : info.title}</h2>
        <p class="muted">${stage.id === 'recall' && noQuestions
          ? 'Je kunt meteen naar de uitleg en het voorbeeld. In een volgende dagles komen eerder geoefende begrippen terug.'
          : info.desc}</p>
        ${stage.id === 'read' ? '<p class="small-text muted">Ongeveer ' + stage.minutes + ' minuten lezen</p>' : ''}
        ${!noQuestions ? '<p class="small-text muted">' + stage.questions.length + (stage.questions.length === 1 ? ' vraag' : ' vragen') + '</p>' : ''}
        ${stage.id !== 'read' ? `<div class="row"><button class="button primary" type="button" data-action="daily-next" data-value="${esc(plan.date)}">
          ${noQuestions ? following?.id === 'read' ? 'Bekijk de uitleg' : following ? 'Naar ' + STAGES[following.id].title.toLowerCase() :
            'Les afronden' : resume ? 'Hervat deze stap' : 'Start deze stap'}</button></div>` : ''}
      </section>
      ${stage.id === 'read' ? selected.map(theory).join('') + `<div class="row"><button class="button primary" type="button"
        data-action="daily-next" data-value="${esc(plan.date)}">Verder naar begeleid oefenen</button></div>` : ''}
      ${stage.id !== 'read' ? `<section class="panel small-text stack"><h3>Onderwerpen van vandaag</h3><ul class="daily-topics">${
        plan.units.map(unit => '<li>' + esc(unit.title) + '</li>').join('')}</ul></section>` : ''}
    </div>
  </div>`;
}

export function dailyPage(plan, lessons, archive, resume, month = '') {
  const header = heading('Lectio diei', 'Herhaal wat je weet, lees verder en pas de stof toe.', 'Dagles · ' + dateName(plan?.date ?? dayKey()), 'la');
  if (plan) {
    const today = plan.date === dayKey() ? '' : '<p class="topline"><a class="text-link" href="#dagles">Naar de dagles van vandaag</a></p><br>';
    return header + today + planView(plan, lessons, resume) + archiveView(archive, plan.date, month);
  }
  const latest = archive[0];
  const minutes = Object.hasOwn(PACE,latest?.minutes) ? latest.minutes : 15;
  const focus = Object.hasOwn(DAY_FOCI,latest?.focus) ? latest.focus : 'mix';
  const modes = {8:'Kort',15:'Compact',25:'Uitgebreid',40:'Verdieping'};
  return header + `<div class="daily-layout">
    <aside class="panel daily-outline stack"><h2>Van voorkennis naar toepassing</h2>
      <ol class="daily-steps">${Object.values(STAGES).map((stage,i) => `<li><span class="step-indicator" aria-hidden="true">${i+1}</span><span>${stage.title}</span></li>`).join('')}</ol>
    </aside>
    <section class="panel daily-current stack">
      <h2>Stel je les samen</h2>
      <form id="daily-form" class="stack">
        <fieldset class="pace-options">
          <legend>Hoeveel tijd heb je?</legend>
          ${Object.keys(PACE).map(n => `<label class="pace-card"><input type="radio" name="minutes" value="${n}" ${n == minutes ? 'checked' : ''} required>
            <span><strong>${n} min</strong><span class="muted">${modes[n]}</span></span></label>`).join('')}
        </fieldset>
        <div class="field"><label for="daily-focus">Waar wil je vandaag op focussen?</label><select name="focus" id="daily-focus">
          ${Object.entries(DAY_FOCI).map(([key,label]) => `<option value="${key}" ${key === focus ? 'selected' : ''}>${label}</option>`).join('')}
        </select></div>
        <p class="muted small-text">De les sluit aan op je gekozen taalniveaus en eerdere antwoorden. Je kunt op elk moment pauzeren.</p>
        <div><button type="submit" class="button primary">Start mijn dagles</button></div>
      </form>
    </section>
  </div>` + archiveView(archive, dayKey(), month);
}
