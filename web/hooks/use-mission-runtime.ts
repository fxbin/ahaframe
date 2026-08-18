"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadRuntimeScripts, type MissionRuntime, type MissionSnapshot, type RuntimeRecord } from "@/lib/runtime-client";
import { runtimeExperience, type RuntimeExperienceKey } from "@/lib/runtime-manifest";
import type { RuntimeStatus } from "@/hooks/use-lab-runtime";

export function useMissionRuntime(experienceKey: RuntimeExperienceKey) {
  const definition = runtimeExperience(experienceKey);
  const runtimeRef = useRef<MissionRuntime | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>("loading");
  const [snapshot, setSnapshot] = useState<MissionSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (definition.kind !== "mission") {
      setStatus("error");
      setError(`${experienceKey} is not a Mission runtime experience.`);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    loadRuntimeScripts(definition.scripts)
      .then((api) => {
        if (cancelled) return;
        if (!api.createMission) {
          throw new Error("AhaFrame Mission Engine API is not available after runtime load.");
        }
        const runtime = api.createMission(definition.runtimeId, { labOptions: { track: false } });
        runtimeRef.current = runtime;
        setSnapshot(runtime.getSnapshot());
        setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        runtimeRef.current = null;
        setStatus("error");
        setError(reason instanceof Error ? reason.message : String(reason));
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

  const refresh = useCallback(() => {
    const next = requireRuntime().getSnapshot();
    setSnapshot(next);
    return next;
  }, [requireRuntime]);

  return {
    status,
    error,
    snapshot,
    start: useCallback(() => {
      const next = requireRuntime().start();
      setSnapshot(next);
      return next;
    }, [requireRuntime]),
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
    readyToDecide: useCallback(() => {
      const next = requireRuntime().readyToDecide();
      setSnapshot(next);
      return next;
    }, [requireRuntime]),
    submitReleaseDecision: useCallback((decision: string) => {
      const next = requireRuntime().submitReleaseDecision(decision);
      setSnapshot(next);
      return next;
    }, [requireRuntime]),
    complete: useCallback(() => {
      const next = requireRuntime().complete();
      setSnapshot(next);
      return next;
    }, [requireRuntime]),
    reset: useCallback(() => {
      const next = requireRuntime().reset();
      setSnapshot(next);
      return next;
    }, [requireRuntime]),
    listAttempts: useCallback(() => requireRuntime().listAttempts(), [requireRuntime]),
  };
}
