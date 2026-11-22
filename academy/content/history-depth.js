import { earlyDepth } from './history-depth-early.js?v=13r9';
import { modernDepth } from './history-depth-modern.js?v=13r9';
import { lateDepth } from './history-depth-late.js?v=13r9';
import { regionalDepth } from './history-depth-regions.js?v=13r9';

export const expandedHistory = [...earlyDepth, ...modernDepth, ...lateDepth, ...regionalDepth];
