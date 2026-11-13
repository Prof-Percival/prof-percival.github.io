import { describe, expect, it } from 'vitest';

import { selectShelfIqWorkflowStep, shelfIqProject, shelfIqWorkflow } from './shelfiq';

describe('ShelfIQ portfolio story', () => {
  it('states current delivery status without a public-launch claim', () => {
    expect(shelfIqProject.status).toBe('In development');
    expect(shelfIqProject.launchLabel).toBe('Not publicly launched');
    expect(shelfIqProject.sourceLabel).toBe('Private source');
    expect(shelfIqProject).not.toHaveProperty('publicUrl');
  });

  it('covers the verified product workflow in order', () => {
    expect(shelfIqWorkflow.map((step) => step.id)).toEqual(['capture', 'monitor', 'verify', 'media']);
    expect(shelfIqProject.capabilities).toHaveLength(5);
  });

  it('records concrete gates before a public release', () => {
    expect(shelfIqProject.deliveryGates).toHaveLength(4);
    expect(shelfIqProject.deliveryGates.every((gate) => gate.detail.length > 40)).toBe(true);
  });

  it('selects a workflow step and defaults to capture', () => {
    expect(selectShelfIqWorkflowStep('verify').id).toBe('verify');
    expect(selectShelfIqWorkflowStep('unknown').id).toBe('capture');
  });
});
