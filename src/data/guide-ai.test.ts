import { describe, expect, it } from 'vitest';

import { guideAnswers } from './guide';
import {
  cosineSimilarity,
  createGuideAiDocuments,
  localAiModel,
  rankGuideEmbeddings,
  type EmbeddedGuideAnswer,
} from './guide-ai';

describe('local portfolio guide ranking', () => {
  it('builds model documents from the same curated answer corpus', () => {
    const documents = createGuideAiDocuments(guideAnswers);

    expect(documents).toHaveLength(guideAnswers.length);
    expect(documents[0]).toMatchObject({ id: guideAnswers[0]?.id });
    expect(documents[0]?.text).toContain(guideAnswers[0]?.prompt);
    expect(documents[0]?.text).toContain(guideAnswers[0]?.answer);
  });

  it('pins a compact, licensed model revision', () => {
    expect(localAiModel.id).toBe('Xenova/all-MiniLM-L6-v2');
    expect(localAiModel.revision).toMatch(/^[0-9a-f]{40}$/);
    expect(localAiModel.dtype).toBe('int8');
    expect(localAiModel.approximateDownloadMb).toBe(39);
    expect(localAiModel.license).toBe('Apache 2.0');
  });

  it('calculates cosine similarity safely', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1], [1, 0])).toBe(0);
  });

  it('ranks strong semantic matches and preserves corpus order for ties', () => {
    const candidates: EmbeddedGuideAnswer[] = [
      { id: 'engineering-approach', embedding: [0.8, 0.2] },
      { id: 'featured-system', embedding: [0, 1] },
      { id: 'cloud-delivery', embedding: [1, 0] },
      { id: 'experience', embedding: [0.8, 0.2] },
    ];

    expect(rankGuideEmbeddings([1, 0], candidates, 3, 0.5).map((result) => result.id)).toEqual([
      'cloud-delivery',
      'engineering-approach',
      'experience',
    ]);
  });

  it('filters weak matches and handles empty result limits', () => {
    const candidates: EmbeddedGuideAnswer[] = [{ id: 'contact', embedding: [0, 1] }];

    expect(rankGuideEmbeddings([1, 0], candidates)).toEqual([]);
    expect(rankGuideEmbeddings([], candidates)).toEqual([]);
    expect(rankGuideEmbeddings([1, 0], candidates, 0)).toEqual([]);
  });
});
