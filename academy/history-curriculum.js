import { greekStructure, romanStructure } from './content/history-antiquity.js?v=13r8';
import { medievalStructure } from './content/history-medieval.js?v=13r8';
import { earlyModernStructure } from './content/history-earlymodern.js?v=13r8';
import { worldStructure } from './content/history-world.js?v=13r8';

export const historicalLessons = [
  ...greekStructure, ...romanStructure, ...medievalStructure, ...earlyModernStructure, ...worldStructure,
];
