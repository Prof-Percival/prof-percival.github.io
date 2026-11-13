import { describe, expect, it } from 'vitest';

import { site } from './site';

describe('site metadata', () => {
  it('uses secure public URLs', () => {
    expect(new URL(site.url).protocol).toBe('https:');
    expect(new URL(site.links.github).protocol).toBe('https:');
    expect(site.links.linkedin).toBe('https://za.linkedin.com/in/prof-percival');
    expect(site.links.linkedinCertifications).toBe('https://www.linkedin.com/in/prof-percival/details/certifications/');
  });

  it('uses the dedicated Formspree form endpoint', () => {
    const endpoint = new URL(site.contact.formspreeEndpoint);

    expect(endpoint.protocol).toBe('https:');
    expect(endpoint.hostname).toBe('formspree.io');
    expect(endpoint.pathname).toMatch(/^\/f\/[a-z]+$/);
  });

  it('keeps the resume on this site', () => {
    expect(site.links.resume).toMatch(/^\/[^/]/);
  });
});
