# Codex Reset Radar data sources

The public radar uses a fail-soft source chain:

1. **AIHOT** `GET https://aihot.news/api/v1/codex-resets` is the primary public snapshot.
2. **Codex Resets** is the compatibility fallback when AIHOT is unreachable or returns no usable events.
3. **Supabase persisted history** is the final read fallback when both live upstreams fail.
4. An optional direct **X API** ingestion path can supersede the public-source path when `X_BEARER_TOKEN` is configured.

## Event mapping

AIHOT is a full snapshot, not an incremental cursor. AhaFrame maps:

- `direct_reset` -> `full`
- `reset_credit` -> `banked`
- `announced` -> `detected`
- `confirmed` -> `confirmed`

For confirmed events, `confirmedAt` is treated as the confirmation-post timestamp, not the exact moment every account received the reset. `occurredOn` is only a date-level fallback when no event timestamp is available.

When `posts[].url` contains a Tibo X post, AhaFrame keeps that URL as the user-facing evidence link. Tracker URLs are not presented as if they were original evidence.

## Reliability behavior

- A live-source failure must not make the page unavailable when persisted confirmed history exists.
- Public Supabase reads are limited by RLS to `status = 'confirmed'` rows.
- Detected/rejected rows remain server-side ingestion data.
- Third-party corroboration is descriptive only; it must not be presented as independent evidence when trackers may share an upstream source.
