// Screenshot catalog facts and explicitly synthetic operational balances.
export const catalog=[
 {id:'blackcurrant',name:'Blackcurrant',caseBarcode:'8850624131671',itemBarcode:'8850624131657',color:'#12b9cf',std:6009},
 {id:'strawberry',name:'Strawberry',caseBarcode:'8850624131435',itemBarcode:'8850624131411',color:'#ed6496',std:8695},
 {id:'lychee',name:'Lychee',caseBarcode:'8850004099027',itemBarcode:'8850624131466',color:'#e794bf',std:9069},
 {id:'mango',name:'Mango',caseBarcode:'8850624131558',itemBarcode:'8850004099041',color:'#e7ad22',std:3097},
 {id:'melon',name:'Melon',caseBarcode:'8850624131497',itemBarcode:'8850004099003',color:'#80b942',std:2403},
 {id:'coconut',name:'Coconut',caseBarcode:'8850624131589',itemBarcode:'8850004099058',color:'#88a6b0',std:5504}
];
export const territories=[
 ['Luzon','Region I','La Union',2200],['Luzon','Region IV A & IV B','Palawan / CALABARZON',5177],['Luzon','Region III','Central Luzon',3150],['Luzon','Region V','Bicol',1310],
 ['Mindanao','Region IX','Zamboanga',6340],['Mindanao','Region X','CDO',3340],['Mindanao','Region XI','Davao',4240],['Mindanao','Region XII','SOCCSKSARGEN',5240],['Modern Trade','Modern Trade','Lawson PH',3780]
];
export function addDemo(s,now=new Date()){
 if(s.demo?.version===1)return s;
 const date=(offset)=>new Date(now.getTime()+offset*86400000).toISOString().slice(0,10);
 const created=now.toISOString();const synthetic={synthetic:true,created};
 for(const p of catalog){const existing=s.products.find(r=>r.id===p.id||r.name.toLowerCase()===p.name.toLowerCase());const fact={size:'320mL',brand:'Bonko',flavor:p.name,description:`Bonko ${p.name} Flavor`,caseBarcode:p.caseBarcode,itemBarcode:p.itemBarcode,srpCase:1096.20,srpPiece:45.68,color:p.color,catalogSource:'User SKU screenshot'};if(existing){for(const [k,v] of Object.entries(fact))if(existing[k]===undefined||existing[k]==='')existing[k]=v;if(!existing.sku){existing.sku=`BONKO-${p.id.toUpperCase()}-320`;existing.skuSynthetic=true;}p.actualId=existing.id;}else{s.products.push({id:p.id,name:p.name,...fact,sku:`BONKO-${p.id.toUpperCase()}-320`,skuSynthetic:true,status:'Active',unit:'bottle',carton:40,pallet:50,reorder:500,category:'Fruit drinks',pack:'320mL bottle',...synthetic});p.actualId=p.id;}}
 const weights=catalog.map(p=>p.std);const weightTotal=weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<territories.length;i++){
 const [region,territory,place,sold]=territories[i];const wid=`demo-wh-${i}`,did=`demo-dist-${i}`;
 s.warehouses.push({id:wid,name:`${territory} warehouse · Demo`,location:`${place} · Synthetic location`,region,territory,capacity:100000,access:'Warehouse Manager',status:'Active',...synthetic});
 const d={id:did,name:i===8?'Lawson PH':`${territory} distributor · Demo`,region,territory,contact:i===8?'Lawson demo contact':`${territory} demo contact`,method:['API','File upload','Manual'][i%3],currency:'PHP',exchangeTiming:'Order receipt',paymentTerms:'30 days · Demo',status:'Active',stock:0,sold,positions:[],lastSync:created,...synthetic};
 let assigned=0;
 for(let j=0;j<catalog.length;j++){
 const p=catalog[j];const product=p.actualId;const soldQty=j===catalog.length-1?sold-assigned:Math.floor(sold*weights[j]/weightTotal);assigned+=soldQty;
 const held=(j===0&&i%3===0)?80:Math.round((350+(i*83+j*157)%1000)/10)*10;
 const warehouseQty=(j===0&&i===0)?120:900+(i*173+j*281)%2600;
 const dispatched=soldQty+held;
 d.positions.push({product,stock:held,sold:soldQty});d.stock+=held;
 const batchId=`demo-batch-${i}-${j}`,batch=`BNK-${p.id.slice(0,3).toUpperCase()}-${String(i+1).padStart(2,'0')}`;
 s.batches.push({id:batchId,batch,product,warehouse:wid,manufactured:date(-90),expiry:date(j===3&&i===0?4:j===5&&i===7?-3:60+i*11+j*8),quantity:warehouseQty,barcode:`DEMO-${i}-${j}`, ...synthetic});
 s.movements.push({id:`demo-receipt-${i}-${j}`,type:'Stock In',product,warehouse:wid,quantity:warehouseQty+dispatched,batch,manufactured:date(-90),expiry:date(180),reason:'Synthetic opening balance',status:'Received',...synthetic});
 s.movements.push({id:`demo-dispatch-${i}-${j}`,type:'Stock Out',product,warehouse:wid,distributor:did,quantity:dispatched,reason:'Order fulfillment',status:'Dispatched',...synthetic});
 }
 s.distributors.push(d);
 s.imports.push({id:`demo-import-${i}`,distributor:did,rows:d.positions.map(r=>({...r})),periodStart:date(-30),periodEnd:date(-1),status:'Reconciled',reason:'Synthetic 30-day stock and sales snapshot',...synthetic});
 }
 s.demo={version:1,seeded:created,notes:'SKU facts from screenshots; balances, SKU IDs, contacts, locations and transactions are synthetic. Chart units were unspecified; demo quantities use bottles. Region XI sales are synthetic, not a correction to the source.',reference:{sttHeading:34777,sttBars:[['Region IX',6340],['Region X (CDO)',3340],['Region XII (SOCCSKSARGEN)',5240],['Region IV B Palawan',5177],['Region V (Bicol)',1310],['Lawson PH',3780],['Region I (La Union)',2200],['Region III',3150],['Region V · duplicate source label',3900]],std:catalog.map(p=>({name:p.name,value:p.std})),units:'Unspecified in screenshot'}};
 s.audit.unshift({id:'demo-seed-v1',time:created,user:'Local setup',action:'Synthetic dataset added',table:'workspace',record:'demo-v1',previous:'Existing records preserved',value:'Six SKU catalog facts; nine demo warehouses and distributor positions',reason:'User requested synthetic data based on screenshots'});s.version++;return s;
}
