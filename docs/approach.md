# Approach

## Build order

The build followed the sequence in the brief almost exactly, because each step
is a dependency for the next one:

1. **Scaffold** — an Express server (`server/`) and a Next.js app (`web/`) as
   two independent projects, wired together only over HTTP. Keeping them
   separate mirrors the real system: the portal is a client of the
   federation API, not a piece of the same codebase.
2. **Mock data routes** — the 4 source systems, built first and in isolation,
   each returning hardcoded arrays that match the brief's schemas exactly.
   Building these before the federation logic meant the federation layer had
   real (if fake) data to normalize against from the start, instead of
   guessing at shapes.
3. **Federation endpoint** — normalization, then dedup, then the
   `data_freshness` tag, built as three separate, testable steps in that
   order (`server/src/lib/normalize.js`, `server/src/lib/dedup.js`,
   `server/src/routes/orders.js`). Normalization has to happen before dedup
   because dedup needs every candidate row already in the same shape to
   compare and pick a winner.
4. **Dashboard** — built against the now-working `/api/orders` endpoint, so
   the front end was never developed against a moving target.
5. **Loading/async states** — added once the happy path worked, so it was
   clear what "normal" looked like before handling "not loaded yet."
6. **Docs** — written last, once the actual design (region map, dedup
   priority, freshness labels) existed to describe accurately rather than
   speculatively.

## The one UX improvement

See the comment in `web/app/page.js` above the `fetchOrders` effect. The
frustration identified: an operator changing a filter shouldn't see the
entire table and KPI bar vanish into a skeleton on every keystroke — only the
very first load (when there's nothing on screen yet) gets the full skeleton
treatment. Subsequent filter changes keep the previous rows visible (dimmed)
until the new result set arrives, instead of flashing to blank.

## Stated assumptions

- Node/Express instead of Java/Spring Boot for the back end (per the brief's
  own note in section 2).
- Fabric and GCP's mock payloads carry an internal `order_id` correlation
  field so the mock dedup logic has something to join Cognos/Fabric/GCP rows
  on. It's stripped before the public mock routes respond, so those routes
  still match the brief's exact schemas. See `docs/architecture.md`.
- Cognos has no DC field and Fabric has no territory field, so a
  `DC_TERRITORY_MAP` (one DC per territory) fills in territory for
  Fabric-sourced rows. Cognos rows get territory from the region-code map
  instead, and have no DC data at all — a real gap that only closes once
  Cognos is fully migrated off.
