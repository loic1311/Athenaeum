import { marseilleHistory } from './content/history-marseille.js?v=13r9';
import { cityHistory } from './content/history-cities.js?v=13r9';
import { primaryHistory } from './content/history-primary.js?v=13r9';
import { expandedHistory } from './content/history-depth.js?v=13r9';

import { westernCityHistory } from './content/history-western-cities.js?v=13r10';

export const historyArchive = [...marseilleHistory, ...cityHistory, ...westernCityHistory, ...primaryHistory, ...expandedHistory];
