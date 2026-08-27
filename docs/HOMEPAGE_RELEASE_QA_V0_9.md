# Homepage Release QA v0.9

Status: release gate for #132  
Scope: public AhaFrame homepage, Learning Map projection, First-Aha interaction, internationalization navigation

## Release contract

The homepage is a **First-Aha experience, not a dashboard**. A release passes only if the following hierarchy remains intact:

1. First-Aha incident and causal insight
2. learning method
3. flagship incidents
4. compact canonical learning-map preview
5. commitment / next action

The full progression engine, prerequisite backfill, transfer and review state remain owned by `/learning/`.

## Responsive matrix

CI exercises the homepage at representative widths:

| Class | Viewport | Required behavior |
| --- | --- | --- |
| Mobile | 390 × 844 | no horizontal overflow; trace, controls and map stack intentionally |
| Tablet | 768 × 1024 | no horizontal overflow; hierarchy preserved |
| Desktop | 1440 × 900 | editorial hierarchy preserved; compact map remains below flagship incidents |

The automated gate verifies Hero → Campaign → Learning Map document order at every width rather than relying on pixel-perfect screenshots that are brittle across font environments.

## Accessibility contract

- exactly one homepage `h1`;
- First-Aha intervention buttons are native buttons with `aria-pressed` and keyboard activation;
- primary intervention touch target is at least 44px high;
- language selector is keyboard-operable and exposes the target locale only after opening the menu;
- failure/success meaning is expressed with text signals and consequences, not color alone;
- global `:focus-visible` rules remain active;
- global `prefers-reduced-motion` rules disable smooth scrolling and shorten transitions.

## Internationalization contract

The header language control is intentionally neutral:

```text
🌐 EN ▾
🌐 ZH-CN ▾
```

The closed control identifies the **current locale**. Human-readable language names (`English`, `简体中文`) live inside the language menu. This avoids presenting Chinese text as an unexplained action on the English interface and scales to future locales.

Locale switching must preserve the current route and query string where an equivalent route exists.

EN and zh-CN ship together and share the same canonical 10-stage Learning Graph structure.

## SEO / crawlability

Automated checks verify:

- correct `<html lang>` for EN and zh-CN;
- one canonical URL per localized homepage;
- reciprocal EN / zh-CN `hreflang` alternates;
- homepage positioning, incidents and learning-map stages remain server-rendered links/text;
- stage links are real anchors into `/learning/#<stage-slug>`;
- existing public Lab/Mission route smoke tests remain part of the main CI gate.

## Performance contract

The First-Aha hero must remain lightweight:

- no hero image dependency;
- no hero video or iframe dependency;
- deterministic interaction remains local/client-side;
- no animation bundle is required for the core causal insight;
- below-the-fold Learning Map is rendered from canonical server data and introduces no progress/runtime client state.

Runtime CI continues to require production `next build`, browser-secret scan and public-route smoke before interaction tests run.

## Analytics contract

Keep only events that answer a product question:

| Event | Product question |
| --- | --- |
| `first_aha_incident_viewed` | Did the visitor reach the First-Aha proof? |
| `first_aha_intervention_selected` | Did they engage with the engineering decision? |
| `first_aha_consequence_observed` | Did the interaction expose a consequence? |
| `first_aha_cta_clicked` | Did the First-Aha create intent to investigate the real experience? |
| `homepage_learning_map_opened` | Did the depth preview create intent to explore the full path? |

Expected acquisition path:

```text
homepage First-Aha
→ intervention / consequence
→ investigate CTA
→ real Lab/Mission route
→ canonical runtime start
```

Homepage analytics must not replace or duplicate semantic Mission/Lab runtime events after navigation.

## Trust-content rule

Production must not introduce fabricated social proof or learning claims. Forbidden examples include:

- fake user counts;
- fake star ratings;
- invented customer/company logos;
- unsupported testimonials;
- anonymous `completed`, `mastered` or similar learning claims.

The homepage Learning Map intentionally displays **structure only**. Real anonymous learning state appears only on the full Learning Path surface.

## Release evidence

#132 is complete when:

- the full repository CI is green after #131;
- the responsive/A11y/SEO/performance/trust tests in `homepage-quality.spec.ts` pass;
- EN and zh-CN live routes are reachable after merge;
- the neutral language selector and canonical Learning Map are visible in the deployed release;
- no P0/P1 regression is found in the final production smoke.
