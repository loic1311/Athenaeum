"""Rebuild the reviewed OpenHistoricalMap layer from relation geometries."""
from collections import defaultdict
import json
from pathlib import Path
import sys
from urllib.parse import urlencode
from urllib.request import urlopen

RELATIONS = {
    'karolingisch-rijk': [2806744, 2890536, 2890535],
    'midden-francie': [2806639],
    'west-francie': [2750107, 2890542, 2890642, 2890643, 2890645, 2805418],
    'opper-bourgondie': [2806708],
    'cordoba-emiraat': [2697816, 2849466],
}


def simplify(points, tolerance=0.07):
    if len(points) < 3:
        return points
    start_x, start_y = points[0]
    dx, dy = points[-1][0] - start_x, points[-1][1] - start_y
    length_squared = dx * dx + dy * dy

    def distance_squared(point):
        x, y = point[0] - start_x, point[1] - start_y
        t = max(0, min(1, (x * dx + y * dy) / length_squared)) if length_squared else 0
        return (x - t * dx) ** 2 + (y - t * dy) ** 2

    split = max(range(1, len(points) - 1), key=lambda i: distance_squared(points[i]))
    if distance_squared(points[split]) <= tolerance * tolerance:
        return [points[0], points[-1]]
    return simplify(points[:split + 1], tolerance)[:-1] + simplify(points[split:], tolerance)


def rings(members, role):
    ways = {}
    endpoints = defaultdict(set)
    for member in members:
        if member['type'] != 'way' or member['role'] != role:
            continue
        points = [(point['lon'], point['lat']) for point in member['geometry']]
        ways[member['ref']] = points
        endpoints[points[0]].add(member['ref'])
        endpoints[points[-1]].add(member['ref'])
    while ways:
        _, ring = ways.popitem()
        while ring[-1] != ring[0]:
            matches = endpoints[ring[-1]].intersection(ways)
            if len(matches) != 1:
                raise ValueError(f'Unclosed or ambiguous {role} ring at {ring[-1]}')
            tail = ways.pop(matches.pop())
            ring.extend(tail[1:] if tail[0] == ring[-1] else list(reversed(tail))[1:])
        yield ring


def area(ring):
    return sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(ring, ring[1:])) / 2


def contains(ring, point):
    x, y = point
    return sum((y1 > y) != (y0 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0
               for (x0, y0), (x1, y1) in zip(ring, ring[1:])) % 2


def generalize(ring, outer):
    points = simplify(ring)
    if len(points) < 4:
        if abs(area(ring)) < 0.001:
            return None
        points = ring
    # D3 uses clockwise outer rings for polygons below a hemisphere.
    if (area(points) < 0) != outer:
        points.reverse()
    return [[round(lon, 3), round(lat, 3)] for lon, lat in points]


def geometry(relation):
    if relation['tags'].get('license', 'CC0-1.0') not in ('CC0', 'CC0-1.0'):
        raise ValueError(f'Unlicensed relation {relation["id"]}')
    polygons = [[outer] for outer in rings(relation['members'], 'outer')]
    for inner in rings(relation['members'], 'inner'):
        parents = [polygon for polygon in polygons if contains(polygon[0], inner[0])]
        if parents:
            min(parents, key=lambda polygon: abs(area(polygon[0]))).append(inner)
        else:
            raise ValueError(f'Unassigned hole in relation {relation["id"]}')
    result = []
    for outer, *holes in polygons:
        border = generalize(outer, True)
        if border:
            result.append([border, *(points for hole in holes if (points := generalize(hole, False)))])
    if not result:
        raise ValueError(f'Empty geometry for {relation["id"]}')
    return {'type': 'MultiPolygon', 'coordinates': result}


def snapshot(id_):
    if len(sys.argv) > 1:
        text = (Path(sys.argv[1]) / f'relation-{id_}.json').read_text()
        return json.loads(text)['elements'][0]
    query = urlencode({'data': f'[out:json][timeout:25];relation({id_});out geom;'})
    with urlopen('https://overpass-api.openhistoricalmap.org/api/interpreter?' + query, timeout=30) as response:
        return json.load(response)['elements'][0]


def first_full_year(date):
    # Atlas years refer to the start of the calendar year. OHM uses ISO dates for day-level changes.
    year, *rest = date.split('-')
    return int(year) + int(bool(rest) and rest != ['01', '01'])


def build():
    features = []
    for key, ids in RELATIONS.items():
        for id_ in ids:
            row = snapshot(id_)
            tags = row['tags']
            start, end = (first_full_year(tags[key]) for key in ('start_date', 'end_date'))
            features.append({
                'type': 'Feature',
                'properties': {'entity': key, 'from': start, 'until': end, 'relation': id_},
                'geometry': geometry(row),
            })
    target = Path(__file__).resolve().parents[1] / 'academy/content/atlas-areas.json'
    target.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    build()
