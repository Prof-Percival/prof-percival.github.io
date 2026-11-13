import { describe, expect, it } from 'vitest';

import {
  certifications,
  earlierProjects,
  experience,
  languages,
  linkedInCertificationCount,
  missingChildrenCaseStudy,
} from './portfolio';

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

  it('publishes eight recent and ten complementary certifications', () => {
    const recent = certifications.filter((credential) => credential.group === 'recent');
    const selected = certifications.filter((credential) => credential.group === 'selected');

    expect(linkedInCertificationCount).toBe(114);
    expect(certifications).toHaveLength(18);
    expect(recent).toHaveLength(8);
    expect(selected).toHaveLength(10);
    expect(recent.map((credential) => credential.issuedAt)).toEqual(
      [...recent]
        .map((credential) => credential.issuedAt)
        .sort()
        .reverse()
    );
    expect(recent.map((credential) => credential.title)).toEqual([
      'From Prototype toward Production with AgentCore',
      'AI Literacy',
      'Building Generative AI Solutions - OLX',
      'Introduction to OpenAI API & ChatGPT API for Developers',
      'ALX AI Career Essentials',
      'ALX Software Engineering',
      'OMET Peer Buddy Leadership',
      'Tech for Everyone',
    ]);
    expect(new Set(certifications.map((credential) => `${credential.title}:${credential.issuer}`)).size).toBe(18);
    expect(certifications.every((credential) => !('url' in credential) || credential.url.startsWith('https://'))).toBe(
      true
    );
    expect(certifications.every((credential) => credential.category.length > 0)).toBe(true);
    expect(selected.map((credential) => credential.title)).toEqual(
      expect.arrayContaining([
        'Java',
        'Data Science Foundations - Level 1',
        'Data Science Tools',
        'Python Essentials 1',
        'Introduction to Cybersecurity',
      ])
    );
  });

  it('keeps the language list unique', () => {
    expect(new Set(languages.map((language) => language.name)).size).toBe(languages.length);
  });
});
