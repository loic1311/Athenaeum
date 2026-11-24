import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const container = process.env.ATHENAEUM_POSTGRES_CONTAINER;
if (!container || !/^[a-f0-9]{12,64}$/.test(container)) {
  throw new Error('Gebruik uitsluitend de tijdelijke PostgreSQL-container voor regressietests.');
}

function command(tool, args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['exec', '-i', container, tool, ...args], { stdio:['pipe','pipe','pipe'] });
    let output = '', errors = '';
    child.stdout.setEncoding('utf8').on('data', part => { output += part; });
    child.stderr.setEncoding('utf8').on('data', part => { errors += part; });
    child.once('error', reject);
    child.stdin.on('error', reject);
    child.once('close', code => code === 0 ? resolve(output.trim()) : reject(new Error(tool + ': ' + errors.trim())));
    child.stdin.end(input);
  });
}

function sql(query, database = 'athenaeum_fixture') {
  return command('psql', ['-X','-U','postgres','-d',database,'-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=terse'], query);
}

const profiles = Array.from({ length:5 }, (_, index) => '00000000-0000-4000-8000-00000000000' + (index + 1));
const rowsPerProfile = 40;
const learner = (profile, query, database) => sql(`
  begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '${profile}';
  set local application_name = 'athenaeum-fixture-${profile.at(-1)}';
  ${query}
  commit;
`, database);
const isolation = `select count(*), bool_and(user_id = auth.uid()), bool_and(payload->>'profile' = auth.uid()::text)
  from public.athenaeum_learning;`;

test('Leeropslag isoleert vijf gelijktijdige profielen en kan uit een backup herstellen', { timeout:30_000 }, async () => {
  const files = ['20261121174406_athenaeum_learning.sql','20261123210000_uncap_learning_history.sql'];
  const migrations = await Promise.all(files.map(file => readFile(new URL('../supabase/migrations/' + file, import.meta.url), 'utf8')));
  await sql(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid stable language sql as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
    insert into auth.users values ${profiles.map(profile => "('" + profile + "')").join(',')};
    ${migrations.join('\n')}
  `);

  const saves = await Promise.allSettled(profiles.map((profile, index) => learner(profile, `
    select public.athenaeum_save_learning(jsonb_agg(jsonb_build_object(
      'record_id', 'goal-' || goal,
      'kind', 'review',
      'changed_ms', 1760000000000 + goal,
      'payload', jsonb_build_object('profile', auth.uid(), 'grade', 'new')
    ))) from generate_series(1,${rowsPerProfile}) as goal;
    reset role;
    select pg_sleep(${0.8 + index * 0.02});
    select count(*) from pg_stat_activity
      where application_name like 'athenaeum-fixture-%' and state = 'active';
  `)));
  for (const result of saves) if (result.status === 'rejected') throw result.reason;
  assert.equal(Math.max(...saves.map(result => Number(result.value))), 5, 'Alle vijf verbindingen waren gelijktijdig actief.');

  const observed = await Promise.all(profiles.map(profile => learner(profile, isolation)));
  assert.deepEqual(observed, profiles.map(() => rowsPerProfile + '|t|t'));
  assert.equal(await sql(`select has_table_privilege('anon','public.athenaeum_learning','SELECT'),
    has_table_privilege('authenticated','public.athenaeum_learning','UPDATE'),
    has_function_privilege('anon','public.athenaeum_save_learning(jsonb)','EXECUTE');`), 'f|f|f');

  const stale = await learner(profiles[0], `
    select public.athenaeum_save_learning(jsonb_build_array(jsonb_build_object(
      'record_id','goal-1','kind','review','changed_ms',1760000000000,
      'payload',jsonb_build_object('profile',auth.uid(),'grade','stale')
    )));
    select payload->>'grade' from public.athenaeum_learning where record_id='goal-1';
  `);
  assert.equal(stale, 'new');

  await assert.rejects(learner(profiles[0], `
    select public.athenaeum_save_learning(jsonb_build_array(jsonb_build_object(
      'record_id','oversized','kind','deck','changed_ms',1760000000099,
      'payload',jsonb_build_object('content',repeat('x',260000))
    )));
  `), /check constraint/);

  const dump = await command('pg_dump', ['-U','postgres','-d','athenaeum_fixture']);
  await sql('create database athenaeum_restore_fixture;');
  await sql(dump, 'athenaeum_restore_fixture');
  const restored = await Promise.all(profiles.map(profile => learner(profile, isolation,'athenaeum_restore_fixture')));
  assert.deepEqual(restored, observed);
  assert.equal(await sql('select count(*) from public.athenaeum_learning;', 'athenaeum_restore_fixture'), String(profiles.length * rowsPerProfile));
});
