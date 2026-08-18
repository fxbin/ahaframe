export type RuntimeRecord = Record<string, unknown>;

export interface LabFrame {
  id: string;
  version: string;
  state: RuntimeRecord;
  derived: RuntimeRecord;
  action: RuntimeRecord | null;
  historyLength: number;
}

export interface LabRuntime {
  id: string;
  version: string;
  dispatch(typeOrAction: string | RuntimeRecord, payload?: RuntimeRecord): LabFrame;
  reset(options?: RuntimeRecord): LabFrame;
  subscribe(listener: (frame: LabFrame) => void, options?: RuntimeRecord): () => void;
  checkpoint(name?: string): LabFrame;
  compare(left: unknown, right?: unknown): RuntimeRecord;
  replay(actions: RuntimeRecord[], options?: RuntimeRecord): LabFrame;
  getFrame(): LabFrame;
  getHistory(): RuntimeRecord[];
  getCheckpoint(name: string): LabFrame | null;
  clearHistory(): void;
}

export interface MissionSnapshot {
  mission: RuntimeRecord;
  frame: LabFrame;
  constraints: RuntimeRecord[];
}

export interface MissionRuntime {
  id: string;
  version: string;
  scenarioId: string;
  start(): MissionSnapshot;
  inspectEvidence(id: string): { id: string; value: unknown };
  intervene(id: string, payload?: RuntimeRecord): RuntimeRecord;
  runSimulation(): RuntimeRecord;
  compareAttempts(left: number, right: number): RuntimeRecord;
  restoreAttempt(number: number): RuntimeRecord;
  readyToDecide(): MissionSnapshot;
  submitReleaseDecision(decision: string): MissionSnapshot;
  complete(): MissionSnapshot;
  reset(): MissionSnapshot;
  getSnapshot(): MissionSnapshot;
  getMissionState(): RuntimeRecord;
  getLabFrame(): LabFrame;
  listAttempts(): RuntimeRecord[];
}

export interface AhaFrameRuntimeApi {
  createLab(id: string, options?: RuntimeRecord): LabRuntime;
  createMission?: (id: string, options?: RuntimeRecord) => MissionRuntime;
  getLabScenario?(id: string): unknown;
  getMission?(id: string): unknown;
}

declare global {
  interface Window {
    AhaFrame?: AhaFrameRuntimeApi;
  }
}

const scriptLoads = new Map<string, Promise<void>>();

function loadRuntimeScript(asset: string): Promise<void> {
  const prior = scriptLoads.get(asset);
  if (prior) return prior;

  const promise = new Promise<void>((resolve, reject) => {
    const selector = `script[data-ahaframe-runtime="${CSS.escape(asset)}"]`;
    const existing = document.querySelector<HTMLScriptElement>(selector);
    if (existing?.dataset.runtimeLoaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onLoad = () => {
      script.dataset.runtimeLoaded = "true";
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      scriptLoads.delete(asset);
      reject(new Error(`Failed to load AhaFrame runtime asset: ${asset}`));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.src = `/runtime/${asset}`;
      script.async = false;
      script.dataset.ahaframeRuntime = asset;
      document.head.appendChild(script);
    }
  });

  scriptLoads.set(asset, promise);
  return promise;
}

export async function loadRuntimeScripts(assets: readonly string[]): Promise<AhaFrameRuntimeApi> {
  if (typeof window === "undefined") {
    throw new Error("AhaFrame interaction runtime can only be loaded in the browser.");
  }
  for (const asset of assets) {
    await loadRuntimeScript(asset);
  }
  if (!window.AhaFrame?.createLab) {
    throw new Error("AhaFrame runtime loaded without the expected Lab Engine API.");
  }
  return window.AhaFrame;
}
