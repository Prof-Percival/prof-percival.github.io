import { env, LogLevel, pipeline } from '@huggingface/transformers';
import runtimeModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url';
import runtimeWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';

import {
  localAiModel,
  rankGuideEmbeddings,
  type EmbeddedGuideAnswer,
  type GuideAiRequest,
  type GuideAiResponse,
  type GuideAiDocument,
} from '../data/guide-ai';

interface FeatureExtractor {
  (input: string[], options: { pooling: 'mean'; normalize: true }): Promise<{ tolist: () => unknown }>;
}

const workerScope = self as unknown as {
  location: Location;
  onmessage: ((event: MessageEvent<GuideAiRequest>) => void) | null;
  postMessage: (message: GuideAiResponse) => void;
};
const nativeFetch = globalThis.fetch.bind(globalThis);

function isAllowedModelUrl(url: URL): boolean {
  return (
    url.origin === workerScope.location.origin ||
    url.hostname === 'huggingface.co' ||
    url.hostname === 'us.aws.cdn.hf.co'
  );
}

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.remoteHost = 'https://huggingface.co/';
env.useBrowserCache = true;
env.useWasmCache = false;
env.experimental_useCrossOriginStorage = false;
env.logLevel = LogLevel.ERROR;
env.fetch = (input, init) => {
  const url = new URL(input instanceof URL ? input.href : input, workerScope.location.href);
  if (!isAllowedModelUrl(url)) return Promise.reject(new Error('Unexpected model host'));
  return nativeFetch(input, init);
};

if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.wasmPaths = {
    mjs: runtimeModuleUrl,
    wasm: runtimeWasmUrl,
  };
}

let extractor: FeatureExtractor | undefined;
let documents: GuideAiDocument[] = [];
let embeddedAnswers: EmbeddedGuideAnswer[] = [];

function post(message: GuideAiResponse): void {
  workerScope.postMessage(message);
}

async function createExtractor(): Promise<FeatureExtractor> {
  const loaded = await pipeline('feature-extraction', localAiModel.id, {
    device: 'wasm',
    dtype: localAiModel.dtype,
    revision: localAiModel.revision,
    progress_callback: (event) => {
      if (event.status !== 'progress_total') return;
      post({
        type: 'progress',
        stage: 'download',
        progress: event.progress,
        loaded: event.loaded,
        total: event.total,
      });
    },
  });
  return loaded as FeatureExtractor;
}

async function embed(input: string[]): Promise<number[][]> {
  if (!extractor) throw new Error('Local model is not ready');
  const output = await extractor(input, { pooling: 'mean', normalize: true });
  const values = output.tolist();
  if (!Array.isArray(values) || values.some((value) => !Array.isArray(value))) {
    throw new Error('Local model returned an invalid embedding');
  }
  return values as number[][];
}

async function initialize(nextDocuments: GuideAiDocument[]): Promise<void> {
  if (nextDocuments.length === 0) throw new Error('No guide documents were provided');
  documents = nextDocuments;
  post({ type: 'progress', stage: 'download', progress: 0 });
  extractor ??= await createExtractor();
  post({ type: 'progress', stage: 'indexing', progress: 100 });
  const embeddings = await embed(documents.map((document) => document.text));
  if (embeddings.length !== documents.length) throw new Error('Guide index is incomplete');
  embeddedAnswers = documents.map((document, index) => ({
    id: document.id,
    embedding: embeddings[index] ?? [],
  }));
  post({ type: 'ready' });
}

async function rank(requestId: number, query: string, limit: number): Promise<void> {
  if (!extractor || embeddedAnswers.length === 0) throw new Error('Local model is not ready');
  const [queryEmbedding] = await embed([query]);
  const ranked = rankGuideEmbeddings(queryEmbedding ?? [], embeddedAnswers, limit);
  post({
    type: 'result',
    requestId,
    answerIds: ranked.map((result) => result.id),
  });
}

async function handleMessage(message: GuideAiRequest): Promise<void> {
  if (message.type === 'initialize') {
    await initialize(message.documents);
    return;
  }
  await rank(message.requestId, message.query, message.limit);
}

workerScope.onmessage = (event) => {
  void handleMessage(event.data).catch(() => post({ type: 'error' }));
};
