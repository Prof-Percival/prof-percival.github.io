import { describe, expect, it } from 'vitest';

import { defaultFraudScenario, evaluateFraudScenario, type FraudScenario } from './fraud-demo';

const scenario = (overrides: Partial<FraudScenario> = {}): FraudScenario => ({
  ...defaultFraudScenario,
  ...overrides,
});

describe('synthetic fraud evaluator', () => {
  it('shows that one medium rule can still approve', () => {
    const result = evaluateFraudScenario(defaultFraudScenario);

    expect(result.score).toBe(25);
    expect(result.decision).toBe('Approve');
    expect(result.outcomes.filter((rule) => rule.triggered).map((rule) => rule.id)).toEqual(['first-time-merchant']);
  });

  it('produces Review between the two decision bands', () => {
    const result = evaluateFraudScenario(
      scenario({
        amount: 1000,
        category: 'Gambling',
        firstTimeMerchant: false,
        localHour: 2,
        transactionsInWindow: 5,
      })
    );

    expect(result.score).toBe(45);
    expect(result.decision).toBe('Review');
  });

  it('runs all eight rule shapes and clamps a stacked score', () => {
    const result = evaluateFraudScenario(
      scenario({
        amount: 30_000,
        category: 'Cryptocurrency',
        deniedMerchant: true,
        localHour: 1,
        transactionsInWindow: 5,
        impliedTravelSpeed: 1201,
        firstTimeMerchant: true,
        priorTransactionCount: 10,
        averageAmount: 1000,
      })
    );

    expect(result.outcomes.every((rule) => rule.triggered)).toBe(true);
    expect(result.score).toBe(100);
    expect(result.decision).toBe('Decline');
  });

  it('keeps inclusive thresholds and the travel ceiling precise', () => {
    const result = evaluateFraudScenario(
      scenario({
        amount: 25_000,
        firstTimeMerchant: false,
        localHour: 5,
        transactionsInWindow: 4,
        impliedTravelSpeed: 1000,
      })
    );

    expect(result.outcomes.find((rule) => rule.id === 'high-value')?.triggered).toBe(true);
    expect(result.outcomes.find((rule) => rule.id === 'unusual-hour')?.triggered).toBe(false);
    expect(result.outcomes.find((rule) => rule.id === 'transaction-velocity')?.triggered).toBe(false);
    expect(result.outcomes.find((rule) => rule.id === 'impossible-travel')?.triggered).toBe(false);
  });

  it('requires a ten-transaction baseline for baseline rules', () => {
    const result = evaluateFraudScenario(
      scenario({ amount: 6000, firstTimeMerchant: true, priorTransactionCount: 9, averageAmount: 1000 })
    );

    expect(result.outcomes.find((rule) => rule.id === 'first-time-merchant')?.triggered).toBe(false);
    expect(result.outcomes.find((rule) => rule.id === 'amount-escalation')?.triggered).toBe(false);
  });
});
