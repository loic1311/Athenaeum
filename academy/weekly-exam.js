import { EXAM_GOALS, TRACKS, examQuestions, makePool } from './learning.js?v=150';
import { dayKey } from './daily.js?v=150';
import { studyReadings } from './study-history.js?v=150';

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

function assessedPeriod(lessons, records, start, end, minimum) {
  const inPeriod = at => Number.isFinite(at) && at >= +start && at < +end;
  const read = new Set(studyReadings(records).filter(row => inPeriod(row.at)).map(row => row.lesson));
  const practiced = new Set();
  for (const row of records) {
    const data = row.data;
    if (row.kind === 'review' && inPeriod(row.at) && !row.id.startsWith('review-result-') && !data?.skipped && data?.key) {
      practiced.add(data.key);
    }
  }
  const pool = makePool(lessons.filter(lesson => ['history', 'traditio'].includes(TRACKS[lesson.track]?.section)));
  const goals = pool.filter(item => (read.has(item.lesson) || practiced.has(item.key)) &&
    item.questions.some(question => question.kind !== 'listen'));
  const ids = new Set(goals.map(item => item.lesson));
  const covered = lessons.filter(lesson => ids.has(lesson.id));
  return { goals, lessons: covered, ready: goals.length >= minimum };
}

export function weeklyStudy(lessons, records, now = Date.now()) {
  const week = currentWeek(now);
  return { ...week, ...assessedPeriod(lessons, records, week.monday, week.end, EXAM_GOALS.week) };
}

export function monthlyStudy(lessons, records, now = Date.now()) {
  const date = new Date(now);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end, startKey: dayKey(start), ...assessedPeriod(lessons, records, start, end, EXAM_GOALS.month) };
}

function questionsFor(period, history, monthly, allGoals) {
  const states = new Map(period.goals.map(item => [item.key, history.states.get(item.key) ?? {}]));
  return examQuestions(period.goals, { ...history, states }, monthly, allGoals);
}

export const weeklyExamQuestions = (week, history, allGoals = false) => questionsFor(week, history, false, allGoals);
export const monthlyExamQuestions = (month, history, allGoals = false) => questionsFor(month, history, true, allGoals);
