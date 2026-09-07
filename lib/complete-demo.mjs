import {inventory,roles} from './engine.mjs';
export function completeDemo(s,now=new Date()){
 if(s.demo?.completeVersion===1)return s;
 const date=n=>new Date(now.getTime()+n*86400000).toISOString().slice(0,10);const created=now.toISOString();
 const base={synthetic:true,created,notes:'Synthetic demonstration record; not a live transaction.'};
 const add=(table,r)=>{if(!s[table])s[table]=[];if(!s[table].some(x=>x.id===r.id))s[table].push({...base,...r});};
 const fill=(r,defaults)=>{for(const [k,v] of Object.entries(defaults))if(r[k]===undefined||r[k]===null||r[k]==='')r[k]=v};
 s.products.forEach((p,j)=>fill(p,{sku:`BONKO-${p.id.toUpperCase()}-320`,size:'320mL',pack:'Single case',category:'Fruit drinks',subcategory:'Ready-to-drink',brand:'Bonko',unit:'case',carton:40,pallet:50,demoUnitCost:22+j,demoSellingPrice:36+j,reorder:500,status:'Active'}));
 for(let j=0;j<3;j++)add('suppliers',{id:`full-supplier-${j}`,name:['Bonko production partner','Regional packaging partner','Warehouse replenishment partner'][j]+' · Demo',contact:`Supply coordinator ${j+1} · Demo`,email:`supplier${j+1}@grandeur.example`,leadTime:5+j*2,onTime:94+j,status:'Active'});
 s.distributors.forEach((d,i)=>{
 fill(d,{email:`distributor${i+1}@grandeur.example`,phone:`Demo contact ${String(i+1).padStart(3,'0')}`,paymentTerms:'30 days · Demo',currency:'PHP',exchangeTiming:'Order receipt'});
 const w=s.warehouses.find(w=>w.region===d.region&&w.territory===d.territory)||s.warehouses[0];if(!w)return;
 const p=s.products[i%s.products.length];const eligible=s.batches.find(b=>b.warehouse===w.id&&b.expiry>=date(0)&&b.quantity>600)||s.batches.find(b=>b.warehouse===w.id);if(!eligible)return;
 const orderIds=new Set((s.orders||[]).map(o=>o.id));
 const makeOrderId=()=>{let id;do{id=String(Math.floor(100000+Math.random()*900000));}while(orderIds.has(id));orderIds.add(id);return id;};
 const stages=['Pending','Approved','Allocated','Picked','Packed','Fulfilled','Invoiced'];
 stages.forEach((status,k)=>{
 const product=s.products.find(p=>p.id===eligible.product);const quantity=status==='Pending'?inventory(s,product.id).available*2+100:40;
 const id=makeOrderId();add('orders',{id,distributor:d.id,product:product.id,warehouse:w.id,quantity,channel:['Phone','Email','Distributor system'][k%3],contact:d.contact,loggedBy:'Inventory Manager',delivery:date(7+k),productionDate:date(3),status,approvalReason:status==='Pending'?'Synthetic threshold exception for production review.':'Synthetic confirmed order.',notes:'Demo order for approval / fulfillment walkthrough.'});
 if(k>0){const amount=quantity*Number(product.demoSellingPrice);const paid=k%3===0?amount:k%3===1?0:amount/2;add('invoices',{id:`full-invoice-${i}-${k}`,order:id,distributor:d.id,amount,paid,currency:'PHP',exchangeRate:1,due:date(k%3===1?-(15+i*12):14),status:paid===amount?'Paid':paid>0?'Partial':'Overdue',reason:'Synthetic invoice and payment example'});}
 });
 add('purchases',{id:`full-po-${i}`,supplier:`full-supplier-${i%3}`,product:p.id,quantity:400,delivery:date(5+i),status:'Open'});
 add('movements',{id:`full-receiving-${i}`,type:'Stock In',product:p.id,warehouse:w.id,quantity:400,batch:`DEMO-IN-${i+1}`,manufactured:date(-15),expiry:date(180),purchase:`full-po-${i}`,reason:'Receiving',status:'Awaiting recount'});
 const expected=inventory(s,eligible.product,w.id).onHand;add('counts',{id:`full-count-${i}`,product:eligible.product,warehouse:w.id,scheduled:date(i%2?2:0),mode:i%2?'Scheduled':'Ad hoc',expected,actual:expected-5,variance:-5,reason:'Synthetic count discrepancy for supervisor reconciliation',status:'Awaiting approval'});
 for(let k=0;k<3;k++)add('returns',{id:`full-return-${i}-${k}`,distributor:d.id,product:eligible.product,batch:eligible.batch,quantity:8+k*4,reason:k%2?'Expired':'Damage',damageStage:k%2?'After distributor receipt':'Before dispatch',liability:k%2?'Distributor':'Company',status:['Pending review','Approved','Rejected'][k]});
 add('connections',{id:`full-connection-${i}`,name:`${d.name} stock adapter · Demo`,distributor:d.id,endpoint:`https://distributor-${i+1}.example/stock`,frequency:i%2?'Weekly batch':'Real-time API',status:'Simulated · not live',lastSync:created,notes:'Sample connection configuration. No network requests are made.'});
 const types=['Weather / climate','Local festival','Confirmed production','Promotion / sampling','New untracked factor','Expiry-driven dispatch'];
 types.forEach((type,k)=>add('events',{id:`full-factor-${i}-${k}`,name:`${type} · ${d.territory||d.region} · Demo`,product:s.products[k%s.products.length].id,region:d.region,territory:d.territory,distributor:d.id,type,date:date(k+1),quantity:300+k*40,notes:'Synthetic planning input. Illustrative demand effect +8%; not verified weather or festival information.'}));
 add('overrides',{id:`full-override-${i}`,recommendation:`Review ${p.name} production for ${d.territory||d.region}`,decision:['Increase','Hold','Reduce'][i%3],reason:'Synthetic manager decision: align replenishment with the next delivery window.',distributor:d.id,region:d.region});
 });
 s.batches.forEach((b,i)=>{if(!b.barcode)b.barcode=`SAMPLE-BATCH-${i}`;if(!s.barcodes.some(r=>r.code===b.barcode))add('barcodes',{id:`full-barcode-${i}`,product:b.product,warehouse:b.warehouse,batch:b.id,code:b.barcode,status:'Active'});});
 roles.forEach((role,i)=>add('users',{id:`full-user-${i}`,name:['Alex Santos','Jamie Reyes','Morgan Cruz','Taylor Lim','Casey Ramos','Jordan Tan','Avery Garcia'][i]+' · Demo',email:`team${i+1}@grandeur.example`,role,warehouse:s.warehouses[i%s.warehouses.length]?.id,status:'Active'}));
 ['Inventory','Orders','Distributor stock','Sales to trade','Accounts receivable','Audit history'].forEach((dataset,i)=>add('reports',{id:`full-report-${i}`,name:`${dataset} summary · Demo`,dataset,frequency:['Daily','Weekly','Monthly'][i%3],format:'Excel',nextRun:date(i+1),status:'Scheduled locally'}));
 s.demoHistory=s.demoHistory||[];
 for(const [i,d] of s.distributors.entries())for(const [j,p] of s.products.entries())for(let month=0;month<12;month++){
 const dt=new Date(now.getFullYear(),now.getMonth()-11+month,1,12);const qty=Math.round((180+i*31+j*47)*(0.72+month*.04)*(1+Math.sin(month*.8+j)*.1));
 add('demoHistory',{id:`full-history-${i}-${j}-${month}`,date:dt.toISOString().slice(0,10),distributor:d.id,region:d.region,territory:d.territory,product:p.id,sold:qty,manufactured:Math.round(qty*(1.12+(j%3)*.06)),forecast:Math.round(qty*1.08),salesValue:qty*p.demoSellingPrice,cost:qty*p.demoUnitCost,payments:Math.round(qty*p.demoSellingPrice*.82),channel:['Wholesale','Retail','Online'][(i+j)%3]});
 }
 for(const table of ['orders','purchases','returns','counts','connections','reports','users'])for(const r of s[table].filter(r=>r.id.startsWith('full-')))add('audit',{id:`audit-${r.id}`,time:created,user:'Demo workspace setup',action:'Synthetic record added',table,record:r.id,previous:'No sample record',value:JSON.stringify(r),reason:'User requested populated demonstration data across all modules.'});
 s.demo={...s.demo,completeVersion:1,completedAt:created};s.version++;return s;
}
