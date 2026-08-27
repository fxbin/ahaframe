import type { Locale } from "@/lib/content";
import { getLearningGraph, getLearningUxContent } from "@/lib/learning-graph-server";
import { LearningContextPanel } from "@/components/learning-context-panel";

interface LearningContextProps {
  locale: Locale;
  contentId: string;
}

export async function LearningContext({ locale, contentId }: LearningContextProps) {
  const [graph, ux] = await Promise.all([getLearningGraph(locale), getLearningUxContent(locale)]);
  const node = graph.contentNodes.find((item) => item.id === contentId);
  const details = ux.content[contentId];
  if (!node || !details) return null;

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
