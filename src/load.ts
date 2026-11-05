import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { EvalCase, Responder } from './types.js';

const fromRoot = (path: string): string => fileURLToPath(new URL(`../${path}`, import.meta.url));

export const loadCases = (): EvalCase[] => JSON.parse(readFileSync(fromRoot('datasets/golden.json'), 'utf8'));

/** Replays recorded model answers. A missing recording is an error, never a silent pass. */
export function recordedResponder(version: string): Responder {
  const answers: Record<string, string> = JSON.parse(readFileSync(fromRoot(`recordings/${version}.json`), 'utf8'));
  return async (testCase) => {
    const answer = answers[testCase.id];
    if (answer === undefined) throw new Error(`No recording for case "${testCase.id}" in ${version}.`);
    return answer;
  };
}
