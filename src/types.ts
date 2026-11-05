export type CaseKind = 'answerable' | 'out-of-scope' | 'injection';

/** One entry in the golden dataset. */
export interface EvalCase {
  id: string;
  kind: CaseKind;
  question: string;
  /** Numbered source passages given to the model; [1] refers to sources[0]. */
  sources: string[];
  /** Facts a correct answer must contain, each listing acceptable wordings. */
  mustInclude?: string[][];
}

export interface EvalResult {
  evaluator: string;
  passed: boolean;
  /** Between 0 and 1. */
  score: number;
  reason: string;
}

/**
 * Anything that can answer a case. This repo replays recorded answers so runs are
 * deterministic and free. To test a live model, implement this with your own client.
 */
export type Responder = (testCase: EvalCase) => Promise<string>;
