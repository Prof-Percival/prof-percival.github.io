import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { site } from './site';

describe('site metadata', () => {
  it('uses secure public URLs', () => {
    expect(new URL(site.url).protocol).toBe('https:');
    expect(new URL(site.links.github).protocol).toBe('https:');
    expect(site.links.linkedin).toBe('https://za.linkedin.com/in/prof-percival');
  });

  it('uses the dedicated Formspree form endpoint', () => {
    const endpoint = new URL(site.contact.formspreeEndpoint);

    expect(endpoint.protocol).toBe('https:');
    expect(endpoint.hostname).toBe('formspree.io');
    expect(endpoint.pathname).toMatch(/^\/f\/[a-z]+$/);
  });

  it('routes document requests through the contact form', () => {
    expect(Object.values(site.links).some((link) => link.toLowerCase().endsWith('.pdf'))).toBe(false);
    expect(site.contact.cvRequestUrl).toBe('/profile/?subject=cv-request#contact');
  });

  it('keeps PDF documents out of public assets', () => {
    const publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url));

    expect(globSync('**/*.pdf', { cwd: publicDirectory })).toEqual([]);
  });
});
