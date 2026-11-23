const dcc = 'https://dcc.dickinson.edu/grammar/latin/';
export const latinGrammar = (locator, page) => ({
  author:'J. H. Allen & J. B. Greenough', title:'New Latin Grammar for Schools and Colleges',year:'Online-editie M. Ayer, 2014',locator,
  url:dcc + (page || 'index'),
});
const greekBase = 'https://dcc.dickinson.edu/grammar/';
export const greekGrammar = (locator, page) => ({
  author:'W. E. Major & M. Laughy',title:'Ancient Greek for Everyone',year:'2018 · digitale tekst DCC',locator,url:greekBase + 'age/' + page,
});
export const goodell = (locator, page) => ({
  author:'T. D. Goodell',title:'A School Grammar of Attic Greek',year:'Online-editie M. Ayer, 2018',locator,url:greekBase + 'goodell/' + page,
});
export function passage(line, nl, analysis, criteria, original = false, alternatives = []) {
  return {line,nl,analysis,criteria,original,alternatives};
}
export function classicalUnit(track, slug, topic, title, summary, words, forms, reading, sources, historyLink, letters = false) {
  const terms = words.map(([term, meaning, example, recall], i) => {
    const target = recall ?? (letters ? term.split(' ')[1] : term.split(',')[0].trim());
    const alternatives = words.filter((w,j) => j !== i && w[1] !== meaning).map(w => w[1]);
    return {id:'woord-'+(i+1),label:term,explanation:meaning,vocabulary:true,questions:[
      {kind:'choice',skill:'vocabulary',text:letters ? 'Welke Griekse letter is dit?' : 'Welke betekenis heeft dit woord hier?',context:letters ? term : (example || term) + '  ·  ' + term,
        answer:meaning,options:[meaning,...alternatives],feedback:example || term},
      {kind:'fill',skill:'vocabulary',text:letters ? 'Typ de kleine letter.' : 'Geef de woordenboekvorm bij deze betekenis.',context:meaning,answer:target,
        tip:letters ? 'Je kunt het Griekse toetsenbord openen.' : 'Geef het eerste woord uit het lemma, zonder lidwoord of tweede naamval.',feedback:term + ' · ' + meaning},
    ]};
  });
  const grammar = forms.map(([text,answer,explanation,accepted = [], strict = false], i) => (
    {id:'vorm-'+(i+1),label:'Vormanalyse '+(i+1),explanation,questions:[{kind:'fill',skill:'grammar',text,answer,accepted,strict,feedback:explanation}]}));
  const sentence = {id:'passage',label:letters ? 'Schrift lezen' : 'Vertalen',explanation:reading.analysis,questions:[
    {kind:'open',skill:'sentence',text:letters ? 'Lees de tekens en leg uit wat je herkent.' : 'Maak je eigen Nederlandse vertaling en verantwoord één grammaticale keuze.',
      context:reading.line,answer:reading.nl,criteria:reading.criteria,
      feedback:[reading.analysis, ...(reading.alternatives ?? []).map(model => 'Andere mogelijke vertaling: ' + model)].join('\n\n')},
  ]};
  return {id:track+'-'+slug,track,languageTopic:topic,route:topic,classical:true,title,summary,vocabulary:words,reading,historyLink,letters,
    sources,items:[...terms,...grammar,sentence]};
}

export function composition(lesson, prompt, models, criteria, feedback) {
  lesson.items.push({
    id:'themazin',label:'Zelf een zin formuleren',explanation:feedback,
    questions:[{
      kind:'open',skill:'sentence',text:lesson.track === 'la' ? 'Vertaal naar het Latijn.' : 'Vertaal naar het Oudgrieks.',
      context:prompt,answer:models[0],criteria,feedback:[feedback, ...models.slice(1).map(model => 'Andere mogelijkheid: ' + model)].join('\n\n'),
      answerLanguage:lesson.track,
    }],
  });
  return lesson;
}
