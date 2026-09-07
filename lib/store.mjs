import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialState,prototypeDefaults,apply} from './engine.mjs';
const folder=process.env.DATA_DIR||(process.env.VERCEL?'/tmp':path.join(process.cwd(),'data'));
mkdirSync(folder,{recursive:true});
const db=new DatabaseSync(path.join(folder,'grandeur.sqlite'));
if(!process.env.VERCEL){db.exec('PRAGMA journal_mode=WAL;')}
db.exec('CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY, body TEXT NOT NULL)');
const seedPath=path.join(path.dirname(fileURLToPath(import.meta.url)),'workspace-seed.json');
function committedSeed(){
  try{return JSON.parse(readFileSync(seedPath,'utf8'));}
  catch{return initialState();}
}
const seedBody=JSON.stringify(committedSeed());
db.prepare('INSERT OR IGNORE INTO workspace(id,body) VALUES(1,?)').run(seedBody);
if(process.env.VERCEL){db.prepare('UPDATE workspace SET body=? WHERE id=1').run(seedBody);}
export function read(){const state=JSON.parse(db.prepare('SELECT body FROM workspace WHERE id=1').get().body);for(const [key,value] of Object.entries(prototypeDefaults))if(state[key]===undefined)state[key]=structuredClone(value);for(const connection of state.connections||[]){if(!connection.dataFlow)connection.dataFlow='Stock updates';if(!connection.method)connection.method=connection.endpoint?'API':'CSV / Excel upload';}if(!state.shipments.length&&state.orders?.length){const candidates=state.orders.filter(order=>order.warehouse&&order.distributor).slice(0,4);state.shipments=candidates.map((order,index)=>({id:`sample-shipment-${index+1}`,reference:`SHP-2026-${String(index+1).padStart(3,'0')}`,order:order.id,warehouse:order.warehouse,distributor:order.distributor,dispatchDate:'2026-09-07',deliveryDate:`2026-09-${String(9+index).padStart(2,'0')}`,status:['Created','Loading','In transit','Verified'][index]||'Created',initiatedBy:'Logistics Coordinator · Demo',verifiedBy:index===3?'Distributor Receiver · Demo':'',notes:'Static demonstration shipment. No carrier connection is active.',synthetic:true}));}return state}
export function write(input){db.exec('BEGIN IMMEDIATE');try{const state=read();if(input.version!==state.version)throw new Error('The workspace changed in another window. Refresh and try again.');const result=apply(state,input);db.prepare('UPDATE workspace SET body=? WHERE id=1').run(JSON.stringify(result.state));db.exec('COMMIT');return result.state;}catch(e){db.exec('ROLLBACK');throw e}}
