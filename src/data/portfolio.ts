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
    skills: ['React', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass', 'jQuery', 'Bootstrap'],
  },
  {
    number: '02',
    title: 'Back-end systems',
    summary:
      'Explicit domain models, stable APIs, secure boundaries, and code that remains understandable under change.',
    skills: ['C#', '.NET', 'Java', 'Python', 'Node.js', 'Express', 'Django', 'Flask', 'PHP', 'C++', 'C', 'REST APIs'],
  },
  {
    number: '03',
    title: 'Cloud and delivery',
    summary: 'Repeatable infrastructure and delivery paths, with the signals needed to operate them safely.',
    skills: ['AWS', 'Azure', 'Docker', 'CI/CD', 'Observability', 'Incident response', 'DevSecOps', 'Nginx', 'IIS'],
  },
  {
    number: '04',
    title: 'Data and performance',
    summary: 'Models and queries shaped around real access patterns, explainability, and reliable system behavior.',
    skills: [
      'SQL Server',
      'PostgreSQL',
      'MySQL',
      'DynamoDB',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'Data modelling',
      'Query tuning',
    ],
  },
] as const;

export const education = [
  {
    qualification: 'Advanced Diploma in Application Development',
    institution: 'IIE · Rosebank International South Africa',
    period: '2024 to 2025',
  },
  {
    qualification: 'Software Engineering',
    institution: 'ALX Africa · Holberton School',
    period: '2023 to 2024',
  },
  {
    qualification: 'Diploma in ICT, Applications Development',
    institution: 'Walter Sisulu University',
    period: '2019 to 2022',
    detail: '84% aggregate',
  },
  {
    qualification: 'Python Programming',
    institution: 'Samsung Innovation Campus',
    period: '2022',
    detail: '89% average',
  },
] as const;

export const certifications = [
  {
    title: 'Java',
    category: 'Back-end',
    issuer: 'Sololearn',
    issued: 'December 2022',
    url: 'https://www.sololearn.com/certificates/course/en/18637754/1068/landscape/png',
  },
  {
    title: 'Data Science Foundations, Level 1',
    category: 'Data',
    issuer: 'IBM',
    issued: 'October 2022',
    url: 'https://www.credly.com/badges/2b3f0a66-b873-4f2c-819a-ccde0fc984c2/public_url',
  },
  {
    title: 'Data Science Tools',
    category: 'Data',
    issuer: 'IBM',
    issued: 'October 2022',
    url: 'https://www.credly.com/badges/7e3a7c89-1926-439b-9244-461feab4f8dd/public_url',
  },
  {
    title: 'Python Essentials 1',
    category: 'Back-end',
    issuer: 'Cisco Networking Academy',
    issued: 'July 2022',
    url: 'https://www.credly.com/badges/7aebd032-7b67-4209-b825-c93ddfc01188/public_url',
  },
  {
    title: 'Introduction to Cybersecurity',
    category: 'Security',
    issuer: 'Cisco Networking Academy',
    issued: 'July 2021',
    url: 'https://www.credly.com/badges/4d6cfdb1-37c3-4d40-9cd4-ae86ffc62bba/public_url',
  },
] as const;

export const languages = [
  { name: 'Sepedi', proficiency: 'Native or bilingual' },
  { name: 'English', proficiency: 'Native or bilingual' },
  { name: 'Sesotho', proficiency: 'Full professional' },
  { name: 'Setswana', proficiency: 'Full professional' },
  { name: 'IsiXhosa', proficiency: 'Professional working' },
  { name: 'IsiZulu', proficiency: 'Limited working' },
] as const;

export const community = [
  {
    role: 'Peer Buddy',
    organization: 'Old Mutual South Africa',
    period: 'March to December 2023',
    summary:
      'Supported first-year students as they transitioned into higher education and built the habits needed to succeed.',
  },
  {
    role: 'Student Intern',
    organization: 'Old Mutual Limited',
    period: 'June to July 2022',
    summary:
      'Completed vacation work in Strategy and Enablement within Group Marketing, Public Affairs, and Sustainability.',
  },
  {
    role: 'Computer Technician',
    organization: 'Independent',
    period: 'February 2019 to November 2022',
    summary: 'Repaired computer hardware and helped individuals troubleshoot software and device problems.',
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
    alt: 'Abstract data-analysis view connecting unemployment, poverty, and crime themes in South Africa',
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
