import { TRACKS, levelFor } from './learning.js?v=142';
import { dayKey } from './daily.js?v=142';
import { streakStatus } from './streak.js?v=142';

export const validGoal = value => Number.isSafeInteger(value) && value >= 1;

export function progressOverview(lessons, records, review, read, prefs, profile, active, when = new Date()) {
  const byTrack = Object.fromEntries(Object.keys(TRACKS).map(id => [id, {
    lessons: 0, studied: 0, complete: 0, total: 0, goals: 0, recognized: 0, retained: 0, due: 0,
  }]));
  const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
  const coveredGoals = new Map();
  for (const [key, state] of review.states) {
    const lesson = byId.get(key.split('/')[0]);
    if (!lesson) continue;
    const track = byTrack[lesson.track];
    if (state.due <= +when) track.due++;
    if (!state.attempted) continue;
    track.goals++;
    if (state.recognized) track.recognized++;
    if (state.recallCount >= 2) track.retained++;
    coveredGoals.set(lesson.id, (coveredGoals.get(lesson.id) ?? 0) + 1);
  }
  for (const lesson of lessons) {
    const goals = lesson.goalCount ?? lesson.items.length;
    const progress = byTrack[lesson.track];
    progress.lessons++;
    progress.total += goals;
    if (coveredGoals.has(lesson.id) || read.has(lesson.id)) progress.studied++;
    if (goals && coveredGoals.get(lesson.id) >= goals) progress.complete++;
  }
  const activity = Array.from({ length: 7 }, (_, i) => {
    const date = dayKey(new Date(when.getFullYear(), when.getMonth(), when.getDate() - 6 + i));
    return { date, count: 0 };
  });
  const monday = new Date(when.getFullYear(), when.getMonth(), when.getDate() - (when.getDay() + 6) % 7);
  const byDate = new Map(activity.map(day => [day.date, day]));
  const week = new Set();
  let last;
  const results = [];
  for (const row of records) {
    const reading = row.kind === 'prefs' && row.data.name === 'history-read' && row.data.value;
    const practiced = row.kind === 'review' && !row.data.skipped;
    if (reading || practiced) {
      const unit = byId.get(row.data.lesson);
      if (unit && row.at <= +when) {
        if (row.at >= +monday) week.add(unit.id);
        if (!last || last.at < row.at) last = { unit, at: row.at };
      }
    }
    if (row.kind === 'review') {
      const day = byDate.get(dayKey(new Date(row.at)));
      if (day) day.count++;
    }
    if (row.kind === 'result') results.push(row);
  }
  results.sort((a,b) => b.at - a.at);
  const completedExams = results.filter(row => row.data.mode === 'exam' && row.data.total && row.data.reviewed === row.data.total);
  const goalValue = records.find(row => row.id === 'weekly-goal' && row.kind === 'prefs')?.data.value;
  const sum = field => Object.values(byTrack).reduce((count, track) => count + track[field], 0);
  return {
    daily: records.find(row => row.id === 'daily-' + dayKey(when))?.data.daily,
    streak: streakStatus(records, dayKey(when)), days: records.filter(row => row.kind === 'draft' && row.data.daily?.completed).length,
    profile, lessons, studied: review.lessons, byTrack, prefs, today: activity.at(-1).count, activity, resume: Boolean(active),
    resumeTitle: active?.title, lastLesson: last?.unit, results, completedExams,
    goals: sum('goals'), totalGoals: sum('total'), recognized: sum('recognized'), retained: sum('retained'), due: sum('due'),
    studiedCount: sum('studied'), completedLessons: sum('complete'), readCount: read.size,
    weeklyLessons: week.size, weeklyGoal: validGoal(goalValue) ? goalValue : null,
    next: Object.keys(TRACKS).map(track => lessons.find(lesson => lesson.track === track && !review.lessons.has(lesson.id) &&
      !read.has(lesson.id) && levelFor(lesson, prefs))).filter(Boolean).slice(0, 3),
  };
}
