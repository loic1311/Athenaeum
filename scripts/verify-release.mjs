import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalogPacks } from '../academy/catalog-packs.js';
import { byLessonId } from '../academy/catalog.js';
import { ATLAS_PLACES, historicalName, readAtlasYear } from '../academy/atlas-catalog.js';
import { atlasPage } from '../academy/atlas-view.js';
import { parseChronologyDate, chronologyPage, eraPage } from '../academy/history-timeline.js';
import { CHRONOLOGY_EVENTS } from '../academy/content/chronology-events.js';
import { APP_NAV, NAV, studyHub } from '../academy/views.js';
import { editGreek, classicalCourse } from '../academy/classical-view.js';
import { historyOf, isCorrect, makePool } from '../academy/learning.js';
import { progressOverview } from '../academy/progress-overview.js';
import { TRADITIO_LESSONS, TRADITIONS } from '../academy/content/traditio.js';
import { traditioPage, traditioExamQuestions } from '../academy/traditio.js';
import { weeklyExamQuestions, weeklyStudy } from '../academy/weekly-exam.js';

const rows = (await Promise.all(catalogPacks.map(pack =>
  pack.url ? readFile(pack.url,'utf8').then(JSON.parse) : pack.load()))).flat();
const lessons = new Map(rows.map(row => [row.id,row]));
assert.equal(rows.length, lessons.size, 'Elke les heeft een unieke sleutel.');
assert.deepEqual(new Set(byLessonId.keys()),new Set(lessons.keys()), 'De zoekindex bevat precies de lescatalogus.');
const counts = entries => Object.fromEntries(Object.entries(Object.groupBy(entries,x=>x.track)).map(([key,list])=>[key,list.length]));
let baseline = [];
if (process.argv[2]) {
  const root = pathToFileURL(resolve(process.argv[2]) + '/');
  const content = file => readFile(new URL('academy/content/' + file + '.json',root),'utf8').then(JSON.parse);
  const file = name => import(new URL('academy/' + name + '.js',root));
  baseline = [
    ...((await Promise.all(['history','roman','greek','knowledge','it','fr'].map(content))).flat()),
    ...(await file('history-archive')).historyArchive,
    ...(await file('history-curriculum')).historicalLessons,
    ...(await file('language-lessons')).languageLessons,
  ];
  for (const previous of baseline) {
    const current = lessons.get(previous.id);
    assert.equal(current?.track, previous.track, previous.id);
    assert.deepEqual(current.items.map(item=>item.id),previous.items.map(item=>item.id),previous.id + ' leerdoelen');
  }
}
const established = new Set(baseline.map(row=>row.id));
const addition = rows.filter(row=>!established.has(row.id));
for (const lesson of rows) {
  assert(lesson.title && lesson.summary && lesson.items.length, lesson.id);
  assert.equal(new Set(lesson.items.map(goal=>goal.id)).size,lesson.items.length,lesson.id);
  for (const item of lesson.items) {
    if (item.source !== undefined) assert(lesson.sources?.[item.source], lesson.id + '/' + item.id);
    for (const q of item.questions) {
      assert(q.text && typeof q.answer === 'string' && q.answer, lesson.id + '/' + item.id);
      if (q.kind === 'choice') assert.equal(q.options.filter(answer=>answer===q.answer).length,1,lesson.id);
      if (q.kind === 'order') assert(q.parts.length > 1,lesson.id);
    }
  }
}
for (const active of rows.filter(lesson=>/^acad-|^atlas-stad-|^trad-|^tr-|^(la|grc)-/.test(lesson.id))) {
  assert(active.sources?.length,active.id + ' bron');
  assert(active.sources.every(source => source.title && /^https:\/\//.test(source.url ?? '')),active.id + ' bronlink');
}
assert.equal(new Set(ATLAS_PLACES.map(place=>place.id)).size,ATLAS_PLACES.length);
const atlasPaths = [];
for (const place of ATLAS_PLACES) {
  assert(Math.abs(place.coordinates[0])<=180 && Math.abs(place.coordinates[1])<=90,place.id);
  const matching = place.lessons.filter(id=>lessons.has(id));
  assert(matching.length,place.id + ' heeft een werkende les.');
  for (const [from,to,name] of place.windows) {
    assert(Number.isInteger(from) && from !== 0 && name, place.id);
    assert(to === null || (Number.isInteger(to) && to !== 0 && from <= to), place.id);
  }
  atlasPaths.push([place.id,matching.length]);
}
assert.equal(readAtlasYear('100 n.Chr.'),100);
assert.equal(readAtlasYear('44 v.Chr.'),-44);
assert(Number.isNaN(readAtlasYear('0')));
assert.match(historicalName(ATLAS_PLACES.find(p=>p.id==='marseille'),100),/Massilia/i);
assert.equal(historicalName(ATLAS_PLACES.find(p=>p.id==='marseille'),2100),'Marseille');
assert.equal(historicalName(ATLAS_PLACES.find(p=>p.id==='marseille'),900),undefined);
assert.equal(historicalName(ATLAS_PLACES.find(p=>p.id==='pompeii'),2100),undefined);
const empty = new Set();
for (const place of ['parijs','toulouse','marseille','madrid','barcelona','gent']) {
  assert(atlasPage(rows,'alles',place,empty,empty).includes('Uitgebreid studeren'),place);
}
for (const event of CHRONOLOGY_EVENTS) {
  assert(event.from !== 0 && /^https:\/\//.test(event.source?.[2]),event.id);
  assert(event.lessons.some(id=>lessons.has(id)),event.id + ' koppeling');
}
assert.deepEqual(parseChronologyDate('44 v.Chr.'),{from:-44,to:-44});
assert.deepEqual(parseChronologyDate('125 n.Chr.'),{from:125,to:125});
assert.deepEqual(parseChronologyDate('500–400 v.Chr.'),{from:-500,to:-400});
assert.deepEqual(parseChronologyDate('1 v.Chr.–1 n.Chr.'),{from:-1,to:1});
assert.deepEqual(parseChronologyDate('0'),{error:true});
for (const [query,pattern] of [
  ['44 v.Chr.',/Senatoren vermoorden Caesar/], ['125 n.Chr.',/Hadrianus antwoordt Aphrodisias/],
  ['1302',/Guldensporenslag/], ['Romeinse burgeroorlogen',/Caesar/],
  ['Perzische oorlogen',/Marathon/],['Eerste Wereldoorlog',/verklaart Servië de oorlog/],
  ['Haïtiaanse revolutie',/Haïti verklaart zijn onafhankelijkheid/],
]) assert.match(chronologyPage(rows,empty,empty,'alles','alle',new URLSearchParams({q:query}).toString()),pattern,query);
assert.match(eraPage(rows,'alles','',empty,empty),/Chronologia/);

assert.deepEqual(NAV.map(row=>row[0]),['vandaag','zoeken','paideia','talen','toetsen','meer']);
assert.deepEqual(APP_NAV.map(row=>row[0]),['paideia','talen','scriptorium','traditio']);
const now = +new Date(2026,10,23,12);
const read = new Set(['acad-iden','trad-yusuf-put']);
const records = [...read].map(id=>({id:'history-read-'+id,kind:'prefs',at:now-100,data:{name:'history-read',lesson:id,value:true}}));
const week = weeklyStudy(rows,records,now);
assert.deepEqual(new Set(week.lessons.map(row=>row.id)),read);
assert(weeklyExamQuestions(week,historyOf(records),true).every(question=>read.has(question.lesson)));
const metrics = progressOverview(rows,records,historyOf(records),read,{},null,null,new Date(now));
assert(metrics.byTrack.roman.studied===1 && metrics.byTrack.traditio.studied===1 && metrics.retained===0);
assert.match(studyHub(metrics),/Chronologia/);

for (const track of ['la','grc']) {
  const course = rows.filter(lesson=>lesson.track===track);
  assert(course.length>15);
  assert(classicalCourse(track,rows).includes(course[0].title));
  assert(makePool(course).some(goal=>goal.questions.some(q=>q.kind==='open')));
}
assert.equal(isCorrect({answer:'λόγος',kind:'fill',language:'grc'},'λόγος'),true);
assert.equal(editGreek('α',1,1,'\u0301').value.normalize('NFC'),'ά');

const traditionTotals = {};
for (const tradition of TRADITIONS) {
  const stories = TRADITIO_LESSONS.filter(story=>story.tradition===tradition.id);
  assert(stories.length>=2,tradition.id);
  traditionTotals[tradition.id] = stories.length;
  assert(traditioPage(tradition.id).includes('Verhaallijnen'));
  assert(traditioPage(tradition.id,stories[0].id).includes('Bronnen en overlevering'));
  assert(traditioExamQuestions(tradition.id).some(question=>question.kind==='open'));
  for (const lesson of stories) {
    assert(lesson.sources.length && lesson.stages.length>=3 && lesson.reading,lesson.id);
    assert(lesson.ties.every(([, , , , index])=>lesson.sources[index]),lesson.id);
  }
}
assert.match(traditioPage('griekenland','figuur','Zeus'),/Kronos/);
console.log(JSON.stringify({
  catalogue: counts(rows), retained: counts(baseline), added: baseline.length ? counts(addition) : undefined,
  totalLessons: rows.length, originalQuestions: rows.reduce((n,l)=>n+l.items.reduce((m,i)=>m+i.questions.length,0),0),
  atlasLocations: atlasPaths.length, atlasPaths, events: CHRONOLOGY_EVENTS.length, traditionTotals,
  narrativeCycles: new Set(TRADITIO_LESSONS.map(story=>story.tradition + '/' + story.cycle)).size,
},null,2));
