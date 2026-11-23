// Editorial format for source-led lessons. Dates use historical years (no year zero).
export function reference(author, title, locator, url, year = '') {
  return { author, title, locator, url, year };
}

export function lesson({ id, track, year, period, title, summary, sections, sources, caseIds, themes, places, choice, analysis, synthesis }) {
  const [question, answer, distractors, feedback] = choice;
  const items = [{
    id: 'begrip', label: 'Begrip en situering', source: 0, explanation: feedback,
    questions: [{ kind: 'choice', text: question, answer, options: [answer, ...distractors], feedback }],
  }];
  for (const [key, label, exercise] of [['bron', 'Bronanalyse', analysis], ['synthese', 'Historische synthese', synthesis]]) {
    const [prompt, model, criteria, sourceIndex = 0] = exercise;
    items.push({ id: key, label, source: sourceIndex, explanation: model,
      questions: [{ kind: 'open', text: prompt, answer: model, criteria, feedback: model }] });
  }
  return { id: 'acad-' + id, track, year, period, title, summary, themes, places, sources, caseIds, items,
    structure: sections.map(([heading, lead, text]) => ({ heading, lead, text })) };
}
