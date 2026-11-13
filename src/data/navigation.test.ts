import { describe, expect, it } from 'vitest';

import { portfolioRoutes } from './navigation';

describe('portfolio navigation', () => {
  it('keeps route ids, numbers, and destinations unique', () => {
    expect(new Set(portfolioRoutes.map((route) => route.id)).size).toBe(portfolioRoutes.length);
    expect(new Set(portfolioRoutes.map((route) => route.number)).size).toBe(portfolioRoutes.length);
    expect(new Set(portfolioRoutes.map((route) => route.href)).size).toBe(portfolioRoutes.length);
  });

  it('uses root-relative canonical route destinations', () => {
    expect(portfolioRoutes[0]).toMatchObject({ id: 'home', href: '/' });
    expect(portfolioRoutes.every((route) => route.href.startsWith('/'))).toBe(true);
    expect(portfolioRoutes.every((route) => !route.href.includes('#'))).toBe(true);
  });
});
