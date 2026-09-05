# Grandeur Bonko inventory workspace

Next.js 16.3.3, React 19, TypeScript, and a local SQLite database.

Local preview: http://127.0.0.1:3000

## Run

From this directory:

```text
pnpm install
pnpm dev
```

Production build: `pnpm build`. Start a built version: `pnpm start`.
Business-flow checks: `pnpm test`.

The server binds to 127.0.0.1. The workspace database is created at `data/grandeur.sqlite`; saved changes survive page refreshes and server restarts. Keep the SQLite database and its WAL files together when backing up a running instance.

## First operational journey

1. Add a warehouse and its capacity.
2. Complete the Mango / Blackcurrant SKU master fields or create user-supplied products.
3. Record Stock In with batch, manufacture date, expiry, and reason.
4. Open Inventory → Stock movements. Recount and approve the receipt.
5. Add a distributor with currency and exchange-rate timing.
6. Create an order manually. Oversized orders require the Production Owner preview role and a dated production decision.
7. Allocate, pick, pack, and dispatch through Fulfillment.
8. Use Finance/Admin to enter confirmed invoice totals and record payments.
9. Reconcile distributor stock and onward sales through CSV/Excel or manual intake.
10. Inspect Audit & activity for the associated changes and reasons.

Use the labeled preview-role selector to exercise approval restrictions. It is a demonstration of permissions, not authenticated identity. User records and warehouse scopes are configuration records; they are not production access-control enforcement.

## Data provenance

The source is `GRANDEUR_Feature_List 123.docx`. Only Mango and Blackcurrant are seeded as Bonko flavors. The packaging example is bottle → carton of 40; actual SKU codes, sizes, pallet counts, batch dates, warehouse addresses, distributor contacts, prices, and operational quantities were not supplied and are not fabricated.

Document examples in the AI panel are explicitly labeled. They are not live predictions. No external API is contacted by the inventory engine.

## Delivery boundaries

This is a working local application and interaction prototype, not a finished production IMS. The source document itself asks for a prototype as its first deliverable, while the user requests a complete system. The implementation covers local operational journeys, but does not claim missing services or business data exist.

See REQUIREMENTS_AUDIT.md for the full coverage matrix and remaining requirements. Live seasonal AI, vendor API adapters, secure identity and warehouse authorization, notifications, unattended report delivery, financial source integrations, and full historical analytics require additional implementation and configuration.

No logistics/carrier tracking, discount/markdown engine, US-market inventory, retailer inventory, or full accounting suite has been added.

## Screenshot-based synthetic dataset update

The user's subsequent request explicitly authorizes synthetic data. Six catalog flavors are now populated from the SKU screenshot: Blackcurrant, Strawberry, Lychee, Mango, Melon, and Coconut. All are 320mL with the supplied item/case barcodes and SRP reference values. Operational quantities, contacts, warehouse locations, and generated SKU identifiers are labeled synthetic.

There are four Luzon distributor profiles, four Mindanao profiles, and Lawson PH under Modern Trade. Named distributor companies were not supplied, so geographic demo labels are used. Region XI is represented as specified in the distribution map; its demo sales number is not claimed as screenshot data.

Linked region / distributor selectors filter reporting views and exports. Selecting one distributor excludes shared warehouse stock. Stock breakdown switches between SKU-level and distributor-level totals. The Sales performance page includes an expandable, unfiltered screenshot reference with the 34,437 vs 34,777 discrepancy and duplicate Region V label recorded explicitly. Chart source units are unspecified, while all demo balances are explicitly bottles.

The original database was backed up as `data/before-demo-<timestamp>.json`. `node scripts/seed-demo.mjs` is idempotent and preserves existing records. Filter and seed tests plus existing business-flow tests: 17 passing.

## Fully populated demo update

The user requested synthetic data wherever values were missing. Every main dataset is now populated: 63 orders across approval and fulfillment stages; 54 order-linked invoices; suppliers, purchase orders, recount receipts, returns, stock counts, barcode registrations, model inputs, overrides, schedules, team members, and audit records. Synthetic 12-month history drives the coverage, forecast, production, channel, profit, and cash-collection demonstration views.

Balances and existing records were preserved. Sample transfers and breakage use the stock engine, so quantities reconcile. Previously unset reorder thresholds for the initial two catalog products were given explicitly synthetic demonstration levels. The original database snapshot is in `data/before-full-demo-<timestamp>.json`.

Connections remain explicitly simulated; no external request, message, or live AI prediction is implied. Meaningful zero values, empty search results, permission restrictions, and excluded warehouse stock in distributor-only views remain truthful.

Repeatable population: run `node scripts/seed-demo.mjs`, `node scripts/seed-complete-demo.mjs`, then `node scripts/finish-demo.mjs`. All three preserve already-seeded edits. Full verification: 22 passing tests and a production build.
"# Grandeur" 
