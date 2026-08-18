import runtimeManifest from "@/runtime-experiences.json";

export type RuntimeKind = "lab" | "mission";
export type RuntimeExperienceKey = keyof typeof runtimeManifest.experiences;

export interface RuntimeExperience {
  kind: RuntimeKind;
  runtimeId: string;
  scripts: string[];
}

export function hasRuntimeExperience(key: string): key is RuntimeExperienceKey {
  return Object.prototype.hasOwnProperty.call(runtimeManifest.experiences, key);
}

export function runtimeExperience(key: RuntimeExperienceKey): RuntimeExperience {
  return runtimeManifest.experiences[key] as RuntimeExperience;
}
