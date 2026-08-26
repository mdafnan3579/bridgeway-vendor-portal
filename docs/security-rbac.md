# Security & RBAC

Not implemented in this build (no auth exists yet) — this documents the 3
roles and, specifically, *where* each restriction would be enforced.

## Roles

### 1. Internal analyst
- **Access**: all territories, all DCs, all stores. Full unified feed.
- **Enforced**: nowhere — no filter applied. This is the only role that sees
  `GET /api/orders` unmodified.

### 2. DC ops (own DC only)
- **Access**: only orders where `dc_id` matches the DCs the logged-in user
  is assigned to operate.
- **Enforced in the Express federation layer**, not the front end: after
  dedup, before the response is sent, filter `unified` by the caller's
  `dcIds` (from their auth session/token) — the same place the existing
  `dc_id` query-param filter already lives in
  `server/src/routes/orders.js`. The difference is that a DC ops user's
  restriction is **not optional** and not client-supplied: it comes from
  the authenticated session, so a DC ops user can never widen it by editing
  a query string. Cognos-sourced rows have no `dc_id` (see
  `docs/architecture.md`) — until that gap closes, a DC ops user simply
  never sees Cognos-only orders, which is the conservative (fail-closed)
  choice.

### 3. Vendor (own store only)
- **Access**: only orders where `store_id` matches the store(s) the logged-in
  vendor user owns.
- **Enforced in the same place**, same mechanism: filter by the session's
  `storeId` (or `storeIds`, if a vendor operates more than one location)
  server-side in the federation route, after dedup. A vendor should never be
  able to request another store's data by changing a URL parameter, so this
  filter must be derived from the authenticated identity, not from any
  client-supplied filter value — the existing `territory`/`dc_id`/date
  query params stay client-controlled convenience filters *on top of*, not
  instead of, the identity-derived restriction.

## Why enforcement lives in the federation layer, not the front end

The front end is a convenience/UX layer, not a trust boundary — anyone can
call the API directly, bypassing the React app entirely. The federation
route is the only place that has (a) already deduped the data into its
final shape and (b) sits behind whatever auth middleware validates the
caller's identity, so it's the single choke point where "who is asking"
and "what they're allowed to see" can be joined once, correctly, rather
than re-implemented per UI screen.

## Write access (`PATCH`/`POST`/`DELETE /api/orders`)

Same enforcement point as reads, with a narrower rule: a vendor should
never be able to edit another store's order (or any order's status at all,
arguably — that's an operational correction, not a vendor action), and DC
ops should only edit orders within their own `dc_id`s. In practice this
means the same identity-derived filter used for reads doubles as an
authorization check before a `PATCH`/`POST` is allowed to proceed — if the
target record wouldn't appear in that user's filtered `GET /api/orders`
response, the mutation is rejected, not just hidden.

## Not yet built

- No auth/session layer exists in this build — routes are open, including
  the write endpoints above. Adding one (e.g., a JWT with `role`,
  `storeIds`, `dcIds` claims, validated by middleware in front of
  `server/src/routes/orders.js`) is the prerequisite for any of the above
  to actually take effect.
