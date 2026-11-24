export function criteria(rows) {
  return rows.map(([label, expected, revision]) => ({ label, expected, revision }));
}

export function application(text, answer, feedback, alternatives) {
  return {
    kind: 'choice', studyLevel: 3, evidence: 'application', text, answer, feedback,
    options: [answer, ...alternatives.map(([option]) => option)],
    optionFeedback: Object.fromEntries(alternatives),
  };
}

export function essay(text, answer, rows, extra = {}) {
  return { kind: 'open', studyLevel: 4, text, answer, rubric: criteria(rows), ...extra };
}

export function courseUnit({ id, track, year, period, title, summary, themes, sources, sections, questions }) {
  return {
    id, track, year, period, title, summary, themes, sources,
    structure: sections.map(([heading, lead, text, ...references]) => ({
      heading, lead, text, references: references.map(index => sources[index]),
    })),
    items: questions.map(([id, label, source, ...questions]) => ({ id, label, source, questions })),
  };
}
