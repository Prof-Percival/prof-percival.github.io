export type GuideAnswerId =
  | 'engineering-approach'
  | 'featured-system'
  | 'experience'
  | 'back-end'
  | 'cloud-delivery'
  | 'data-work'
  | 'education'
  | 'languages'
  | 'contact';

export type GuideAnswer = {
  id: GuideAnswerId;
  prompt: string;
  keywords: readonly string[];
  title: string;
  answer: string;
  sourceLabel: string;
  sourceHref: string;
};

export const guideAnswers: readonly GuideAnswer[] = [
  {
    id: 'engineering-approach',
    prompt: 'What kind of engineer is Phadima?',
    keywords: ['Phadima', 'software engineer', 'full-stack', 'back-end', 'backend', 'product', 'systems'],
    title: 'Full-stack range with back-end depth',
    answer:
      'Phadima is a software engineer with full-stack experience and strong back-end depth. He works across interfaces, services, data, cloud delivery, and operations, with particular attention to clear contracts and dependable behavior.',
    sourceLabel: 'Profile and capabilities',
    sourceHref: '/profile/',
  },
  {
    id: 'featured-system',
    prompt: 'Which project should I view first?',
    keywords: ['project', 'flagship', 'case study', 'Missing Children SA', 'API', 'mobile', 'desktop', 'moderation'],
    title: 'Start with Missing Children SA',
    answer:
      'Missing Children SA connects an ASP.NET Core API, a Windows desktop operations application, and a .NET MAUI mobile experience. The case study explains moderation before public visibility, shared contracts, temporal history, and separate media storage.',
    sourceLabel: 'Missing Children SA case study',
    sourceHref: '/work/missing-children-sa/',
  },
  {
    id: 'experience',
    prompt: 'Where has Phadima worked?',
    keywords: ['career', 'roles', 'experience', 'Capitec', 'Amazon', 'EC2', 'OLX', 'independent', 'teaching'],
    title: 'Product, infrastructure, and financial systems',
    answer:
      'Phadima currently builds back-end services at Capitec Bank. Earlier roles include Amazon EC2, OLX, independent software development, and programming education. The journey route lists the dates, scope, and technologies for each role.',
    sourceLabel: 'Career journey',
    sourceHref: '/journey/',
  },
  {
    id: 'back-end',
    prompt: 'What back-end experience does Phadima have?',
    keywords: [
      'back-end',
      'backend',
      'C#',
      '.NET',
      'Java',
      'Python',
      'Node.js',
      'REST APIs',
      'PostgreSQL',
      'SQL Server',
    ],
    title: 'Back-end systems and APIs',
    answer:
      'His published back-end toolkit includes C#, .NET, Java, Python, Node.js, REST APIs, SQL Server, PostgreSQL, DynamoDB, Redis, and Elasticsearch. His portfolio emphasizes explicit domain models, stable contracts, secure boundaries, testing, and operational evidence.',
    sourceLabel: 'Back-end capabilities',
    sourceHref: '/profile/#capabilities-title',
  },
  {
    id: 'cloud-delivery',
    prompt: 'What cloud and delivery experience does Phadima have?',
    keywords: ['cloud', 'AWS', 'Azure', 'Docker', 'CI/CD', 'observability', 'DevSecOps', 'fleet', 'infrastructure'],
    title: 'Cloud delivery backed by operational work',
    answer:
      'Phadima has worked with AWS and Azure, Docker, CI/CD, observability, incident response, and DevSecOps. At Amazon EC2, he built orchestration and self-service APIs for fleet provisioning, maintenance, patching, and infrastructure lifecycle work.',
    sourceLabel: 'Career and cloud capabilities',
    sourceHref: '/journey/',
  },
  {
    id: 'data-work',
    prompt: 'What data experience does Phadima have?',
    keywords: [
      'data',
      'SQL',
      'PostgreSQL',
      'DynamoDB',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'Pandas',
      'Jupyter',
      'SIC',
    ],
    title: 'Data models, queries, and analysis',
    answer:
      'His published work covers SQL Server, PostgreSQL, MySQL, DynamoDB, MongoDB, Redis, Elasticsearch, data modelling, and query tuning. The SIC project also uses Python, Pandas, Jupyter, and visualization to examine unemployment, poverty, and crime in South Africa.',
    sourceLabel: 'Work and data capabilities',
    sourceHref: '/work/',
  },
  {
    id: 'education',
    prompt: 'What has Phadima studied?',
    keywords: [
      'education',
      'qualifications',
      'diploma',
      'degree',
      'certifications',
      'credentials',
      'university',
      'learning',
    ],
    title: 'Application development and software engineering',
    answer:
      'Phadima has studied application development, software engineering, ICT applications development, and Python programming. His profile also links five selected credentials from more than 100 completed credentials.',
    sourceLabel: 'Education and credentials',
    sourceHref: '/profile/#about',
  },
  {
    id: 'languages',
    prompt: 'Which languages does Phadima speak?',
    keywords: ['languages', 'Sepedi', 'English', 'Sesotho', 'Setswana', 'IsiXhosa', 'IsiZulu', 'communication'],
    title: 'Six working languages',
    answer:
      'Phadima lists Sepedi and English at native or bilingual proficiency, Sesotho and Setswana at full professional proficiency, IsiXhosa at professional working proficiency, and IsiZulu at limited working proficiency.',
    sourceLabel: 'Languages',
    sourceHref: '/profile/#about',
  },
  {
    id: 'contact',
    prompt: 'How can I contact Phadima?',
    keywords: ['contact', 'message', 'email', 'LinkedIn', 'GitHub', 'role', 'opportunity', 'collaboration'],
    title: 'Start with the contact form',
    answer:
      'Use the portfolio contact form for a role, project, collaboration, speaking, or mentoring conversation. The profile also links to Phadima on GitHub and LinkedIn.',
    sourceLabel: 'Contact options',
    sourceHref: '/profile/#contact',
  },
] as const;

export const suggestedGuideAnswerIds = [
  'engineering-approach',
  'featured-system',
  'back-end',
  'cloud-delivery',
] as const satisfies readonly GuideAnswerId[];

const ignoredTerms = new Set([
  'a',
  'about',
  'an',
  'and',
  'are',
  'can',
  'did',
  'do',
  'does',
  'for',
  'has',
  'have',
  'he',
  'how',
  'i',
  'in',
  'is',
  'me',
  'of',
  'on',
  'the',
  'to',
  'what',
  'where',
  'which',
  'who',
  'with',
]);

export function normalizeGuideText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function findGuideAnswers(query: string, limit = 3): GuideAnswer[] {
  const normalizedQuery = normalizeGuideText(query);
  const terms = normalizedQuery.split(' ').filter((term) => term.length > 1 && !ignoredTerms.has(term));
  const resultLimit = Math.max(0, Math.floor(limit));

  if (terms.length === 0 || resultLimit === 0) return [];

  return guideAnswers
    .map((answer, index) => {
      const prompt = normalizeGuideText(answer.prompt);
      const title = normalizeGuideText(answer.title);
      const body = normalizeGuideText(answer.answer);
      const keywords = new Set(answer.keywords.flatMap((keyword) => normalizeGuideText(keyword).split(' ')));
      let score = 0;

      if (prompt === normalizedQuery) score += 100;
      if (prompt.includes(normalizedQuery) || title.includes(normalizedQuery)) score += 32;

      for (const term of terms) {
        if (keywords.has(term)) score += 12;
        if (prompt.includes(term)) score += 7;
        if (title.includes(term)) score += 5;
        if (body.includes(term)) score += 1;
      }

      return { answer, index, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, resultLimit)
    .map((result) => result.answer);
}
