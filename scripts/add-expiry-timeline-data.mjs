import {DatabaseSync} from 'node:sqlite';

const db=new DatabaseSync('data/grandeur.sqlite');
db.exec('BEGIN IMMEDIATE');
try{
  const state=JSON.parse(db.prepare('SELECT body FROM workspace WHERE id=1').get().body);
  if(state.demo?.expiryTimelineVersion===1){db.exec('ROLLBACK');console.log('Expiry timeline records already added.');}
  else{
    const today=new Date();
    const date=(days)=>new Date(today.getTime()+days*86400000).toISOString().slice(0,10);
    const warehouseIds=state.warehouses.filter(w=>w.synthetic||w.id.startsWith('demo-')).map(w=>w.id);
    const items=[
      ['mango',0,4,120,'BNK-MAN-NEAR-01'],
      ['blackcurrant',1,7,680,'BNK-BLK-NEAR-02'],
      ['strawberry',2,10,540,'BNK-STR-NEAR-03'],
      ['lychee',3,13,760,'BNK-LYC-NEAR-04'],
      ['melon',4,16,430,'BNK-MEL-NEAR-05'],
      ['coconut',5,19,610,'BNK-COC-NEAR-06'],
      ['mango',6,23,350,'BNK-MAN-NEAR-07'],
      ['blackcurrant',7,27,290,'BNK-BLK-NEAR-08'],
      ['strawberry',8,30,470,'BNK-STR-NEAR-09']
    ];
    for(const [product,index,days,quantity,batch] of items){
      const warehouse=warehouseIds[index%Math.max(1,warehouseIds.length)];
      const id=`expiry-demo-${index}`;
      if(!state.batches.some(b=>b.id===id)){
        state.batches.push({id,batch,product,warehouse,manufactured:date(-45),expiry:date(days),quantity,barcode:`EXP-${index+1}`,synthetic:true,created:today.toISOString(),notes:'Near-expiry timeline sample'});
        state.barcodes.push({id:`expiry-barcode-${index}`,product,warehouse,batch:id,code:`EXP-${index+1}`,status:'Active',synthetic:true,created:today.toISOString()});
        state.movements.push({id:`expiry-receipt-${index}`,type:'Stock In',product,warehouse,quantity,batch,manufactured:date(-45),expiry:date(days),reason:'Near-expiry timeline sample',status:'Received',synthetic:true,created:today.toISOString()});
      }
    }
    state.audit.unshift({id:'expiry-timeline-demo-v1',time:today.toISOString(),user:'Local setup',action:'Expiry timeline expanded',table:'batches',record:'expiry-demo',previous:'One near-expiry batch',value:'Nine batches expiring within 30 days',reason:'User requested more data in the batch expiry timeline.'});
    state.demo={...state.demo,expiryTimelineVersion:1};
    state.version++;
    db.prepare('UPDATE workspace SET body=? WHERE id=1').run(JSON.stringify(state));
    db.exec('COMMIT');
    console.log('Added nine near-expiry batches across six flavors.');
  }
}catch(error){db.exec('ROLLBACK');throw error}finally{db.close()}
