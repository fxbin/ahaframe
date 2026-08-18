"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadRuntimeScripts, type MissionRuntime, type MissionSnapshot, type RuntimeRecord } from "@/lib/runtime-client";
import { runtimeExperience, type RuntimeExperienceKey } from "@/lib/runtime-manifest";
import type { RuntimeStatus } from "@/hooks/use-lab-runtime";

type MissionRuntimeState = {
  key: RuntimeExperienceKey;
  status: RuntimeStatus;
  snapshot: MissionSnapshot | null;
  error: string | null;
};

export function useMissionRuntime(experienceKey: RuntimeExperienceKey) {
  const definition = runtimeExperience(experienceKey);
  const runtimeRef = useRef<MissionRuntime | null>(null);
  const [runtimeState, setRuntimeState] = useState<MissionRuntimeState>({ key: experienceKey, status: "loading", snapshot: null, error: null });

  useEffect(() => {
    if (definition.kind !== "mission") return;

    let cancelled = false;

    loadRuntimeScripts(definition.scripts)
      .then((api) => {
        if (cancelled) return;
        if (!api.createMission) throw new Error("AhaFrame Mission Engine API is not available after runtime load.");
        const runtime = api.createMission(definition.runtimeId, { labOptions: { track: false } });
        runtimeRef.current = runtime;
        setRuntimeState({ key: experienceKey, status: "ready", snapshot: runtime.getSnapshot(), error: null });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        runtimeRef.current = null;
        setRuntimeState({ key: experienceKey, status: "error", snapshot: null, error: reason instanceof Error ? reason.message : String(reason) });
      });

    return () => {
      cancelled = true;
      runtimeRef.current = null;
    };
  }, [definition.kind, definition.runtimeId, definition.scripts, experienceKey]);

  const requireRuntime = useCallback(() => {
    if (!runtimeRef.current) throw new Error(`Mission runtime ${experienceKey} is not ready.`);
    return runtimeRef.current;
  }, [experienceKey]);

  const commitSnapshot = useCallback((snapshot: MissionSnapshot) => {
    setRuntimeState({ key: experienceKey, status: "ready", snapshot, error: null });
    return snapshot;
  }, [experienceKey]);

  const refresh = useCallback(() => commitSnapshot(requireRuntime().getSnapshot()), [commitSnapshot, requireRuntime]);
  const kindError = definition.kind === "mission" ? null : `${experienceKey} is not a Mission runtime experience.`;
  const visibleState = runtimeState.key === experienceKey ? runtimeState : { key: experienceKey, status: "loading" as const, snapshot: null, error: null };

  return {
    status: kindError ? "error" as const : visibleState.status,
    error: kindError ?? visibleState.error,
    snapshot: kindError ? null : visibleState.snapshot,
    start: useCallback(() => commitSnapshot(requireRuntime().start()), [commitSnapshot, requireRuntime]),
    inspectEvidence: useCallback((id: string) => {
      const result = requireRuntime().inspectEvidence(id);
      refresh();
      return result;
    }, [refresh, requireRuntime]),
    intervene: useCallback((id: string, payload?: RuntimeRecord) => {
      const result = requireRuntime().intervene(id, payload);
      refresh();
      return result;
    }, [refresh, requireRuntime]),
    runSimulation: useCallback(() => {
      const result = requireRuntime().runSimulation();
      refresh();
      return result;
    }, [refresh, requireRuntime]),
    compareAttempts: useCallback((left: number, right: number) => requireRuntime().compareAttempts(left, right), [requireRuntime]),
    restoreAttempt: useCallback((number: number) => {
      const result = requireRuntime().restoreAttempt(number);
      refresh();
      return result;
    }, [refresh, requireRuntime]),
    readyToDecide: useCallback(() => commitSnapshot(requireRuntime().readyToDecide()), [commitSnapshot, requireRuntime]),
    submitReleaseDecision: useCallback((decision: string) => commitSnapshot(requireRuntime().submitReleaseDecision(decision)), [commitSnapshot, requireRuntime]),
    complete: useCallback(() => commitSnapshot(requireRuntime().complete()), [commitSnapshot, requireRuntime]),
    reset: useCallback(() => commitSnapshot(requireRuntime().reset()), [commitSnapshot, requireRuntime]),
    listAttempts: useCallback(() => requireRuntime().listAttempts(), [requireRuntime]),
  };
}
