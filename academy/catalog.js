import { catalogIndex } from './catalog-index.js?v=161';
import { catalogPacks } from './catalog-packs.js?v=161';
import { fetchJson } from './fetch-json.js?v=142';

export const summaries = Object.entries(catalogIndex).flatMap(([pack, rows]) =>
  rows.map(([id, track, title, goalCount, level, extension, anchor]) => ({ id, track, title, goalCount, level, extension, anchor, pack })));
export const byLessonId = new Map(summaries.map(lesson => [lesson.id, lesson]));
export const allPackKeys = catalogPacks.map(pack => pack.key);
const trackPacks = new Map();
for (const { track, pack } of summaries) {
  if (!trackPacks.has(track)) trackPacks.set(track, new Set());
  trackPacks.get(track).add(pack);
}
export function packsForTracks(tracks) {
  return [...new Set(tracks.flatMap(track => [...(trackPacks.get(track) ?? [])]))];
}
export const packFiles = new Map(catalogPacks.map(pack => [pack.key, { ...pack, status: 'idle' }]));
let loaded = [];
export const loadedLessons = () => loaded;

export function loadPacks(keys, onChange, retry = false) {
  const requests = keys.map(key => {
    const file = packFiles.get(key);
    if (!file || file.status === 'ready' || (file.status === 'failed' && !retry)) return;
    if (file.promise) return file.promise;
    file.status = 'loading';
    file.error = undefined;
    file.promise = Promise.resolve().then(() =>
      file.url ? fetchJson(file.url, { cache: retry ? 'reload' : 'default' }) : file.load()
    ).then(lessons => {
      if (!Array.isArray(lessons) || lessons.length !== catalogIndex[key].length ||
          lessons.some(lesson => byLessonId.get(lesson?.id)?.pack !== key || !lesson.items?.length) ||
          new Set(lessons.map(lesson => lesson.id)).size !== lessons.length) {
        const error = new Error('De inhoud past niet bij deze catalogus.');
        error.code = 'CATALOG_MISMATCH';
        throw error;
      }
      file.lessons = lessons;
      file.status = 'ready';
      loaded = catalogPacks.flatMap(pack => packFiles.get(pack.key).lessons ?? []);
    }).catch(error => { file.error = error; file.status = 'failed'; }).finally(() => {
      file.promise = undefined;
      onChange?.();
    });
    return file.promise;
  });
  return Promise.all(requests);
}
