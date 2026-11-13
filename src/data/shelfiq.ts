export type ShelfIqWorkflowStep = {
  id: 'capture' | 'monitor' | 'verify' | 'media';
  label: string;
  owner: string;
  title: string;
  detail: string;
  boundary: string;
};

export const shelfIqProject = {
  slug: 'shelfiq',
  title: 'ShelfIQ',
  eyebrow: 'Product-expiry platform',
  status: 'In development',
  sourceLabel: 'Private source',
  launchLabel: 'Not publicly launched',
  summary:
    'A .NET 8 product-expiry platform for capturing shelf-life data, monitoring product status, verifying barcodes, and keeping product media behind a separate image boundary.',
  problem:
    'A product record is useful only when identity, production date, expiry date, status, and media stay connected. ShelfIQ brings those decisions into one workflow instead of leaving expiry awareness to manual checks.',
  contribution:
    'Built the layered ASP.NET Core application across portal, domain, application, SQL, configuration, integration, and image-serving projects, including product workflows, expiry dashboards, barcode verification, and image handling.',
  stack: ['C#', '.NET 8', 'ASP.NET Core MVC', 'Razor', 'SQL', 'Entity Framework Core', 'Azure Blob Storage'],
  capabilities: [
    'User-scoped product capture and search',
    'Expired, expiring-soon, and fresh status',
    'Barcode lookup with persisted verification results',
    'Dashboard summaries by status and category',
    'Separate image references, processing, and blob data',
  ],
  architecture: [
    {
      label: 'Portal',
      detail:
        'Razor and MVC workflows for account access, dashboard views, product capture, search, editing, and verification.',
    },
    {
      label: 'Domain and application',
      detail: 'Product, expiry, barcode, image, route, and security behavior separated from the presentation layer.',
    },
    {
      label: 'SQL data',
      detail: 'Repositories and migrations for users, products, verification results, image metadata, and references.',
    },
    {
      label: 'Image boundary',
      detail:
        'A dedicated image-serving path with resizing, content-type handling, caching metadata, and Azure Blob integration.',
    },
  ],
  deliveryGates: [
    {
      title: 'Protect the core rules with automated tests',
      detail:
        'Add focused coverage for expiry boundaries, product ownership, barcode normalization, verification caching, and image reference behavior.',
    },
    {
      title: 'Finish production configuration and security review',
      detail:
        'Validate authentication, anonymous verification, secret handling, data protection, upload limits, error responses, and environment-specific settings.',
    },
    {
      title: 'Remove time-bound assumptions',
      detail:
        'Make dashboard reporting windows derive from current data and complete the remaining image delivery behavior before launch.',
    },
    {
      title: 'Prove the deployed experience',
      detail:
        'Add deployment automation, observability, accessibility checks, performance evidence, and a controlled release path before calling the product public.',
    },
  ],
} as const;

export const shelfIqWorkflow: readonly ShelfIqWorkflowStep[] = [
  {
    id: 'capture',
    label: 'Capture',
    owner: 'Product portal',
    title: 'Register identity and shelf-life data together.',
    detail:
      'A product combines name, category, production date and time, expiry date and time, barcode, and detected barcode type.',
    boundary:
      'Validation keeps production time tied to a production date and prevents production from following expiry.',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    owner: 'Expiry domain and dashboard',
    title: 'Turn dates into an operational status.',
    detail:
      'The domain classifies a product as expired, expiring soon, or fresh, while dashboard queries group those states by user and category.',
    boundary: 'Status comes from the product dates at read time rather than a manually maintained label.',
  },
  {
    id: 'verify',
    label: 'Verify',
    owner: 'Barcode verification',
    title: 'Resolve a barcode and retain the useful result.',
    detail:
      'The verification path checks stored results first, performs a lookup when needed, normalizes the response, and persists it for later requests.',
    boundary: 'The public lookup exposes product verification, not signed-in product-management actions.',
  },
  {
    id: 'media',
    label: 'Media',
    owner: 'Image service',
    title: 'Keep image references separate from image bytes.',
    detail:
      'SQL tracks image identity and references, image processing constrains dimensions and content type, and Azure Blob Storage can hold the binary data.',
    boundary:
      'The portfolio uses a newly drawn architecture visual because no original ShelfIQ media has been cleared for publication.',
  },
];

export function selectShelfIqWorkflowStep(id: string): ShelfIqWorkflowStep {
  return shelfIqWorkflow.find((step) => step.id === id) ?? shelfIqWorkflow[0]!;
}
