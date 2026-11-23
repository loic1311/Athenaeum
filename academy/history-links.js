import { timelineScope } from './history-chronology.js?v=14r3';

export const HISTORY_SECTIONS = {
  chronologie: ['Chronologia', 'Tijdlijn en tijdvakken', 'clock'],
  atlas: ['Atlas historicus', 'Wereldbol', 'globe'],
  bronnen: ['Officina fontium', 'Bronnenatelier', 'scriptorium'],
  leerplan: ['Curriculum', 'Thematisch leerplan', 'knowledge'],
};
export const EXPLORER_PAGES = {
  ...Object.fromEntries(Object.entries(HISTORY_SECTIONS).map(([page, [title]]) => [page, title])),
  tijdvakken: 'Chronologia',
};

export function explorerHref(page, scope = 'alles', key = '') {
  if (page === 'tijdvakken' || page === 'chronologie') {
    return 'paideia/chronologie/' + timelineScope(scope) + (key ? '/tijdvak/' + encodeURIComponent(key) : '/alle');
  }
  return 'paideia/' + page + '/' + timelineScope(scope) + (key ? '/' + encodeURIComponent(key) : '');
}

export function explorationLessonHref(lessonId, page, scope, key = '') {
  return 'les/' + encodeURIComponent(lessonId) + '/verkenning/' + page + '/' + timelineScope(scope) + (key ? '/' + encodeURIComponent(key) : '');
}
