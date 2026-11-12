export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
  current?: boolean;
};

export type EarlierProject = {
  id: 'sic' | 'mmea' | 'crs' | 'contacts' | 'matrix';
  title: string;
  period: string;
  summary: string;
  stack: string[];
  alt: string;
};

export const experience: Experience[] = [
  {
    company: 'Capitec Bank',
    role: 'Software Engineer: Back-End',
    period: 'December 2026 to Present',
    location: 'Cape Town, South Africa',
    current: true,
    summary:
      'Building the services behind credit estimates and purpose lending across Capitec’s web and mobile banking journeys.',
    highlights: [
      'Design and maintain back-end systems that translate complex credit journeys into clear, reusable capabilities.',
      'Contribute to purpose-lending products and the migration from legacy services to modern platforms.',
      'Improve APIs, shared libraries, SQL queries, and data models with reliability and scale in mind.',
      'Own quality through automated testing, CI/CD, secure coding, and production debugging.',
    ],
    stack: ['C#', '.NET Core', 'AWS', 'SQL', 'CI/CD', 'DevSecOps'],
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer, EC2',
    period: 'September 2025 to November 2026',
    location: 'Cape Town, South Africa',
    summary:
      'Built services, self-service APIs, and event-driven orchestration for EC2 fleet operations, with an emphasis on safe infrastructure lifecycle workflows and evidence-led operations.',
    highlights: [
      'Engineered orchestration for fleet provisioning, maintenance, patching, and infrastructure lifecycle changes at scale.',
      'Developed self-service APIs and abstraction layers that reduced host-management work for internal product teams.',
      'Modelled fleet health and operational state in data structures designed for high-throughput, low-latency access.',
      'Supported identity governance, access control, and audit logging across distributed infrastructure.',
      'Diagnosed live-site issues through logs, metrics, alarms, deployment evidence, and source behavior, then reduced repeat work through automation and documentation.',
    ],
    stack: ['Java', 'Python', 'Ruby', 'AWS', 'DynamoDB', 'Observability'],
  },
  {
    company: 'OLX',
    role: 'Software Engineer',
    period: 'February 2023 to August 2025',
    location: 'South Africa · Remote',
    summary:
      'Delivered and maintained full-stack product capabilities across web applications, services, search, caching, and data.',
    highlights: [
      'Turned business requirements into maintainable software through analysis, design, implementation, and testing.',
      'Investigated defects and performance problems across application and data layers.',
      'Contributed to technical research and iterative delivery in an Agile team.',
    ],
    stack: ['C#', 'ASP.NET Core', 'React', 'Node.js', 'TypeScript', 'SQL Server', 'Redis', 'Elasticsearch', 'Azure'],
  },
  {
    company: 'Independent',
    role: 'Freelance Software Developer',
    period: 'January 2020 to August 2025',
    location: 'South Africa · Hybrid',
    summary: 'Designed, delivered, tested, and maintained tailored web, desktop, and mobile software for clients.',
    highlights: [
      'Worked directly with clients to clarify needs and turn them into usable software.',
      'Owned delivery across interface, service, data, testing, and post-launch maintenance.',
    ],
    stack: ['C#', 'Java', 'TypeScript', 'React', 'ASP.NET Core', 'Node.js', 'SQL', 'Azure'],
  },
  {
    company: 'Concore Academics · Walter Sisulu University',
    role: 'Tutor and PAL Leader',
    period: 'March 2022 to August 2025',
    location: 'South Africa · Hybrid',
    summary:
      'Taught programming and facilitated peer learning, helping students turn foundational concepts into working software.',
    highlights: [
      'Planned and facilitated programming sessions for Development Software I.',
      'Explained technical ideas across different experience and language backgrounds.',
    ],
    stack: ['Teaching', 'Mentoring', 'Programming fundamentals', 'Communication'],
  },
];

export const capabilityGroups = [
  {
    number: '01',
    title: 'Full-stack product engineering',
    summary: 'From a user journey and browser interface through service boundaries, data, and release.',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'API integration'],
  },
  {
    number: '02',
    title: 'Back-end systems',
    summary:
      'Explicit domain models, stable APIs, secure boundaries, and code that remains understandable under change.',
    skills: ['C#', '.NET', 'Java', 'Python', 'REST APIs', 'Domain modelling', 'Authentication'],
  },
  {
    number: '03',
    title: 'Cloud and delivery',
    summary: 'Repeatable infrastructure and delivery paths, with the signals needed to operate them safely.',
    skills: ['AWS', 'Azure', 'Docker', 'CI/CD', 'Observability', 'Incident response', 'DevSecOps'],
  },
  {
    number: '04',
    title: 'Data and performance',
    summary: 'Models and queries shaped around real access patterns, explainability, and reliable system behavior.',
    skills: ['SQL Server', 'PostgreSQL', 'DynamoDB', 'Redis', 'Elasticsearch', 'Data modelling', 'Query tuning'],
  },
] as const;

export const education = [
  {
    qualification: 'Advanced Diploma in Application Development',
    institution: 'IIE',
    period: '2024 to 2025',
  },
  {
    qualification: 'Software Engineering',
    institution: 'ALX Africa',
    period: '2023 to 2024',
  },
  {
    qualification: 'Diploma in ICT, Applications Development',
    institution: 'Walter Sisulu University',
    period: '2019 to 2022',
  },
  {
    qualification: 'Python Programming',
    institution: 'Samsung Innovation Campus',
    period: '2022',
  },
] as const;

export const earlierProjects: EarlierProject[] = [
  {
    id: 'sic',
    title: 'SIC Data Analysis and Visualization',
    period: '2022',
    summary:
      'A Python analysis of unemployment, poverty, and crime in South Africa, exploring where technology could support practical responses.',
    stack: ['Python', 'Pandas', 'Jupyter', 'Data visualization'],
    alt: 'A collage introducing a South African data analysis project about crime, unemployment, and poverty',
  },
  {
    id: 'mmea',
    title: 'MMEA',
    period: '2022',
    summary:
      'A five-person health and fitness project focused on helping people in the Eastern Cape discover activities and build healthier routines.',
    stack: ['Full-stack development', 'Team delivery', 'Product design'],
    alt: 'MMEA application screens showing health and fitness features',
  },
  {
    id: 'crs',
    title: 'CRS Rentals',
    period: '2022',
    summary:
      'A car-rental operations system covering fleet, staff, customers, bookings, rentals, returns, and the relational data behind them.',
    stack: ['C#', '.NET Framework', 'SQL Server'],
    alt: 'CRS Rentals desktop application interface',
  },
  {
    id: 'contacts',
    title: 'Contacts Management',
    period: '2022',
    summary: 'A desktop contact system with account access, password recovery, contact editing, and search workflows.',
    stack: ['Java', 'MySQL', 'Desktop'],
    alt: 'Contacts Management desktop application interface',
  },
  {
    id: 'matrix',
    title: 'Matrix Multiplication',
    period: '2022',
    summary: 'An input-driven implementation of 2x2 and 3x3 matrix multiplication written in MIPS assembly language.',
    stack: ['MIPS Assembly', 'Algorithms', 'Low-level programming'],
    alt: 'A terminal demonstrating matrix multiplication output',
  },
];

export const missingChildrenCaseStudy = {
  slug: 'missing-children-sa',
  title: 'Missing Children SA',
  eyebrow: 'Connected product suite',
  summary:
    'A connected API, desktop operations application, and cross-platform mobile experience for reporting, moderating, finding, and understanding missing-person cases.',
  challenge:
    'A report contains sensitive, time-critical information. The system needed one consistent workflow across public reporting, operational review, approved listings, images, search, and statistics without letting unreviewed data flow directly to public clients.',
  contribution:
    'Designed and built the shared service boundary and the two client applications, with generated API clients keeping desktop and mobile contracts aligned.',
  decisions: [
    {
      title: 'Moderation before visibility',
      detail:
        'New and edited reports enter an explicit moderation queue. Approved records are the only ones returned to the public listing flow.',
    },
    {
      title: 'One contract, several experiences',
      detail:
        'An ASP.NET Core API owns the workflow. OpenAPI-generated clients connect the Windows desktop operations tool and .NET MAUI mobile app to the same contract.',
    },
    {
      title: 'History that can be recovered',
      detail:
        'SQL Server temporal tables retain changes to missing-person and moderation records instead of treating the latest row as the whole story.',
    },
    {
      title: 'Images outside the relational model',
      detail: 'Azure Blob Storage holds uploaded media while SQL Server keeps the structured case and moderation data.',
    },
  ],
  stack: [
    'C#',
    'ASP.NET Core 8',
    '.NET MAUI 9',
    'Windows Forms',
    'SQL Server',
    'Entity Framework Core',
    'Azure Blob Storage',
    'JWT',
    'OpenAPI',
  ],
  surfaces: [
    { label: 'API', detail: 'Reporting, approved listings, moderation, users, statistics, image metadata' },
    { label: 'Desktop', detail: 'Operational dashboard, role-aware moderation, reporting, user management' },
    { label: 'Mobile', detail: 'Approved case discovery, case detail, reporting, image upload, pagination' },
  ],
} as const;
