import {DatabaseSync} from 'node:sqlite';
import {writeFileSync} from 'node:fs';
import {addDemo} from '../lib/demo.mjs';
const db=new DatabaseSync('data/grandeur.sqlite');db.exec('BEGIN IMMEDIATE');
try{const s=JSON.parse(db.prepare('SELECT body FROM workspace WHERE id=1').get().body);if(s.demo?.version===1){db.exec('ROLLBACK');console.log('Synthetic data already installed; existing edits preserved.')}else{writeFileSync(`data/before-demo-${Date.now()}.json`,JSON.stringify(s,null,2));addDemo(s);db.prepare('UPDATE workspace SET body=? WHERE id=1').run(JSON.stringify(s));db.exec('COMMIT');console.log(JSON.stringify({products:s.products.length,warehouses:s.warehouses.length,distributors:s.distributors.length,batches:s.batches.length}));}}catch(e){db.exec('ROLLBACK');throw e}finally{db.close()}
