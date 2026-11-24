import { dayKey } from './daily.js?v=160';
import { EXAM_GOALS } from './learning.js?v=160';
import { SCORE_VERSION } from './assessment.js?v=150';

const DAY = 86_400_000;
export const STARTING_ICE = 2;
export const MAX_ICE = 5;
export const EXAM_PASS = 70;
export const EXAM_ICE = { week: 1, month: 2 };

function dayNumber(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time / DAY : NaN;
}

export const isStudyDay = value => Number.isFinite(dayNumber(value));
const isoDay = number => new Date(number * DAY).toISOString().slice(0, 10);
export const studyRecordId = day => 'streak-day-' + day;

export function countsAsPractice(result) {
  return ['quick', 'lesson', 'exam'].includes(result.mode) && Array.isArray(result.answers) && result.answers.some((answer, i) =>
    answer && !answer.skipped && (typeof answer.response === 'string' && Boolean(answer.response.trim()) ||
      Array.isArray(answer.selection) && answer.selection.some(Number.isInteger) ||
      result.questions?.[i]?.kind === 'card' && Boolean(answer.rating)));
}

function examPeriod(type, date) {
  if (type === 'month') return 'month/' + isoDay(date).slice(0, 7);
  const weekday = new Date(date * DAY).getUTCDay();
  return 'week/' + isoDay(date - (weekday + 6) % 7);
}

function rewardFor(row, completed, today) {
  const data = row.data;
  const type = data.examType ?? ({ Weekexamen: 'week', Maandtoets: 'month' })[data.title];
  if (data.mode !== 'exam' || !Object.hasOwn(EXAM_ICE, type) || data.reviewed !== data.total) return null;
  const currentScore = data.scoreVersion === SCORE_VERSION;
  const denominator = currentScore ? data.objective : data.total;
  if (!Number.isInteger(denominator) || denominator < (currentScore ? EXAM_GOALS[type] : 1) ||
      data.correct * 100 < denominator * EXAM_PASS) return null;
  const graded = dayNumber(data.gradedDay ?? dayKey(new Date(row.at)));
  if (!Number.isFinite(graded) || graded < completed || graded > today) return null;
  const examined = type === 'week' && isStudyDay(data.examWeek) ? dayNumber(data.examWeek) : completed;
  return { id: row.id, at: row.at, day: graded, period: examPeriod(type, examined), ice: EXAM_ICE[type] };
}

export function streakStatus(records, today = dayKey()) {
  const end = dayNumber(today);
  const practiced = new Set();
  const rewards = new Map();
  for (const row of records) {
    const data = row.data;
    if (!data) continue;
    const daily = row.kind === 'draft' && data.daily?.completed;
    const result = row.kind === 'result' && countsAsPractice(data);
    const marker = row.kind === 'prefs' && data.name === 'streak-day' && row.id === studyRecordId(data.date);
    if (!daily && !result && !marker) continue;

    const day = dayNumber(daily ? data.daily.studyDay ?? data.daily.date :
      marker ? data.date : data.studyDay ?? dayKey(new Date(row.at)));
    if (!Number.isFinite(day) || day > end) continue;
    practiced.add(day);
    const reward = result ? rewardFor(row, day, end) : null;
    if (!reward) continue;
    const previous = rewards.get(reward.period);
    if (!previous || reward.at < previous.at || reward.at === previous.at && reward.id < previous.id) {
      rewards.set(reward.period, reward);
    }
  }

  const awards = new Map();
  for (const reward of rewards.values()) {
    if (!awards.has(reward.day)) awards.set(reward.day, []);
    awards.get(reward.day).push(reward);
  }
  const protectedDays = new Set();
  const earned = new Map();
  let ice = STARTING_ICE;
  let length = 0;
  let best = 0;
  const first = Math.min(end, ...practiced);
  for (let day = first; day <= end; day++) {
    for (const reward of (awards.get(day) ?? []).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id))) {
      const gained = Math.min(MAX_ICE - ice, reward.ice);
      earned.set(reward.id, gained);
      ice += gained;
    }
    if (practiced.has(day)) {
      length++;
      best = Math.max(best, length);
    } else if (day < end && length) {
      if (ice) {
        ice--;
        protectedDays.add(day);
      } else {
        length = 0;
      }
    }
  }
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = end - 6 + i;
    return { date: isoDay(day), state: practiced.has(day) ? 'done' : protectedDays.has(day) ? 'ice' : 'open' };
  });
  return { length, best, ice, studiedToday: practiced.has(end), days, earned };
}
