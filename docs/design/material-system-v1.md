# AhaFrame Material System v1.1

The goal is a **calm learning product with selective liquid glass**, not transparent cards everywhere. The original three reference screens remain the design baseline. Real product data and accessible content take priority over purely decorative matching.

## Roles

| Material | Applied to | Opacity / effect | Why |
| --- | --- | --- | --- |
| Chrome | Header, search palette | Highly legible translucent surface, 22px desktop blur | Controls remain clearly separated from page content. |
| Instrument | Homepage Agent example, Radar status/metrics/calendar | 80% warm surface, 14px desktop blur | Mild layered depth around interactions. |
| Support | Guide outline, verification sidebar | 91% surface, 14px blur | Keeps navigation and event logs readable. |
| Reading | Long-form Guide, course summary | **Opaque**, no blur | Long-form text must not compete with reflections. |

Tokens are in `web/app/material-system.css`, loaded *after* historical page-specific geometry CSS. Change material colors, radii, borders and shadows in this one file. Layout grids and responsive placement remain in `liquid-glass.css` and `mockup-parity.css` until the next geometry-only consolidation.

## Design rules

1. The copper accent denotes brand/action and selection; true monitoring states continue to use green, amber or neutral based on their actual source data.
2. Reflections belong on material edges, not behind paragraphs. Avoid decorative gloss that reduces contrast.
3. Search must render from the body-level portal, above sticky navigation, without clipping on mobile keyboards.
4. Layered blur is turned down on small screens; high-contrast and reduced-transparency conditions replace all frosted materials with an opaque paper surface.
5. No fabricated reset times, percentages, course progress or event statuses may be added for screenshot similarity.
6. Honor `prefers-reduced-motion`. Every clickable control needs a visible keyboard focus indicator.
7. Do not reintroduce component-specific colors/shadows for these four roles; extend tokens or add a semantic state only when necessary.

## Release acceptance

- Build, typecheck, lint and all existing Playwright tests pass.
- A desktop and mobile browser screenshot from each actual page is attached to the CI run, not AI-generated.
- Verify selected search item contrast, mobile palette clipping, Guide scrolling and skip-to-practice, Radar event type distinctions and status accuracy.
- Compare real screenshots to approved references **manually**; CSS tests only protect invariants and do not establish pixel-perfect parity.
