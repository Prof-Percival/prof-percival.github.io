export type MissingWorkflowStage = {
  id: 'submission' | 'moderation' | 'approval' | 'api' | 'listing';
  label: string;
  owner: string;
  title: string;
  detail: string;
  boundary: string;
};

export const missingWorkflowStages: readonly MissingWorkflowStage[] = [
  {
    id: 'submission',
    label: 'Submission',
    owner: 'Public reporting client',
    title: 'A synthetic report enters as pending.',
    detail:
      'The reporting client validates required case fields and media metadata before sending one structured request.',
    boundary: 'Nothing submitted here is visible in public listings.',
  },
  {
    id: 'moderation',
    label: 'Moderation',
    owner: 'Desktop operations',
    title: 'An operator reviews the case and its media.',
    detail: 'Role-aware operations keep pending and edited records in a dedicated review queue.',
    boundary: 'The public read path excludes pending and rejected records.',
  },
  {
    id: 'approval',
    label: 'Approval',
    owner: 'Moderation service boundary',
    title: 'Approval creates the publishable version.',
    detail:
      'The status transition is explicit, and temporal data retains the earlier versions rather than overwriting the story.',
    boundary: 'Only an approved version becomes eligible for discovery.',
  },
  {
    id: 'api',
    label: 'Approved API',
    owner: 'ASP.NET Core API',
    title: 'The shared API returns the approved record.',
    detail:
      'Desktop and mobile clients use generated contracts for case detail, pagination, statistics, and media metadata.',
    boundary: 'Structured case data and blob media remain separate concerns.',
  },
  {
    id: 'listing',
    label: 'Public listing',
    owner: 'Mobile discovery client',
    title: 'The approved case can appear in discovery.',
    detail:
      'The mobile experience can page, search, and open the synthetic approved case through the same API contract.',
    boundary: 'This demonstration contains no real person, report, or image.',
  },
];

export function selectMissingWorkflowStage(index: number) {
  const normalized = Number.isFinite(index) ? Math.trunc(index) : 0;
  const bounded = Math.min(missingWorkflowStages.length - 1, Math.max(0, normalized));
  return {
    index: bounded,
    stage: missingWorkflowStages[bounded]!,
    progress: ((bounded + 1) / missingWorkflowStages.length) * 100,
    isFirst: bounded === 0,
    isLast: bounded === missingWorkflowStages.length - 1,
  };
}
