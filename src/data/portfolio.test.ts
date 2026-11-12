import { describe, expect, it } from 'vitest';

import { earlierProjects, experience, missingChildrenCaseStudy } from './portfolio';

describe('portfolio content', () => {
  it('has one current role with the requested title', () => {
    const current = experience.filter((item) => item.current);

    expect(current).toHaveLength(1);
    expect(current[0]).toMatchObject({
      company: 'Capitec Bank',
      role: 'Software Engineer: Back-End',
      period: 'December 2026 to Present',
    });
  });

  it('does not use level suffixes in public role titles', () => {
    expect(experience.map((item) => item.role).join(' ')).not.toMatch(/\b(?:II|Level 2)\b/);
  });

  it('includes every project from the previous portfolio once', () => {
    expect(earlierProjects.map((project) => project.id)).toEqual(['sic', 'mmea', 'crs', 'contacts', 'matrix']);
    expect(new Set(earlierProjects.map((project) => project.title)).size).toBe(earlierProjects.length);
  });

  it('keeps the selected case study focused on the connected product suite', () => {
    expect(missingChildrenCaseStudy.slug).toBe('missing-children-sa');
    expect(missingChildrenCaseStudy.surfaces.map((surface) => surface.label)).toEqual(['API', 'Desktop', 'Mobile']);
    expect(missingChildrenCaseStudy.decisions).toHaveLength(4);
  });
});
