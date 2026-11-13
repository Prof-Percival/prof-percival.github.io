export type AgentRiskRuleId =
  'secret_file_access' | 'unapproved_domain' | 'remote_code_execution' | 'rapid_secret_reads' | 'privileged_tool_call';
export type AgentScenarioId = 'ordinary' | AgentRiskRuleId;
export type AgentSeverity = 'medium' | 'high' | 'critical';

export type AgentEventScenario = {
  id: AgentScenarioId;
  label: string;
  eventType: string;
  summary: string;
  rule: AgentRiskRuleId | null;
  severity: AgentSeverity | null;
  alertSummary: string | null;
};

export type AgentPipelineStage = {
  id: 'ingest' | 'persist' | 'claim' | 'analyze' | 'alert';
  label: string;
  state: 'complete' | 'clear' | 'deduplicated';
  detail: string;
};

export const agentEventScenarios: readonly AgentEventScenario[] = [
  {
    id: 'ordinary',
    label: 'Ordinary project file read',
    eventType: 'file_read',
    summary: 'A synthetic agent reads a normal file inside its project workspace.',
    rule: null,
    severity: null,
    alertSummary: null,
  },
  {
    id: 'secret_file_access',
    label: 'Sensitive credential-path read',
    eventType: 'file_read',
    summary: 'A synthetic event references a path shape associated with credential material.',
    rule: 'secret_file_access',
    severity: 'high',
    alertSummary: 'Sensitive file access pattern detected.',
  },
  {
    id: 'unapproved_domain',
    label: 'Request to an unapproved domain',
    eventType: 'network_request',
    summary: 'A synthetic network event targets a domain outside the configured approved set.',
    rule: 'unapproved_domain',
    severity: 'medium',
    alertSummary: 'Network destination is not approved.',
  },
  {
    id: 'remote_code_execution',
    label: 'Downloaded content handed to an interpreter',
    eventType: 'process_start',
    summary: 'A safe label represents the shape of remote content being passed directly to an interpreter.',
    rule: 'remote_code_execution',
    severity: 'critical',
    alertSummary: 'Remote code execution pattern detected.',
  },
  {
    id: 'rapid_secret_reads',
    label: 'Rapid sequence of sensitive reads',
    eventType: 'file_read',
    summary: 'A synthetic history contains four sensitive reads by one agent inside the configured window.',
    rule: 'rapid_secret_reads',
    severity: 'high',
    alertSummary: 'Sensitive files were read in rapid succession.',
  },
  {
    id: 'privileged_tool_call',
    label: 'Privileged tool invocation',
    eventType: 'tool_call',
    summary: 'A synthetic nested tool payload requests a privileged capability.',
    rule: 'privileged_tool_call',
    severity: 'high',
    alertSummary: 'Privileged tool use requires review.',
  },
];

export type AgentPipelineResult = {
  scenario: AgentEventScenario;
  received: number;
  stored: number;
  alerts: number;
  stages: AgentPipelineStage[];
  alert: { rule: AgentRiskRuleId; severity: AgentSeverity; summary: string } | null;
};

export function simulateAgentEvent(scenarioId: string, replayed: boolean): AgentPipelineResult {
  const scenario = agentEventScenarios.find((candidate) => candidate.id === scenarioId) ?? agentEventScenarios[0]!;
  const alert =
    scenario.rule && scenario.severity && scenario.alertSummary
      ? { rule: scenario.rule, severity: scenario.severity, summary: scenario.alertSummary }
      : null;

  return {
    scenario,
    received: replayed ? 2 : 1,
    stored: 1,
    alerts: alert ? 1 : 0,
    stages: [
      {
        id: 'ingest',
        label: 'Ingest',
        state: 'complete',
        detail: `Fastify validates the ${scenario.eventType} envelope and attributes it to synthetic agent agent-demo-7.`,
      },
      {
        id: 'persist',
        label: 'Persist',
        state: replayed ? 'deduplicated' : 'complete',
        detail: replayed
          ? 'The repeated event_id reaches PostgreSQL twice, but ON CONFLICT keeps one stored event.'
          : 'PostgreSQL stores one event with separate occurred_at and received_at timestamps.',
      },
      {
        id: 'claim',
        label: 'Claim',
        state: 'complete',
        detail: 'The Python analyzer claims the unanalysed row with FOR UPDATE SKIP LOCKED.',
      },
      {
        id: 'analyze',
        label: 'Analyze',
        state: alert ? 'complete' : 'clear',
        detail: alert
          ? `The pure ${alert.rule} rule returns a ${alert.severity} finding.`
          : 'All five pure rules return clear for this ordinary synthetic event.',
      },
      {
        id: 'alert',
        label: 'Alert',
        state: alert ? (replayed ? 'deduplicated' : 'complete') : 'clear',
        detail: alert
          ? replayed
            ? 'The alert is written once because event_id plus rule is unique, even when the event is replayed.'
            : 'The analyzer writes one queryable alert and marks the event analysed in the same transaction.'
          : 'No alert is created, but the event is still marked analysed so it is not claimed again.',
      },
    ],
    alert,
  };
}
