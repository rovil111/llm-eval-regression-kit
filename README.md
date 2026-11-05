# LLM Eval Regression Kit

![eval](https://github.com/rovil111/llm-eval-regression-kit/actions/workflows/eval.yml/badge.svg)

Treats a grounded (RAG-style) assistant like any other software under test: a golden dataset, scored evaluators, a release gate and regression detection. Runs replay recorded answers, so they are deterministic, free and need no API key.

## Run it

Requires Node.js 20 or later.

```bash
npm ci
npm test
npm run eval -- model-v1             # passes
npm run eval -- model-v2-regressed   # blocked, exits with code 1
```

Reports are written to `reports/`.

## Evaluators

| Evaluator | Catches | Gate |
| --- | --- | --- |
| Groundedness | Sentences and invented numbers with no support in the sources | Counts toward pass rate |
| Citations | Missing citations, and citations pointing at sources that don't exist | Counts toward pass rate |
| Completeness | Required facts left out | Counts toward pass rate |
| Refusal | Guessing when the sources don't hold the answer | Counts toward pass rate |
| Injection | Following instructions planted in a retrieved document | Zero tolerance |
| PII | Emails, SSNs and card numbers in answers | Zero tolerance |

## Testing the tests

`recordings/model-v2-regressed.json` contains one seeded defect per evaluator. The suite asserts that each is caught by the right evaluator, because a gate that has never failed proves nothing.

## Known limits

The evaluators are deterministic heuristics, chosen so results are repeatable and explainable. Word overlap can miss a sentence that reuses source words to say something false, such as a dropped "not". A production setup would add semantic or model-graded checks on top, keeping these as a fast first layer.

## Test a real model

Implement the `Responder` type in `src/types.ts` with your model client and pass it to `runEval`.
