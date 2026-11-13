import { describe, expect, it } from 'vitest';

import { missingWorkflowStages, selectMissingWorkflowStage } from './missing-workflow';

describe('Missing Children workflow', () => {
  it('keeps publication behind moderation and approval', () => {
    expect(missingWorkflowStages.map((stage) => stage.id)).toEqual([
      'submission',
      'moderation',
      'approval',
      'api',
      'listing',
    ]);
  });

  it('returns progress and boundary state for a selected stage', () => {
    expect(selectMissingWorkflowStage(0)).toMatchObject({ index: 0, progress: 20, isFirst: true, isLast: false });
    expect(selectMissingWorkflowStage(4)).toMatchObject({ index: 4, progress: 100, isFirst: false, isLast: true });
  });

  it('clamps invalid and out-of-range positions', () => {
    expect(selectMissingWorkflowStage(Number.NaN).index).toBe(0);
    expect(selectMissingWorkflowStage(-10).index).toBe(0);
    expect(selectMissingWorkflowStage(99).index).toBe(4);
    expect(selectMissingWorkflowStage(2.8).index).toBe(2);
  });
});
