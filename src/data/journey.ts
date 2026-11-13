import { experience, type Experience } from './portfolio';

export type JourneyNodeId = 'independent' | 'teaching' | 'olx' | 'amazon' | 'capitec';

export type JourneyLink = {
  label: string;
  href: string;
  relationship: 'Capability' | 'Profile context';
};

export type JourneyNode = Experience & {
  id: JourneyNodeId;
  shortPeriod: string;
  x: number;
  y: number;
  chapter: string;
  related: readonly JourneyLink[];
};

const byCompany = new Map(experience.map((item) => [item.company, item]));
const role = (company: string): Experience => {
  const item = byCompany.get(company);
  if (!item) throw new Error(`Missing published experience for ${company}`);
  return item;
};

export const journeyNodes: readonly JourneyNode[] = [
  {
    ...role('Independent'),
    id: 'independent',
    shortPeriod: '2020',
    x: 12,
    y: 72,
    chapter: 'Own the whole delivery path',
    related: [
      { label: 'Full-stack product engineering', href: '/profile/#capabilities-title', relationship: 'Capability' },
      { label: 'About and delivery approach', href: '/profile/#about', relationship: 'Profile context' },
    ],
  },
  {
    ...role('Concore Academics · Walter Sisulu University'),
    id: 'teaching',
    shortPeriod: '2022',
    x: 30,
    y: 36,
    chapter: 'Make technical ideas understandable',
    related: [
      { label: 'Education and community work', href: '/profile/#about', relationship: 'Profile context' },
      { label: 'Languages and communication', href: '/profile/#about', relationship: 'Capability' },
    ],
  },
  {
    ...role('OLX'),
    id: 'olx',
    shortPeriod: '2023',
    x: 48,
    y: 66,
    chapter: 'Work across product and platform layers',
    related: [
      { label: 'Full-stack product engineering', href: '/profile/#capabilities-title', relationship: 'Capability' },
      { label: 'Data and performance', href: '/profile/#capabilities-title', relationship: 'Capability' },
    ],
  },
  {
    ...role('Amazon'),
    id: 'amazon',
    shortPeriod: '2025',
    x: 68,
    y: 34,
    chapter: 'Operate distributed infrastructure safely',
    related: [
      { label: 'Cloud and delivery', href: '/profile/#capabilities-title', relationship: 'Capability' },
      {
        label: 'Observability and incident response',
        href: '/profile/#capabilities-title',
        relationship: 'Capability',
      },
    ],
  },
  {
    ...role('Capitec Bank'),
    id: 'capitec',
    shortPeriod: 'Now',
    x: 88,
    y: 18,
    chapter: 'Build dependable financial product services',
    related: [
      { label: 'Back-end systems', href: '/profile/#capabilities-title', relationship: 'Capability' },
      { label: 'Data and performance', href: '/profile/#capabilities-title', relationship: 'Capability' },
    ],
  },
];

export const journeyProjectLinks = [
  { label: 'Missing Children SA', href: '/work/missing-children-sa/' },
  { label: 'Fraud Rule Engine', href: '/work/fraud-rule-engine/' },
  { label: 'Agent Activity Risk Monitor', href: '/work/agent-risk-monitor/' },
  { label: 'ShelfIQ', href: '/work/shelfiq/' },
] as const;

export function selectJourneyNode(id: string): JourneyNode {
  return journeyNodes.find((node) => node.id === id) ?? journeyNodes.at(-1)!;
}
