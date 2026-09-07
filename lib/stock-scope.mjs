// A pure reporting projection. Never mutate or persist the filtered view.
export function matchesArea(record,area){return !area||record.region===area||record.territory===area}
export function scopeStock(s,area='',distributor=''){
 if(!s||(!area&&!distributor))return s;
 const ds=s.distributors.filter(d=>matchesArea(d,area)&&(!distributor||d.id===distributor));const ids=new Set(ds.map(d=>d.id));
 const ws=distributor?[]:s.warehouses.filter(w=>matchesArea(w,area));const wids=new Set(ws.map(w=>w.id));
 const orders=s.orders.filter(o=>ids.has(o.distributor));const orderIds=new Set(orders.map(o=>o.id));
 return {...s,warehouses:ws,distributors:ds,batches:s.batches.filter(b=>wids.has(b.warehouse)),orders,
 movements:s.movements.filter(m=>distributor?ids.has(m.distributor)||orderIds.has(m.order):wids.has(m.warehouse)||wids.has(m.destination)),
 invoices:s.invoices.filter(i=>ids.has(i.distributor)),imports:s.imports.filter(i=>ids.has(i.distributor)),returns:s.returns.filter(r=>ids.has(r.distributor)),counts:s.counts.filter(c=>wids.has(c.warehouse)),barcodes:s.barcodes.filter(b=>wids.has(b.warehouse)),events:s.events.filter(e=>matchesArea(e,area))};
}
const skuParts={mango:'MNG',blackcurrant:'BLC',strawberry:'STR',lychee:'LYC',melon:'MLN',coconut:'CCN'};
export function skuCode(p,index=0){const source=String(p?.flavor||p?.name||p?.id||'SKU').toLowerCase().replace(/[^a-z]/g,'');const part=skuParts[p?.id]||skuParts[source]||(source.slice(0,3)||'SKU').toUpperCase().padEnd(3,'X');const size='300';return `BNK-DRK-${part}-${size}-${String(index+1).padStart(2,'0')}`}
export function stockByProduct(s){return s.products.map((p,index)=>{const positions=s.distributors.flatMap(d=>(d.positions||[]).filter(r=>r.product===p.id));const warehouse=s.batches.filter(b=>b.product===p.id).reduce((n,b)=>n+Number(b.quantity),0);const held=positions.reduce((n,r)=>n+Number(r.stock),0);return {id:p.id,name:p.name,sku:skuCode(p,index),size:p.size||'—',warehouse,distributor:held,total:warehouse+held,sold:positions.reduce((n,r)=>n+Number(r.sold),0),color:p.color||'#527ec4'};})}


