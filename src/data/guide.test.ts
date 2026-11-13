import { describe, expect, it } from 'vitest';

import { findGuideAnswers, guideAnswers, normalizeGuideText, suggestedGuideAnswerIds } from './guide';

describe('verified portfolio guide', () => {
  it('normalizes case, spacing, punctuation, and accents', () => {
    expect(normalizeGuideText('  C# and .NET APIs!  ')).toBe('c# and net apis');
    expect(normalizeGuideText('Café   systems')).toBe('cafe systems');
  });

  it('keeps answer ids and source destinations unique', () => {
    expect(new Set(guideAnswers.map((answer) => answer.id)).size).toBe(guideAnswers.length);
    expect(new Set(guideAnswers.map((answer) => answer.sourceHref)).size).toBeGreaterThan(3);
    expect(guideAnswers.every((answer) => answer.sourceHref.startsWith('/'))).toBe(true);
    expect(suggestedGuideAnswerIds.every((id) => guideAnswers.some((answer) => answer.id === id))).toBe(true);
  });

  it('puts an exact suggested question first', () => {
    const results = findGuideAnswers('What kind of engineer is Phadima?');

    expect(results[0]?.id).toBe('engineering-approach');
  });

  it('ranks matching keywords from several terms', () => {
    expect(findGuideAnswers('AWS fleet orchestration')[0]?.id).toBe('cloud-delivery');
    expect(findGuideAnswers('backend APIs PostgreSQL')[0]?.id).toBe('back-end');
    expect(findGuideAnswers('Sepedi and Setswana')[0]?.id).toBe('languages');
    expect(findGuideAnswers('transaction fraud scoring')[0]?.id).toBe('fraud-rule-engine');
    expect(findGuideAnswers('agent activity alerts')[0]?.id).toBe('agent-risk-monitor');
  });

  it('respects the requested result limit', () => {
    expect(findGuideAnswers('software systems data', 2)).toHaveLength(2);
    expect(findGuideAnswers('software systems data', 0)).toEqual([]);
  });

  it('returns no answer for empty, filler-only, or unrelated questions', () => {
    expect(findGuideAnswers('')).toEqual([]);
    expect(findGuideAnswers('what is the')).toEqual([]);
    expect(findGuideAnswers('quantum gardening')).toEqual([]);
  });
});
