import {read} from '../../../lib/store.mjs';
import {inventory} from '../../../lib/engine.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function resolveProduct(state: any, raw: string) {
  const q = normalize(raw);
  return state.products.find((p: any) =>
    p.id.toLowerCase() === q ||
    normalize(p.name) === q ||
    normalize(p.flavor) === q ||
    (p.sku && p.sku.toLowerCase() === raw.toLowerCase())
  );
}

function resolveWarehouse(state: any, raw: string) {
  const q = normalize(raw);
  if (/^region\s*[i1]$/.test(q) || q === 'region 1' || q === 'region i') {
    return state.warehouses.find((w: any) => normalize(w.region).includes('region a') || normalize(w.name).includes('region i'));
  }
  if (/^region\s*2$/.test(q) || q === 'region ii') {
    return state.warehouses.find((w: any) => normalize(w.region).includes('region b') || normalize(w.name).includes('region ii') || normalize(w.location).includes('region 2'));
  }
  return state.warehouses.find((w: any) =>
    normalize(w.name) === q ||
    normalize(w.region) === q ||
    normalize(w.location) === q ||
    w.id.toLowerCase() === q
  );
}

function productInventoryByWarehouse(state: any, productId: string, warehouseId?: string) {
  const totals = inventory(state, productId, warehouseId);
  const product = state.products.find((p: any) => p.id === productId);
  const warehouse = warehouseId ? state.warehouses.find((w: any) => w.id === warehouseId) : null;
  const lines: string[] = [];
  if (warehouse) {
    lines.push(`${product?.name || productId} at ${warehouse.name} (${warehouse.region})`);
  } else {
    lines.push(`${product?.name || productId} across all warehouses`);
  }
  lines.push(`- On hand: ${totals.onHand.toLocaleString()} cases`);
  lines.push(`- Committed: ${totals.committed.toLocaleString()} cases`);
  lines.push(`- Expired: ${totals.expired.toLocaleString()} cases`);
  lines.push(`- Available: ${totals.available.toLocaleString()} cases`);
  return lines.join('\n');
}

function productInventoryByRegion(state: any, productId: string, regionName: string) {
  const q = normalize(regionName);
  const warehouses = state.warehouses.filter((w: any) => normalize(w.region).includes(q) || normalize(w.name).includes(q) || normalize(w.location).includes(q));
  if (!warehouses.length) {
    return `No warehouses match “${regionName}” in the workspace.`;
  }
  const product = state.products.find((p: any) => p.id === productId);
  const lines: string[] = [`${product?.name || productId} in ${regionName}`];
  let total = 0;
  for (const wh of warehouses) {
    const t = inventory(state, productId, wh.id);
    total += t.available;
    lines.push(`- ${wh.name}: ${t.available.toLocaleString()} available / ${t.onHand.toLocaleString()} on hand`);
  }
  lines.push(`Total available in ${regionName}: ${total.toLocaleString()} cases.`);
  return lines.join('\n');
}

function highestStockDistributor(state: any) {
  const list = [...state.distributors].sort((a: any, b: any) => Number(b.stock || 0) - Number(a.stock || 0));
  if (!list.length) return 'No distributors have been set up yet.';
  const top = list[0];
  const lines = [
    `${top.name} has the highest distributor stock with ${Number(top.stock || 0).toLocaleString()} cases.`,
    `Region: ${top.region}`,
    `Sold through: ${Number(top.sold || 0).toLocaleString()} cases`,
  ];
  if (top.positions?.length) {
    lines.push('Stock by product:');
    for (const pos of top.positions) {
      const p = state.products.find((pr: any) => pr.id === pos.product);
      lines.push(`- ${p?.name || pos.product}: ${Number(pos.stock || 0).toLocaleString()}`);
    }
  }
  return lines.join('\n');
}

function manufacturedLastMonth(state: any) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const start = monthStart.toISOString().slice(0, 10);
  const end = monthEnd.toISOString().slice(0, 10);
  const label = `${MONTH_NAMES[monthStart.getMonth()]} ${year}`;

  const fromBatches = state.batches.filter((b: any) => b.manufactured && b.manufactured >= start && b.manufactured < end);
  const totalBottles = fromBatches.reduce((n: number, b: any) => n + Number(b.quantity || 0), 0);
  const byProduct: Record<string, number> = {};
  for (const b of fromBatches) {
    byProduct[b.product] = (byProduct[b.product] || 0) + Number(b.quantity || 0);
  }

  const lines = [`Manufactured in ${label}: ${totalBottles.toLocaleString()} cases from ${fromBatches.length} batch${fromBatches.length === 1 ? '' : 'es'}.`];
  if (Object.keys(byProduct).length) {
    lines.push('By product:');
    for (const [pid, qty] of Object.entries(byProduct)) {
      const p = state.products.find((pr: any) => pr.id === pid);
      lines.push(`- ${p?.name || pid}: ${qty.toLocaleString()} cases`);
    }
  }
  return lines.join('\n');
}

function stockOutRisk(state: any) {
  const risks: Array<{name: string; available: number; committed: number; reorder: number}> = [];
  for (const p of state.products) {
    const t = inventory(state, p.id);
    const threshold = Number(p.reorder || 0) > 0 ? Number(p.reorder) : 500;
    if (t.available <= threshold) {
      risks.push({name: p.name, available: t.available, committed: t.committed, reorder: threshold});
    }
  }
  if (!risks.length) return 'No SKUs are currently at risk of stock-out. All products are above their reorder thresholds.';
  risks.sort((a, b) => a.available - b.available);
  const lines = ['SKUs at risk of stock-out (available at or below reorder threshold):'];
  for (const r of risks) {
    const status = r.available === 0 ? 'OUT OF STOCK' : r.available <= r.reorder * 0.25 ? 'Critical' : 'Low';
    lines.push(`- ${r.name}: ${r.available.toLocaleString()} available, ${r.committed.toLocaleString()} committed (threshold ${r.reorder.toLocaleString()}) — ${status}`);
  }
  return lines.join('\n');
}

function extractProduct(state: any, question: string) {
  const q = normalize(question);
  let best: any = null;
  let bestLen = 0;
  for (const p of state.products) {
    const candidates = [p.name, p.flavor, p.id, p.sku].filter(Boolean) as string[];
    for (const c of candidates) {
      const n = normalize(c);
      if (n.length > bestLen && q.includes(n)) {
        best = p;
        bestLen = n.length;
      }
    }
  }
  return best;
}

function extractRegion(state: any, question: string) {
  const q = normalize(question);
  const romanMap: Record<string, string> = {'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5'};
  const regionRoman = q.match(/region\s+([i-v]+|\d+)/i);
  if (regionRoman) {
    const roman = regionRoman[1].toLowerCase();
    const num = romanMap[roman] || roman;
    return `region ${num}`;
  }
  for (const w of state.warehouses) {
    for (const field of [w.region, w.name, w.location]) {
      if (!field) continue;
      const n = normalize(field);
      if (n.length > 2 && q.includes(n)) return field;
    }
  }
  return '';
}

function answer(state: any, question: string) {
  const q = normalize(question);

  if ((q.includes('inventory') || q.includes('stock')) && (q.includes('region') || q.includes('in') || q.includes('for'))) {
    const product = extractProduct(state, question);
    const regionName = extractRegion(state, question);
    if (product && regionName) {
      return productInventoryByRegion(state, product.id, regionName);
    }
    if (product) {
      const warehouse = resolveWarehouse(state, regionName);
      return productInventoryByWarehouse(state, product.id, warehouse?.id);
    }
  }

  if (q.includes('distributor') && (q.includes('highest stock') || q.includes('most stock') || q.includes('top distributor'))) {
    return highestStockDistributor(state);
  }

  if ((q.includes('manufactured') || q.includes('produced') || q.includes('made')) && q.includes('last month')) {
    return manufacturedLastMonth(state);
  }

  if ((q.includes('stock-out') || q.includes('stock out') || q.includes('stockout') || q.includes('at risk')) && (q.includes('sku') || q.includes('product') || q.includes('skus'))) {
    return stockOutRisk(state);
  }

  return "I can currently answer these workspace questions:\n- Show inventory for [Product] in [Region]\n- Which distributor has the highest stock?\n- How much inventory was manufactured last month?\n- Which SKUs are at risk of stock-out?";
}

export async function POST(request: Request) {
  try {
    const {question} = await request.json();
    if (!question || typeof question !== 'string') {
      return Response.json({error: 'Question is required.'}, {status: 400});
    }
    const state = read();
    const text = answer(state, question);
    return Response.json({question, answer: text});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unable to answer.';
    return Response.json({error: message}, {status: 500});
  }
}
