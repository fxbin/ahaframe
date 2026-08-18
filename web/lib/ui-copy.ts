import type { Locale } from "@/lib/content";

export interface CommonUiCopy {
  inOneSentence: string;
  objective: string;
  stakes: string;
  metrics: string;
  incidentLedger: string;
  keyTakeaways: string;
  commonQuestions: string;
  buildChallenge: string;
  productionLab: string;
  evidence: string;
  minutes: string;
  experiences: string;
}

const COPY: Record<Locale, CommonUiCopy> = {
  en: {
    inOneSentence: "In one sentence",
    objective: "Objective",
    stakes: "Stakes",
    metrics: "Metrics",
    incidentLedger: "Incident ledger",
    keyTakeaways: "Key takeaways",
    commonQuestions: "Common questions",
    buildChallenge: "Build challenge",
    productionLab: "Production Lab",
    evidence: "Evidence",
    minutes: "min",
    experiences: "experiences",
  },
  "zh-CN": {
    inOneSentence: "一句话理解",
    objective: "目标",
    stakes: "风险",
    metrics: "指标",
    incidentLedger: "事故经验",
    keyTakeaways: "关键要点",
    commonQuestions: "常见问题",
    buildChallenge: "构建挑战",
    productionLab: "生产实验",
    evidence: "证据",
    minutes: "分钟",
    experiences: "个体验",
  },
};

export function commonUi(locale: Locale): CommonUiCopy {
  return COPY[locale];
}
