import { frenchTopics } from './content/fr-pharmacie.js?v=13r3';
import { italianTopics } from './content/it-spreken.js?v=13r1';

function wordItem(entry, index, words, track) {
  const [word, meaning, accepted] = entry;
  const alternatives = words.filter(other => other !== entry && other[1] !== meaning)
    .slice(index % 4, index % 4 + 3).map(other => other[1]);
  const frenchArticle = track === 'fr' && /^(?:un|une|des) /u.test(word);
  return {
    id: 'woord-' + (index + 1),
    label: word,
    explanation: meaning,
    vocabulary: true,
    questions: [
      { kind: 'choice', skill: 'vocabulary', text: 'Wat betekent «' + word + '»?',
        answer: meaning, options: [meaning, ...alternatives],
        tip: 'Lees de uitdrukking als geheel en verbind ze met het thema van de les.' },
      { kind: 'fill', skill: 'vocabulary', text: track === 'fr' ? 'Schrijf dit in het Frans.' : 'Schrijf dit in het Italiaans.',
        instruction: frenchArticle ? 'Gebruik het onbepaalde lidwoord.' : 'Gebruik de vorm uit de woordenlijst.',
        context: meaning, answer: word, accepted, strict: true, audio: word,
        tip: 'Denk aan de uitdrukking uit de woordenlijst, met het lidwoord als het erbij hoort.' },
    ],
  };
}

function languageLesson(definition, track) {
  const { words, grammar, scene, source, topic, ...identity } = definition;
  const terms = words.map((entry, index) => wordItem(entry, index, words, track));
  const forms = grammar.items.map(([prompt, answer, accepted], index) => ({
    id: 'vorm-' + (index + 1),
    label: grammar.title,
    explanation: grammar.rule,
    questions: [{ kind: 'fill', skill: 'grammar', strict: true, text: prompt, answer, accepted, feedback: grammar.rule }],
  }));
  const conversation = {
    id: 'zin',
    label: 'Zin in de praktijk',
    explanation: scene.translation,
    questions: [{
      kind: 'open', skill: 'sentence', text: scene.prompt, audioPrompt: scene.line, promptMeaning: scene.meaning,
      answer: scene.answer, audio: scene.answer, criteria: scene.criteria,
      feedback: scene.translation, tip: scene.criteria[0],
    }],
  };
  return {
    ...identity, track, languageTopic: topic, route: topic, vocabulary: words, grammar, scene,
    sources: [source].flat().filter(Boolean),
    dialogue: [
      { speaker: 'Vraag', text: scene.line, translation: scene.meaning },
      { speaker: 'Antwoord', text: scene.answer, translation: scene.translation },
    ],
    items: [...terms, ...forms, conversation],
  };
}

export const languageLessons = [
  ...frenchTopics.map(definition => languageLesson(definition, 'fr')),
  ...italianTopics.map(definition => languageLesson(definition, 'it')),
];
