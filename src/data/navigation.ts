export type PortfolioRouteId = 'home' | 'work' | 'journey' | 'profile' | 'guide';

export type PortfolioRoute = {
  id: PortfolioRouteId;
  number: string;
  label: string;
  href: string;
  description: string;
};

export const portfolioRoutes: readonly PortfolioRoute[] = [
  {
    id: 'home',
    number: '00',
    label: 'Home',
    href: '/',
    description: 'Start from the portfolio hub.',
  },
  {
    id: 'work',
    number: '01',
    label: 'Work',
    href: '/work/',
    description: 'Explore systems, case studies, and project labs.',
  },
  {
    id: 'journey',
    number: '02',
    label: 'Journey',
    href: '/journey/',
    description: 'Follow the roles and problems behind the career.',
  },
  {
    id: 'profile',
    number: '03',
    label: 'Profile',
    href: '/profile/',
    description: 'Read capabilities, education, credentials, and contact details.',
  },
  {
    id: 'guide',
    number: '04',
    label: 'Guide',
    href: '/guide/',
    description: 'Ask focused questions and follow each answer to its source.',
  },
] as const;
