import { mkdirSync, writeFileSync } from 'node:fs';
import { loadCases, recordedResponder } from './load.js';
import { checkGate, findRegressions, runEval, toMarkdown } from './runner.js';

// Usage: npm run eval -- <candidate> [baseline]
const [candidate = 'model-v1', baseline = 'model-v1'] = process.argv.slice(2);
const cases = loadCases();

const summary = await runEval(cases, recordedResponder(candidate));
const regressions = findRegressions(await runEval(cases, recordedResponder(baseline)), summary);
const failures = checkGate(summary);
if (regressions.length) failures.push(`${regressions.length} case(s) regressed against ${baseline}.`);

const report = toMarkdown(candidate, summary, failures, regressions);
mkdirSync('reports', { recursive: true });
writeFileSync(`reports/${candidate}.md`, report);
console.log(report);
process.exit(failures.length ? 1 : 0);
