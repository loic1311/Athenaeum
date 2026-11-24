import { HISTORICAL_TRACKS } from './history-chronology.js?v=160';

export const historicalAssessment = lesson => HISTORICAL_TRACKS.includes(lesson.track) && !lesson.id.startsWith('eigen-');

export const HISTORICAL_SKILLS = {
  situation: 'Historisch situeren',
  explanation: 'Historisch verklaren',
  comparison: 'Historisch vergelijken',
  source: 'Bronnen interpreteren',
  synthesis: 'Historische synthese',
};

const expects = {
  situation: {
    instruction: 'Plaats het antwoord waar relevant in tijd, ruimte en institutionele context.',
    expected: 'Maak duidelijk binnen welke periode, plaats of instelling je antwoord geldt.',
    revision: 'Voeg de relevante datering, plaats of betrokken instelling toe.',
  },
  explanation: {
    instruction: 'Maak het verband duidelijk. Benoem de betrokken actoren of instellingen en leg uit hoe hun handelen de uitkomst beïnvloedde.',
    expected: 'Leg minstens één stap uit tussen de uitgangssituatie, het beschreven handelen en de uitkomst.',
    revision: 'Schrijf uit wie of wat het verschil maakte en hoe dat effect tot stand kwam.',
  },
  comparison: {
    instruction: 'Vergelijk op minstens één gemeenschappelijke maatstaf en verklaar het belangrijkste verschil of de belangrijkste overeenkomst.',
    expected: 'Laat zien wat je aan beide kanten vergelijkt en waarom een overeenkomst of verschil historisch belangrijk is.',
    revision: 'Behandel dezelfde vraag voor beide voorbeelden en schrijf daarna de gevolgtrekking uit.',
  },
  source: {
    instruction: 'Onderbouw je antwoord met een concreet detail uit het materiaal en begrens wat je daaruit kunt afleiden.',
    expected: 'Verbind een herkenbare aanwijzing met je stelling. Leg uit waarom het genre, de maker of de bewaring de gevolgtrekking begrenst.',
    revision: 'Wijs een concrete passage, vondst of registratie aan en formuleer wat die rechtstreeks ondersteunt.',
  },
  synthesis: {
    instruction: 'Bouw een samenhangende redenering op met minstens twee ontwikkelingen of perspectieven uit de stof.',
    expected: 'Leg uit hoe de onderscheiden ontwikkelingen samenhangen en verdedig je conclusie met concrete voorbeelden.',
    revision: 'Orden de voorbeelden rond een duidelijke stelling. Licht bij elk voorbeeld toe hoe het je stelling ondersteunt of nuanceert.',
  },
};

function historicalSkill(question, item, lesson) {
  if (question.historicalSkill) return question.historicalSkill;
  const prompt = question.text.toLocaleLowerCase('nl');
  if (question.passage || question.evidenceNotes?.length) return 'source';
  if (question.kind === 'fill' || /^(hoe heet|hoe noem je|wanneer|wie was|waar ligt)\b/u.test(prompt)) return 'situation';
  if (item.id === 'synthese') return 'synthesis';
  if (/\b(synthese|samenhangende verklaring|verbind.*ontwikkelingen)\b/u.test(prompt)) return 'synthesis';
  if (question.cases?.length || /\b(vergelijk|vergelijking|overeenkomsten?|verschillen?)\b/u.test(prompt)) return 'comparison';
  if (item.id === 'bronanalyse' || lesson.primary || /\b(bewijskracht|vindcontext|bronmateriaal|bronkritiek|conclusie|gevolgtrekking|afleiden|onderbouwt|toont.*aan|welk bewijs)\b/u.test(prompt)) return 'source';
  if (question.evidence === 'application' || /\b(waarom|hoe|verklaar|verklaring|waardoor|gevolgen?|mechanisme|verband|beoordeel|toets)\b/u.test(prompt)) return 'explanation';
  return 'situation';
}

function rubricFor(question, skill) {
  if (question.rubric?.length) return question.rubric;
  const framework = expects[skill];
  return [
    { label: 'Historische kern', expected: question.answer,
      revision: 'Herneem de relevante uitleg en verbeter de belangrijkste ontbrekende of onjuiste vaststelling.' },
    { label: HISTORICAL_SKILLS[skill], expected: question.criteria?.length
      ? question.criteria.join(' ') : framework.expected, revision: framework.revision },
  ];
}

export function reviseHistoryQuestion(lesson, item, question) {
  const historicalSkillName = historicalSkill(question, item, lesson);
  const open = question.kind === 'open' || question.kind === 'card';
  // A correct location or name remains a useful check of prerequisites.
  const advanced = historicalSkillName !== 'situation';
  const answer = question.kind === 'card' && item.explanation && item.explanation !== question.answer
    ? question.answer + '\n\n' + item.explanation : question.answer;
  const level = question.studyLevel ?? (open ? advanced ? 3 : 2 : advanced && question.kind === 'choice' ? 3 : 1);
  const instruction = question.instruction ?? (open ? expects[historicalSkillName].instruction :
    historicalSkillName === 'situation' ? 'Kies of noteer de juiste situering. In de correctie staat waarom dit gegeven van belang is.' :
      'Kies het antwoord dat door de besproken historische context of het bronmateriaal wordt gedragen.');
  return {
    ...question,
    ...(open ? { kind: 'open', answer, rubric: rubricFor(question, historicalSkillName) } : {}),
    historicalSkill: historicalSkillName, studyLevel: level, instruction,
    feedback: question.feedback || item.explanation || undefined,
    ...(advanced && question.kind === 'choice' ? { evidence: 'application' } : {}),
  };
}

export function contextualHistoryQuestion(lesson, item, source, reviewed) {
  if (reviewed.some(q => q.kind === 'open' && q.historicalSkill !== 'situation')) return;
  if (!source || reviewed.some(q => q.kind === 'open' && !item.explanation)) return;
  const core = reviewed.find(q => q.kind === 'choice')?.answer ?? reviewed[0].answer;
  const supportingText = item.explanation ?? core;
  const historicalSkillName = lesson.primary ? 'source' : 'explanation';
  const framework = expects[historicalSkillName];
  const text = lesson.primary
    ? 'Welke historische uitspraak over dit onderwerp kun je onderbouwen met een detail uit het fragment? Leg ook uit hoe genre, bedoeling of overlevering bepalen wat je kunt besluiten.'
    : 'Gebruik een plaats, groep of instelling uit de les om dit onderwerp te situeren. Leg daarna uit welk verband er bestaat met de historische ontwikkeling in de les.';
  const answer = [...new Set([supportingText, core, lesson.summary])].filter(Boolean).join('\n\n');
  return {
    kind: 'open', text, context: item.label, ...(lesson.primary ? { passage: lesson.primary } : {}),
    answer, studyLevel: 3, historicalSkill: historicalSkillName, instruction: framework.instruction,
    rubric: [
      { label: 'Voorbeeld', expected: supportingText, revision: 'Gebruik een concrete plaats, handeling of instelling uit de uitleg.' },
      { label: HISTORICAL_SKILLS[historicalSkillName], expected: framework.expected, revision: framework.revision },
    ],
  };
}
