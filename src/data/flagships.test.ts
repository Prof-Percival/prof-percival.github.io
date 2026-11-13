import { describe, expect, it } from 'vitest';

import { agentRiskMonitorCaseStudy, fraudRuleEngineCaseStudy, missingChildrenChapters } from './flagships';

const expectedChapters = ['problem', 'constraints', 'architecture', 'decisions', 'evidence', 'limits'];

describe('flagship case-study content', () => {
  it('uses the same complete guided chapter sequence for every flagship', () => {
    for (const chapters of [
      missingChildrenChapters,
      fraudRuleEngineCaseStudy.chapters,
      agentRiskMonitorCaseStudy.chapters,
    ]) {
      expect(chapters.map((chapter) => chapter.id)).toEqual(expectedChapters);
    }
  });

  it('keeps private source status explicit without publishing repository destinations', () => {
    expect(fraudRuleEngineCaseStudy.sourceLabel).toBe('Private source');
    expect(agentRiskMonitorCaseStudy.sourceLabel).toBe('Private source');
    expect(fraudRuleEngineCaseStudy).not.toHaveProperty('repository');
    expect(agentRiskMonitorCaseStudy).not.toHaveProperty('repository');
  });

  it('keeps the two new routes stable and distinct', () => {
    expect(fraudRuleEngineCaseStudy.slug).toBe('fraud-rule-engine');
    expect(agentRiskMonitorCaseStudy.slug).toBe('agent-risk-monitor');
    expect(fraudRuleEngineCaseStudy.decisions).toHaveLength(4);
    expect(agentRiskMonitorCaseStudy.decisions).toHaveLength(4);
  });
});
