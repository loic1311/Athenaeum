export const SCORE_VERSION = 2;

export function evidenceFor(question, answer) {
  switch (question?.kind) {
    case 'open':
    case 'card':
      return 'self';
    case 'fill':
      return 'recall';
    case 'order':
      return Array.isArray(answer?.selection) ? 'recognition' : 'recall';
    case 'choice':
    case 'match':
    case 'listen':
      return 'recognition';
    default:
      return 'unknown';
  }
}

export function independentlyCorrect(answer) {
  return !answer?.skipped && !answer?.hinted && ['good', 'easy'].includes(answer?.rating);
}

export function reviewData(question, answer, key = question.key, rating = answer.rating) {
  return {
    key, question: question.id, lesson: question.lesson, rating,
    evidence: evidenceFor(question, answer),
    hinted: Boolean(answer.hinted),
    skipped: Boolean(answer.skipped),
  };
}

export function tally(questions, answers) {
  const result = { total: questions.length, correct: 0, reviewed: 0, objective: 0, assisted: 0, selfAssessed: 0 };
  questions.forEach((question, index) => {
    const answer = answers[index];
    const evidence = evidenceFor(question, answer);
    const objective = evidence === 'recall' || evidence === 'recognition';
    if (objective) result.objective++;
    if (!answer?.rating) return;
    result.reviewed++;
    if (evidence === 'self' && !answer.skipped) result.selfAssessed++;
    if (objective && independentlyCorrect(answer)) result.correct++;
    if (objective && !answer.skipped && answer.rating === 'help') result.assisted++;
  });
  return result;
}
