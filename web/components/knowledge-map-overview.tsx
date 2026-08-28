import type { KnowledgeMap, KnowledgeMapBranch } from "@/lib/knowledge-map";

function copy(locale: KnowledgeMap["locale"]) {
  return locale === "en"
    ? {
        kicker: "AI KNOWLEDGE MAP · V1.0",
        title: "Explore AI as a connected knowledge map.",
        intro: "Browse the tree by domain, then follow a goal-oriented path. Shared concepts appear once in the graph even when they power many workflows.",
        branches: "branches",
        concepts: "concepts",
        paths: "Learning paths",
        pathIntro: "Choose a goal. A path is a projection over the same canonical knowledge—not a duplicated course.",
        goal: "Goal",
        deliverable: "Deliverable",
        milestones: "milestones",
        shared: "shared",
      }
    : {
        kicker: "AI 知识地图 · V1.0",
        title: "把 AI 当作一张相互连接的知识地图来探索。",
        intro: "先按领域展开知识树，再按目标选择学习路径。同一个 Concept 可以服务多个工作流，但在底层图谱里只保留一份。",
        branches: "个分支",
        concepts: "个知识点",
        paths: "学习路径",
        pathIntro: "选择一个目标。Path 只是同一套 canonical knowledge 的投影，不复制第二套课程。",
        goal: "目标",
        deliverable: "产出",
        milestones: "个里程碑",
        shared: "跨路径复用",
      };
}

interface KnowledgeMapOverviewProps {
  map: KnowledgeMap;
}

export function KnowledgeMapOverview({ map }: KnowledgeMapOverviewProps) {
  const labels = copy(map.locale);
  const childrenByParent = new Map<string | null, KnowledgeMapBranch[]>();
  for (const branch of map.branches) {
    const current = childrenByParent.get(branch.parentBranchId) ?? [];
    current.push(branch);
    childrenByParent.set(branch.parentBranchId, current);
  }
  for (const branches of childrenByParent.values()) branches.sort((a, b) => a.order - b.order);

  const conceptsByPrimaryBranch = new Map<string, typeof map.concepts>();
  for (const concept of map.concepts) {
    const current = conceptsByPrimaryBranch.get(concept.primaryBranchId) ?? [];
    current.push(concept);
    conceptsByPrimaryBranch.set(concept.primaryBranchId, current);
  }

  function Branch({ branch, depth = 0 }: { branch: KnowledgeMapBranch; depth?: number }) {
    const children = childrenByParent.get(branch.id) ?? [];
    const concepts = conceptsByPrimaryBranch.get(branch.id) ?? [];
    return (
      <details className="border-t border-[var(--border)] py-4" data-branch-id={branch.id}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
          <span style={{ paddingLeft: `${depth * 0.75}rem` }}>
            <span className="block text-sm font-bold">{branch.title}</span>
            <span className="mt-1 block max-w-2xl text-xs leading-5 text-[var(--muted)]">{branch.description}</span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">{concepts.length}</span>
        </summary>
        <div className="mt-4 space-y-1 pl-3 sm:pl-5">
          {concepts.map((concept) => (
            <div key={concept.id} className="flex items-start justify-between gap-4 border-l border-[var(--border)] py-2 pl-4 text-sm">
              <span>
                <span className="font-medium">{concept.title}</span>
                <span className="ml-2 font-mono text-[9px] uppercase text-[var(--muted)]">{concept.kind}</span>
              </span>
              {concept.branchIds.length > 1 ? <span className="shrink-0 font-mono text-[9px] text-[var(--primary)]">{labels.shared}</span> : null}
            </div>
          ))}
          {children.map((child) => <Branch key={child.id} branch={child} depth={depth + 1} />)}
        </div>
      </details>
    );
  }

  return (
    <section className="border-y border-[var(--border)] bg-white py-16 sm:py-20" data-testid="knowledge-map-v1">
      <div className="shell">
        <div className="max-w-4xl">
          <p className="eyebrow-label">{labels.kicker}</p>
          <h2 className="section-title mt-4">{labels.title}</h2>
          <p className="section-copy">{labels.intro}</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {map.domains.map((domain) => {
            const domainBranches = map.branches.filter((branch) => branch.domainId === domain.id);
            const domainConceptIds = new Set(
              map.concepts.filter((concept) => concept.branchIds.some((branchId) => domainBranches.some((branch) => branch.id === branchId))).map((concept) => concept.id),
            );
            const roots = domainBranches.filter((branch) => branch.parentBranchId === null).sort((a, b) => a.order - b.order);
            return (
              <details key={domain.id} className="report-panel p-5" data-testid={`knowledge-domain-${domain.slug}`}>
                <summary className="cursor-pointer list-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
                  <p className="technical-label">{String(domain.order + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{domain.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{domain.description}</p>
                  <p className="mt-4 border-t border-[var(--border)] pt-3 font-mono text-[10px] text-[var(--muted)]">
                    {domainBranches.length} {labels.branches} · {domainConceptIds.size} {labels.concepts}
                  </p>
                </summary>
                <div className="mt-5">
                  {roots.map((branch) => <Branch key={branch.id} branch={branch} />)}
                </div>
              </details>
            );
          })}
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-10">
          <p className="eyebrow-label">{labels.paths}</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{labels.pathIntro}</p>
          <div className="mt-8 grid gap-x-10 lg:grid-cols-2" data-testid="knowledge-paths-v1">
            {map.paths.map((path) => (
              <details key={path.id} className="border-b border-[var(--border)] py-5" data-path-id={path.id}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
                  <span>
                    <span className="block font-bold">{path.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{path.description}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-[var(--primary)]">{path.kind}</span>
                </summary>
                <div className="mt-4 space-y-4 border-l border-[var(--border)] pl-4 text-sm leading-6">
                  <p><strong>{labels.goal}:</strong> {path.goal}</p>
                  <p><strong>{labels.deliverable}:</strong> {path.deliverable}</p>
                  <p className="font-mono text-[10px] text-[var(--muted)]">{path.milestones.length} {labels.milestones}</p>
                  <ol className="space-y-2">
                    {path.milestones.map((milestone, index) => (
                      <li key={milestone.id} className="flex gap-3">
                        <span className="font-mono text-[10px] text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</span>
                        <span>{milestone.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
