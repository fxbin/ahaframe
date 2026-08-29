import type { Locale } from "@/lib/content";
import { getProductionExperience } from "@/lib/content-access-server";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getLearningGraph, getLearningUxContent } from "@/lib/learning-graph-server";
import { getMissionContent } from "@/lib/mission";
import { LearningContextPanel } from "@/components/learning-context-panel";

interface LearningContextProps {
  locale: Locale;
  contentId: string;
}

export async function LearningContext({ locale, contentId }: LearningContextProps) {
  const [graph, ux] = await Promise.all([getLearningGraph(locale), getLearningUxContent(locale)]);
  const node = graph.contentNodes.find((item) => item.id === contentId);
  const details = ux.content[contentId];

  if (node && details) {
    const modelsById = new Map(graph.models.map((model) => [model.id, model]));
    const nodesById = new Map(graph.contentNodes.map((item) => [item.id, item]));
    const modelTitles = node.modelIds
      .map((id) => modelsById.get(id))
      .filter((model): model is NonNullable<typeof model> => Boolean(model))
      .map(({ id, title }) => ({ id, title }));
    const backfills = (node.recommendedBackfillIds ?? [])
      .map((id) => nodesById.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map(({ id, title, route }) => ({ id, title, route }));

    return (
      <LearningContextPanel
        locale={locale}
        contentId={contentId}
        modelTitles={modelTitles}
        backfills={backfills}
        reviewEligible={node.reviewEligible}
        debrief={details.debrief}
        transfer={details.transfer}
        labels={ux.page}
        states={ux.states}
      />
    );
  }

  // Knowledge Graph v1 Experiences deliberately keep lifecycle/path/concept/access
  // classification in the production manifest instead of cloning it into v0.9.
  // Reuse the same progress/transfer UI while resolving knowledge identity from
  // the v1 concept inventory.
  const [experience, knowledgeMap, mission] = await Promise.all([
    getProductionExperience(contentId),
    getKnowledgeMap(locale),
    getMissionContent(locale, contentId),
  ]);
  if (!experience || experience.status !== "EXISTING" || !mission) return null;

  const conceptsById = new Map(knowledgeMap.concepts.map((concept) => [concept.id, concept]));
  const conceptTitles = experience.conceptIds
    .map((id) => conceptsById.get(id))
    .filter((concept): concept is NonNullable<typeof concept> => Boolean(concept))
    .map(({ id, title }) => ({ id, title }));
  if (!conceptTitles.length) return null;

  return (
    <LearningContextPanel
      locale={locale}
      contentId={contentId}
      modelTitles={conceptTitles}
      backfills={[]}
      reviewEligible={experience.nodeType !== "PLAYGROUND"}
      debrief={mission.debrief.rule}
      transfer={mission.transferPrompt ?? mission.next.description}
      labels={ux.page}
      states={ux.states}
      knowledgeLabel={locale === "zh-CN" ? "本次练习的 CONCEPT" : "CONCEPTS PRACTICED"}
    />
  );
}
