export type FraudCategory = 'Groceries' | 'Gambling' | 'Cryptocurrency' | 'InternationalTransfer';
export type FraudSeverity = 'Low' | 'Medium' | 'High';
export type FraudDecision = 'Approve' | 'Review' | 'Decline';
export type FraudRuleId =
  | 'high-value'
  | 'high-risk-category'
  | 'denied-merchant'
  | 'unusual-hour'
  | 'transaction-velocity'
  | 'impossible-travel'
  | 'first-time-merchant'
  | 'amount-escalation';

export type FraudScenario = {
  amount: number;
  category: FraudCategory;
  deniedMerchant: boolean;
  localHour: number;
  transactionsInWindow: number;
  impliedTravelSpeed: number;
  firstTimeMerchant: boolean;
  priorTransactionCount: number;
  averageAmount: number;
};

export type FraudRuleOutcome = {
  id: FraudRuleId;
  label: string;
  severity: FraudSeverity;
  triggered: boolean;
  points: number;
  reason: string;
};

export type FraudEvaluation = {
  score: number;
  decision: FraudDecision;
  outcomes: FraudRuleOutcome[];
};

const severityPoints: Record<FraudSeverity, number> = { Low: 10, Medium: 25, High: 45 };
const highRiskCategories = new Set<FraudCategory>(['Gambling', 'Cryptocurrency', 'InternationalTransfer']);

export const defaultFraudScenario: FraudScenario = {
  amount: 6000,
  category: 'Groceries',
  deniedMerchant: false,
  localHour: 14,
  transactionsInWindow: 1,
  impliedTravelSpeed: 0,
  firstTimeMerchant: true,
  priorTransactionCount: 12,
  averageAmount: 2000,
};

function outcome(
  id: FraudRuleId,
  label: string,
  severity: FraudSeverity,
  triggered: boolean,
  triggeredReason: string,
  clearReason: string
): FraudRuleOutcome {
  return {
    id,
    label,
    severity,
    triggered,
    points: triggered ? severityPoints[severity] : 0,
    reason: triggered ? triggeredReason : clearReason,
  };
}

export function evaluateFraudScenario(scenario: FraudScenario): FraudEvaluation {
  const outcomes = [
    outcome(
      'high-value',
      'High value transaction',
      'High',
      scenario.amount >= 25_000,
      `ZAR ${scenario.amount.toFixed(2)} meets the ZAR 25000.00 threshold.`,
      `ZAR ${scenario.amount.toFixed(2)} is below the ZAR 25000.00 threshold.`
    ),
    outcome(
      'high-risk-category',
      'High-risk category',
      'Low',
      highRiskCategories.has(scenario.category),
      `${scenario.category} is in the configured category watchlist.`,
      `${scenario.category} is not in the configured category watchlist.`
    ),
    outcome(
      'denied-merchant',
      'Denied merchant',
      'High',
      scenario.deniedMerchant,
      'The synthetic merchant is on the configured deny list.',
      'The synthetic merchant is not on the configured deny list.'
    ),
    outcome(
      'unusual-hour',
      'Unusual hour',
      'Low',
      scenario.localHour >= 1 && scenario.localHour < 5,
      `The local transaction hour ${String(scenario.localHour).padStart(2, '0')}:00 falls inside the 01:00 to 05:00 window.`,
      `The local transaction hour ${String(scenario.localHour).padStart(2, '0')}:00 falls outside the unusual-hour window.`
    ),
    outcome(
      'transaction-velocity',
      'Transaction velocity',
      'Medium',
      scenario.transactionsInWindow >= 5,
      `${scenario.transactionsInWindow} transactions in 15 minutes meets the threshold of 5.`,
      `${scenario.transactionsInWindow} transactions in 15 minutes is below the threshold of 5.`
    ),
    outcome(
      'impossible-travel',
      'Impossible travel',
      'High',
      scenario.impliedTravelSpeed > 1000,
      `${scenario.impliedTravelSpeed} km/h exceeds the 1000 km/h card-present travel ceiling.`,
      `${scenario.impliedTravelSpeed} km/h does not exceed the card-present travel ceiling.`
    ),
    outcome(
      'first-time-merchant',
      'First-time merchant, high value',
      'Medium',
      scenario.firstTimeMerchant && scenario.priorTransactionCount >= 10 && scenario.amount >= 5000,
      'The merchant is new, the baseline has at least 10 transactions, and the amount is at least ZAR 5000.00.',
      'The new-merchant, baseline, and amount conditions are not all met.'
    ),
    outcome(
      'amount-escalation',
      'Amount escalation',
      'Medium',
      scenario.priorTransactionCount >= 10 &&
        scenario.averageAmount > 0 &&
        scenario.amount >= scenario.averageAmount * 5,
      `ZAR ${scenario.amount.toFixed(2)} is at least five times the ZAR ${scenario.averageAmount.toFixed(2)} baseline average.`,
      'The baseline count and five-times-average conditions are not both met.'
    ),
  ];

  const score = Math.min(
    100,
    outcomes.reduce((total, rule) => total + rule.points, 0)
  );
  const decision: FraudDecision = score >= 75 ? 'Decline' : score >= 40 ? 'Review' : 'Approve';
  return { score, decision, outcomes };
}
