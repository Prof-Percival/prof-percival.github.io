export type CaseStudyChapterId = 'problem' | 'constraints' | 'architecture' | 'decisions' | 'evidence' | 'limits';

export type CaseStudyChapter = {
  id: CaseStudyChapterId;
  label: string;
  title: string;
  body: string;
};

export type EngineeringDecision = {
  title: string;
  detail: string;
};

export type FlagshipCaseStudy = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  challenge: string;
  contribution: string;
  sourceLabel: 'Private source';
  stack: readonly string[];
  facts: readonly string[];
  chapters: readonly CaseStudyChapter[];
  decisions: readonly EngineeringDecision[];
};

export const missingChildrenChapters: readonly CaseStudyChapter[] = [
  {
    id: 'problem',
    label: 'Problem',
    title: 'Time-critical reports still need a trust boundary.',
    body: 'A missing-person report needs to move quickly, but publishing unreviewed personal information creates its own harm. The system treats operational speed and controlled visibility as one product problem.',
  },
  {
    id: 'constraints',
    label: 'Constraints',
    title: 'Three clients must agree on one case state.',
    body: 'Public reporting, desktop operations, and mobile discovery need different interfaces while sharing authentication, moderation status, case history, pagination, and media rules.',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    title: 'The API owns the workflow contract.',
    body: 'An ASP.NET Core API connects a Windows operations tool and a .NET MAUI app through generated OpenAPI clients. SQL Server holds structured and temporal data, while Azure Blob Storage holds uploaded media.',
  },
  {
    id: 'decisions',
    label: 'Decisions',
    title: 'Visibility follows approval, not submission.',
    body: 'New and edited reports enter moderation. Public listing queries return approved records only, temporal tables retain changes, and clients evolve around a shared service contract.',
  },
  {
    id: 'evidence',
    label: 'Evidence',
    title: 'The boundary is visible across every surface.',
    body: 'The desktop workflow exposes pending review, the API separates moderation from public reads, and the mobile experience consumes approved listings and case details through the generated client.',
  },
  {
    id: 'limits',
    label: 'Limits',
    title: 'The public experience uses no real case data.',
    body: 'The workflow explorer is a client-side demonstration with a synthetic case. The private source and any real personal information remain outside this portfolio.',
  },
];

export const fraudRuleEngineCaseStudy = {
  slug: 'fraud-rule-engine',
  title: 'Fraud Rule Engine',
  eyebrow: 'Explainable decision service',
  summary:
    'A .NET 10 service that evaluates transaction events against eight rule shapes, persists every outcome, and returns an explainable Approve, Review, or Decline decision.',
  challenge:
    'A transaction alone cannot answer questions about velocity, travel, or a customer baseline. The service must combine current and historical context without letting retries create conflicting assessments.',
  contribution:
    'Designed the domain model, rule pipeline, scoring policy, API boundary, PostgreSQL persistence, operational signals, and real-database integration coverage as one coherent back-end system.',
  sourceLabel: 'Private source',
  stack: ['C#', '.NET 10', 'ASP.NET Core', 'PostgreSQL 17', 'Entity Framework Core', 'OpenTelemetry', 'Docker'],
  facts: ['Eight rule shapes', 'Three decisions', 'Versioned explanations', 'Retry-safe assessments'],
  chapters: [
    {
      id: 'problem',
      label: 'Problem',
      title: 'Turn signals into a decision a person can inspect.',
      body: 'The useful output is more than a fraud flag. Each transaction needs a bounded score, one of three decisions, and the full reason from every rule that ran.',
    },
    {
      id: 'constraints',
      label: 'Constraints',
      title: 'History, retries, and changing policy all affect correctness.',
      body: 'Some rules need recent rows, others need a 90-day aggregate, repeated events must return the original assessment, and an old decision must remain explainable after thresholds change.',
    },
    {
      id: 'architecture',
      label: 'Architecture',
      title: 'IO stays at the edges of a pure decision core.',
      body: 'The API validates and authenticates, the application layer loads customer context, pure domain rules evaluate it, and PostgreSQL persists the transaction, assessment, and rule outcomes atomically.',
    },
    {
      id: 'decisions',
      label: 'Decisions',
      title: 'Rules report severity while one policy owns scoring.',
      body: 'Low, Medium, and High signals map to central weights. Review begins at 40, Decline at 75, and scores stop at 100. Every assessment carries a rule-set version and configuration fingerprint.',
    },
    {
      id: 'evidence',
      label: 'Evidence',
      title: 'Tests exercise the boundaries that change the answer.',
      body: 'Domain and architecture tests protect the dependency direction, while integration tests use real PostgreSQL for idempotency, persistence, filtering, keyset pagination, and health behavior.',
    },
    {
      id: 'limits',
      label: 'Limits',
      title: 'The portfolio evaluator is deliberately smaller than the service.',
      body: 'This page runs a synthetic, client-side version of the eight decisions. It does not call the private API, store transactions, or represent a production fraud verdict.',
    },
  ],
  decisions: [
    {
      title: 'Load context before running rules',
      detail:
        'Rules stay synchronous and testable because recent history and long-term aggregates arrive in one evaluation context.',
    },
    {
      title: 'Persist every rule outcome',
      detail:
        'Triggered and clear outcomes both carry reasons, so a stored assessment explains why each rule did or did not contribute.',
    },
    {
      title: 'Make retries return the original result',
      detail:
        'A unique event boundary and transactional persistence prevent duplicate deliveries from creating two decisions.',
    },
    {
      title: 'Keep reads stable as data grows',
      detail:
        'Keyset pagination avoids large offsets and reduces skipped or repeated rows while new assessments arrive.',
    },
  ],
} as const satisfies FlagshipCaseStudy;

export const agentRiskMonitorCaseStudy = {
  slug: 'agent-risk-monitor',
  title: 'Agent Activity Risk Monitor',
  eyebrow: 'Multi-language monitoring pipeline',
  summary:
    'A TypeScript ingestion service and Python analyzer that coordinate through PostgreSQL to turn agent activity events into idempotent, queryable risk alerts.',
  challenge:
    'Agent events can arrive more than once, analysis can run concurrently, and rules need both one-event patterns and recent history. The system must preserve cause and effect across those boundaries.',
  contribution:
    'Built the Fastify ingestion and read API, Python rule engine, shared schema and migrations, safe concurrent claiming, alert idempotency, container workflow, and HTTP-level end-to-end coverage.',
  sourceLabel: 'Private source',
  stack: ['TypeScript', 'Fastify', 'Python', 'PostgreSQL', 'SQL', 'Docker', 'Zod'],
  facts: ['Five risk rules', 'Two services', '47 unit tests', '38 end-to-end tests'],
  chapters: [
    {
      id: 'problem',
      label: 'Problem',
      title: 'Make agent activity inspectable after it happens.',
      body: 'The monitor receives structured activity events, identifies risky patterns, and exposes alerts, summaries, and a timeline that an operator can query.',
    },
    {
      id: 'constraints',
      label: 'Constraints',
      title: 'Delivery and analysis are both repeatable.',
      body: 'Agents retry events, multiple analyzers may claim work, some rules need history, and the event clock can differ from the time the monitor received it.',
    },
    {
      id: 'architecture',
      label: 'Architecture',
      title: 'PostgreSQL is the explicit integration point.',
      body: 'Fastify validates and stores events, Python claims unanalysed rows and writes alerts, and the read API serves both. Shared migrations define the contract between the two languages.',
    },
    {
      id: 'decisions',
      label: 'Decisions',
      title: 'Database constraints carry the retry guarantees.',
      body: 'Event IDs are unique, alerts are unique by event and rule, and FOR UPDATE SKIP LOCKED lets concurrent analyzers claim different rows without duplicating work.',
    },
    {
      id: 'evidence',
      label: 'Evidence',
      title: 'Fast rules and full-system tests cover different risks.',
      body: 'Forty-seven unit tests cover pure rules and ingestion validation. Thirty-eight end-to-end tests cross the HTTP, TypeScript, Python, migration, and PostgreSQL seams.',
    },
    {
      id: 'limits',
      label: 'Limits',
      title: 'The current design chooses simplicity over real-time delivery.',
      body: 'The analyzer polls and both services know the shared schema. The portfolio demonstration uses synthetic event labels only and never runs an action or sends activity elsewhere.',
    },
  ],
  decisions: [
    {
      title: 'Let constraints enforce idempotency',
      detail:
        'Events use event_id as the primary key and alerts are unique on event_id plus rule, closing race windows around retries.',
    },
    {
      title: 'Claim work without a global lock',
      detail:
        'FOR UPDATE SKIP LOCKED gives concurrent analyzers different rows and keeps event completion with alert writes in one transaction.',
    },
    {
      title: 'Keep rules pure',
      detail:
        'Each rule receives the event, approved domains, and any required history, then returns a finding without performing IO.',
    },
    {
      title: 'Preserve two clocks',
      detail:
        'occurred_at represents the agent clock, while received_at keeps the operator timeline in cause-before-effect order.',
    },
  ],
} as const satisfies FlagshipCaseStudy;
