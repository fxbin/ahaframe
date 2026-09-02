import Link from "next/link";
import type { KnowledgeMap, KnowledgeMapBranch } from "@/lib/knowledge-map";

function copy(locale: KnowledgeMap["locale"]) {
  return locale === "en"
    ? {
        kicker: "AI KNOWLEDGE MAP · V1.0",
        title: "Explore AI as a connected knowledge map.",
        intro: "Open a domain only when you want to inspect the underlying concepts. If you want a clear learning order, Courses is the simpler entry point.",
        branches: "branches",
        concepts: "concepts",
        shared: "shared",
        coursesKicker: "Prefer a clear path?",
        coursesTitle: "Use Courses for goal-oriented learning.",
        coursesCopy: "The same canonical knowledge is projected into 15 simpler learning paths, without duplicating the graph here.",
        coursesCta: "Browse all courses",
      }
    : {
        kicker: "AI 知识地图 · V1.0",
        title: "把 AI 当作一张相互连接的知识地图来探索。",
        intro: "只有当你想查看底层知识关系时，再展开某个领域。如果你更需要清晰的学习顺序，课程页会更简单。",
        branches: "个分支",
        concepts: "个知识点",
        shared: "跨路径复用",
        coursesKicker: "更想按顺序学？",
        coursesTitle: "用课程页选择目标导向的学习路径。",
        coursesCopy: "同一套 canonical knowledge 会投影成 15 条更简单的学习路径，这里不再重复展开第二套课程结构。",
        coursesCta: "查看全部课程",
      };
}

interface KnowledgeMapOverviewProps {
  map: KnowledgeMap;
}

export function KnowledgeMapOverview({ map }: KnowledgeMapOverviewProps) {
  const labels = copy(map.locale);
  const segment = map.locale === "zh-CN" ? "zh-cn" : "en";
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
    <section className="border-y border-[var(--border)] bg-white py-14 sm:py-18" data-testid="knowledge-map-v1">
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

        <div className="mt-12 grid gap-5 border-t border-[var(--border)] pt-8 sm:grid-cols-[1fr_auto] sm:items-end" data-testid="knowledge-map-courses-bridge">
          <div className="max-w-3xl">
            <p className="technical-label">{labels.coursesKicker}</p>
            <h3 className="mt-2 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{labels.coursesTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{labels.coursesCopy}</p>
          </div>
          <Link className="editorial-text-link" href={`/${segment}/courses/`}>
            {labels.coursesCta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
