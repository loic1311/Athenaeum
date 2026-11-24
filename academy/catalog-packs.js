// Keep stable lesson and item IDs when extending a pack.
export const catalogPacks = [
  { key: 'language-topics', name: 'Taalmodules', load: () => import('./language-lessons.js?v=14r3').then(m => m.languageLessons) },
  { key: 'core-history', name: 'Historische kernlessen', load: () => import('./history-curriculum.js?v=13r8').then(m => m.historicalLessons) },
  ...['greek', 'roman', 'history', 'knowledge', 'it', 'fr'].map(key => ({
    key, name: { greek: 'Griekse oudheid', roman: 'Romeinse oudheid', history: 'Algemene geschiedenis',
      knowledge: 'Algemene kennis', it: 'Italiaans', fr: 'Frans' }[key],
    url: new URL('./content/' + key + '.json?v=13r1', import.meta.url),
  })),
  { key: 'archive', name: 'Steden, bronnen en verdieping', load: () => import('./history-archive.js?v=13r10').then(m => m.historyArchive) },
  { key: 'aegean', name: 'De Egeïsche wereld en het Nabije Oosten', load: () => import('./content/history-aegean.js?v=160').then(m => m.aegeanLessons) },
  { key: 'carolingian', name: 'Karolingische geschiedenis', load: () => import('./content/history-carolingian.js?v=160').then(m => m.carolingianLessons) },
  { key: 'world-depth', name: 'Historische casussen en langere ontwikkelingen', load: () => import('./content/history-world-depth.js?v=160').then(m => m.worldDepthLessons) },
  { key: 'academic', name: 'Historische modules', load: () => import('./content/history-academic.js?v=14r3').then(m => m.academicHistory) },
  { key: 'connections', name: 'Mondiale geschiedenis', load: () => import('./content/history-connections.js?v=14r3').then(m => m.connectedHistory) },
  { key: 'city-paths', name: 'Stadsgeschiedenissen', load: () => import('./content/atlas-city-lessons.js?v=142').then(m => m.atlasCityLessons) },
  { key: 'traditions', name: 'Traditio', load: () => import('./content/traditio.js?v=14r3').then(m => m.TRADITIO_LESSONS) },
];
