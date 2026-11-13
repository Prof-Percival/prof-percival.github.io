import { describe, expect, it } from 'vitest';

import { experience } from './portfolio';
import { journeyNodes, journeyProjectLinks, selectJourneyNode } from './journey';

describe('connected career journey', () => {
  it('includes every published role once from earliest start to current', () => {
    expect(journeyNodes.map((node) => node.id)).toEqual(['independent', 'teaching', 'olx', 'amazon', 'capitec']);
    expect(new Set(journeyNodes.map((node) => node.company))).toEqual(new Set(experience.map((item) => item.company)));
  });

  it('keeps map positions bounded and current role unique', () => {
    expect(journeyNodes.every((node) => node.x >= 0 && node.x <= 100 && node.y >= 0 && node.y <= 100)).toBe(true);
    expect(journeyNodes.filter((node) => node.current)).toHaveLength(1);
  });

  it('keeps portfolio projects separate from employer role details', () => {
    expect(journeyNodes.flatMap((node) => node.related).every((link) => link.href.startsWith('/profile/'))).toBe(true);
    expect(journeyProjectLinks.map((link) => link.label)).toEqual([
      'Missing Children SA',
      'Fraud Rule Engine',
      'Agent Activity Risk Monitor',
      'ShelfIQ',
    ]);
    expect(journeyProjectLinks.every((link) => link.href.startsWith('/work/'))).toBe(true);
  });

  it('selects a requested role and defaults to the current role', () => {
    expect(selectJourneyNode('amazon').id).toBe('amazon');
    expect(selectJourneyNode('unknown').id).toBe('capitec');
  });
});
