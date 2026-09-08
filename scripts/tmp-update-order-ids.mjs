import {readFileSync,writeFileSync} from 'node:fs';
const path='lib/workspace-seed.json';
const json=readFileSync(path,'utf8');
const matches=[...json.matchAll(/"full-order-[0-9]+-[0-9]+"/g)].map(m=>m[0].slice(1,-1));
const oldIds=[...new Set(matches)];
if(oldIds.length===0){console.log('No full-order IDs found.');process.exit(0);}
const used=new Set();
const map=new Map();
for(const old of oldIds){
  let id;
  do{id=String(Math.floor(100000+Math.random()*900000));}while(used.has(id));
  used.add(id);
  map.set(old,id);
}
let updated=json;
for(const [old,id] of map)updated=updated.split(old).join(id);
writeFileSync(path,updated);
console.log(`Replaced ${oldIds.length} order IDs with random numbers.`);
