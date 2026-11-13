import type { GuideAnswer, GuideAnswerId } from './guide';

export const localAiModel = {
  id: 'Xenova/all-MiniLM-L6-v2',
  revision: '751bff37182d3f1213fa05d7196b954e230abad9',
  dtype: 'int8',
  approximateDownloadMb: 39,
  license: 'Apache 2.0',
  detailsHref: 'https://huggingface.co/Xenova/all-MiniLM-L6-v2',
} as const;

export type GuideAiDocument = {
  id: GuideAnswerId;
  text: string;
};

export type EmbeddedGuideAnswer = {
  id: GuideAnswerId;
  embedding: readonly number[];
};

export type GuideAiRequest =
  | { type: 'initialize'; documents: GuideAiDocument[] }
  | { type: 'rank'; requestId: number; query: string; limit: number };

export type GuideAiResponse =
  | {
      type: 'progress';
      stage: 'download' | 'indexing';
      progress: number;
      loaded?: number;
      total?: number;
    }
  | { type: 'ready' }
  | { type: 'result'; requestId: number; answerIds: GuideAnswerId[] }
  | { type: 'error' };

export type GuideAiRank = {
  id: GuideAnswerId;
  score: number;
};

export function createGuideAiDocuments(answers: readonly GuideAnswer[]): GuideAiDocument[] {
  return answers.map((answer) => ({
    id: answer.id,
    text: [answer.prompt, answer.title, answer.keywords.join(' '), answer.answer].join('\n'),
  }));
}

export function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
  if (left.length === 0 || left.length !== right.length) return 0;

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export function rankGuideEmbeddings(
  queryEmbedding: readonly number[],
  candidates: readonly EmbeddedGuideAnswer[],
  limit = 3,
  minimumScore = 0.24
): GuideAiRank[] {
  const resultLimit = Math.max(0, Math.floor(limit));
  if (queryEmbedding.length === 0 || resultLimit === 0) return [];

  return candidates
    .map((candidate, index) => ({
      id: candidate.id,
      index,
      score: cosineSimilarity(queryEmbedding, candidate.embedding),
    }))
    .filter((candidate) => candidate.score >= minimumScore)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, resultLimit)
    .map(({ id, score }) => ({ id, score }));
}
