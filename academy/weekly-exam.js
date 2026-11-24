import { EXAM_GOALS, TRACKS, examQuestions, makePool } from './learning.js?v=142';
import { dayKey } from './daily.js?v=142';

function currentWeek(now) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const end = new Date(sunday);
  end.setDate(end.getDate() + 1);
  return { monday, sunday, end, startKey: dayKey(monday), endKey: dayKey(sunday) };
}

export function weeklyStudy(lessons, records, now = Date.now()) {
  const week = currentWeek(now);
  const inWeek = at => Number.isFinite(at) && at >= +week.monday && at < +week.end;
  const read = new Set();
  const practiced = new Set();
  for (const row of records) {
    const data = row.data;
    if (row.kind === 'prefs' && inWeek(row.at) && data?.name === 'history-read' && data.value === true) {
      read.add(data.lesson);
    }
    if (row.kind === 'review' && inWeek(row.at) && !row.id.startsWith('review-result-') && !data?.skipped && data?.key) {
      practiced.add(data.key);
    }
    if (row.kind !== 'draft' || !data?.daily) continue;
    const plan = data.daily;
    const readStage = plan.stages?.findIndex(step => step.id === 'read') ?? -1;
    if (readStage === -1 || !Number.isInteger(plan.cursor) || plan.cursor <= readStage) continue;
    const day = plan.readDay ?? plan.studyDay ?? plan.date;
    if (day >= week.startKey && day <= week.endKey) for (const unit of plan.units ?? []) read.add(unit.id ?? unit);
  }
  const pool = makePool(lessons.filter(lesson => ['history', 'traditio'].includes(TRACKS[lesson.track]?.section)));
  const goals = pool.filter(item => (read.has(item.lesson) || practiced.has(item.key)) &&
    item.questions.some(question => question.kind !== 'listen'));
  const ids = new Set(goals.map(item => item.lesson));
  const covered = lessons.filter(lesson => ids.has(lesson.id));
  return { ...week, goals, lessons: covered, ready: goals.length >= EXAM_GOALS.week };
}

export function weeklyExamQuestions(week, history, allGoals = false) {
  const states = new Map(week.goals.map(item => [item.key, history.states.get(item.key) ?? {}]));
  return examQuestions(week.goals, { ...history, states }, false, allGoals);
}
