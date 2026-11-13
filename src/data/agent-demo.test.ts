import { describe, expect, it } from 'vitest';

import { agentEventScenarios, simulateAgentEvent } from './agent-demo';

describe('synthetic agent activity pipeline', () => {
  it('maps every risky scenario to one distinct rule', () => {
    const risky = agentEventScenarios.filter((scenario) => scenario.rule);

    expect(risky).toHaveLength(5);
    expect(new Set(risky.map((scenario) => scenario.rule)).size).toBe(5);
  });

  it('keeps an ordinary event clear while still completing analysis', () => {
    const result = simulateAgentEvent('ordinary', false);

    expect(result.alert).toBeNull();
    expect(result.alerts).toBe(0);
    expect(result.stages.find((stage) => stage.id === 'analyze')?.state).toBe('clear');
  });

  it('raises the configured alert for a risky event', () => {
    const result = simulateAgentEvent('remote_code_execution', false);

    expect(result.alert).toEqual({
      rule: 'remote_code_execution',
      severity: 'critical',
      summary: 'Remote code execution pattern detected.',
    });
    expect(result.alerts).toBe(1);
  });

  it('deduplicates replayed events and alerts', () => {
    const result = simulateAgentEvent('privileged_tool_call', true);

    expect(result.received).toBe(2);
    expect(result.stored).toBe(1);
    expect(result.alerts).toBe(1);
    expect(result.stages.filter((stage) => stage.state === 'deduplicated').map((stage) => stage.id)).toEqual([
      'persist',
      'alert',
    ]);
  });

  it('falls back to the ordinary scenario for an unknown selection', () => {
    expect(simulateAgentEvent('unknown', false).scenario.id).toBe('ordinary');
  });
});
