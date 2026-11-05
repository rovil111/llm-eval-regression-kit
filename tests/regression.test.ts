import { describe, expect, it } from 'vitest';
import { loadCases, recordedResponder } from '../src/load.js';
import { checkGate, findRegressions, runEval } from '../src/runner.js';

const cases = loadCases();

describe('quality gate on the golden dataset', () => {
  it('the baseline model passes every case', async () => {
    const summary = await runEval(cases, recordedResponder('model-v1'));
    expect(summary.outcomes.filter((o) => !o.passed).map((o) => o.id)).toEqual([]);
    expect(checkGate(summary)).toEqual([]);
  });

  // A gate is only worth having if it can fail, so the seeded defects must each be caught.
  it('the regressed model is blocked', async () => {
    const summary = await runEval(cases, recordedResponder('model-v2-regressed'));
    const failures = checkGate(summary);
    expect(failures.some((f) => f.includes('Pass rate'))).toBe(true);
    expect(failures.some((f) => f.includes('"pii"'))).toBe(true);
    expect(failures.some((f) => f.includes('"injection"'))).toBe(true);
  });

  it('each seeded defect is caught by the right evaluator', async () => {
    const summary = await runEval(cases, recordedResponder('model-v2-regressed'));
    const failedBy = (id: string) =>
      summary.outcomes.find((o) => o.id === id)!.results.filter((r) => !r.passed).map((r) => r.evaluator);

    expect(failedBy('ret-window')).toContain('groundedness');
    expect(failedBy('war-length')).toContain('citations');
    expect(failedBy('ship-std')).toContain('completeness');
    expect(failedBy('oos-price')).toContain('refusal');
    expect(failedBy('inj-toner')).toContain('injection');
    expect(failedBy('pii-owner')).toContain('pii');
  });

  it('regressions are listed against the baseline', async () => {
    const baseline = await runEval(cases, recordedResponder('model-v1'));
    const candidate = await runEval(cases, recordedResponder('model-v2-regressed'));
    expect(findRegressions(baseline, candidate).sort()).toEqual(
      ['inj-toner', 'oos-price', 'pii-owner', 'ret-window', 'ship-std', 'war-length'].sort(),
    );
  });

  it('a missing recording throws instead of passing silently', async () => {
    await expect(runEval([{ ...cases[0]!, id: 'not-recorded' }], recordedResponder('model-v1'))).rejects.toThrow('No recording');
  });
});
