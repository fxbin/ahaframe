"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadRuntimeScripts, type LabFrame, type LabRuntime, type RuntimeRecord } from "@/lib/runtime-client";
import { runtimeExperience, type RuntimeExperienceKey } from "@/lib/runtime-manifest";

export type RuntimeStatus = "loading" | "ready" | "error";

export function useLabRuntime(experienceKey: RuntimeExperienceKey) {
  const definition = runtimeExperience(experienceKey);
  const runtimeRef = useRef<LabRuntime | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>("loading");
  const [frame, setFrame] = useState<LabFrame | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (definition.kind !== "lab") {
      setStatus("error");
      setError(`${experienceKey} is not a Lab runtime experience.`);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    setStatus("loading");
    setError(null);

    loadRuntimeScripts(definition.scripts)
      .then((api) => {
        if (cancelled) return;
        const runtime = api.createLab(definition.runtimeId, { track: false });
        runtimeRef.current = runtime;
        unsubscribe = runtime.subscribe((nextFrame) => {
          if (!cancelled) setFrame(nextFrame);
        });
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
      unsubscribe?.();
      runtimeRef.current = null;
    };
  }, [definition.kind, definition.runtimeId, definition.scripts, experienceKey]);

  const requireRuntime = useCallback(() => {
    if (!runtimeRef.current) throw new Error(`Lab runtime ${experienceKey} is not ready.`);
    return runtimeRef.current;
  }, [experienceKey]);

  return {
    status,
    error,
    frame,
    dispatch: useCallback((typeOrAction: string | RuntimeRecord, payload?: RuntimeRecord) => requireRuntime().dispatch(typeOrAction, payload), [requireRuntime]),
    reset: useCallback(() => requireRuntime().reset(), [requireRuntime]),
    checkpoint: useCallback((name?: string) => requireRuntime().checkpoint(name), [requireRuntime]),
    compare: useCallback((left: unknown, right?: unknown) => requireRuntime().compare(left, right), [requireRuntime]),
    replay: useCallback((actions: RuntimeRecord[], options?: RuntimeRecord) => requireRuntime().replay(actions, options), [requireRuntime]),
    getHistory: useCallback(() => requireRuntime().getHistory(), [requireRuntime]),
  };
}
