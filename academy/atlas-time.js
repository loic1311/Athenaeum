import { HISTORICAL_ENTITIES } from './content/atlas-history.js?v=160';
import { fetchJson } from './fetch-json.js?v=142';

export const ATLAS_KINDS = { political: 'Politiek', culture: 'Cultureel', site: 'Vindplaatsen', network: 'Netwerken' };
export const ATLAS_REGIONS = ['Europa', 'Afrika', 'Azië', 'Amerika', 'Oceanië'];
const periodBounds = [-300000, -200000, -100000, -50000, -20000, -10000, -7500, -5000, -4000];
const range = (from, to, step) => Array.from({ length: Math.max(0, Math.floor((to - from) / step) + 1) }, (_, index) => from + index * step);
export const formatAtlasYear = year => year === null ? 'Nu' : Math.abs(year) + (year < 0 ? ' v.Chr.' : ' n.Chr.');

export function atlasTicks(span, center, current = new Date().getFullYear()) {
  if (span === 0) {
    return [...periodBounds, ...range(-3500, -2000, 250), ...range(-1900, -100, 100), -1, 1,
      ...range(100, 700, 100), ...range(750, 1900, 25), ...range(1910, current, 10), current, null]
      .filter((year, index, list) => index === 0 || year !== list[index - 1]);
  }
  const middle = center ?? current;
  return range(middle - span, Math.min(middle + span, Math.max(middle, current)), span > 25 ? 5 : 1)
    .filter(Boolean).concat(middle ?? []).sort((a, b) => a - b).filter((year, index, list) => year !== list[index - 1]);
}

export function atlasSnapshot(year, features = [], { region = '', kind = '', query = '' } = {}) {
  if (!Number.isInteger(year) || year === 0) return [];
  const key = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('nl');
  const search = key(query).trim().split(/\s+/u);
  const areas = new Map(features.filter(({ properties: { from, until } }) => year >= from && year < until)
    .map(feature => [feature.properties.entity, feature]));
  return HISTORICAL_ENTITIES.flatMap(entity => {
    if (region && region !== entity.region || kind && kind !== entity.kind ||
      !search.every(word => key(entity.name + ' ' + entity.region + ' ' + entity.text).includes(word))) return [];
    const period = entity.periods.find(([from, until]) => year >= from && year < until);
    return period ? [{ ...entity, period, area: areas.get(entity.id) }] : [];
  });
}

let request;
export function loadAtlasAreas(retry = false) {
  request ??= fetchJson(new URL('./content/atlas-areas.json?v=160', import.meta.url), { cache: retry ? 'reload' : 'default' })
    .then(data => {
      if (data?.type !== 'FeatureCollection' || !data.features?.length) throw new Error('AtlasAreas');
      return data.features;
    }).catch(error => { request = undefined; throw error; });
  return request;
}
