import {DatabaseSync} from 'node:sqlite';
import {writeFileSync} from 'node:fs';
const db=new DatabaseSync('data/grandeur.sqlite');
try{
  const row=db.prepare('SELECT body FROM workspace WHERE id=1').get();
  if(!row)throw new Error('No workspace row found in local database.');
  const state=JSON.parse(row.body);
  writeFileSync('lib/workspace-seed.json',JSON.stringify(state));
  console.log(`Exported workspace seed: ${Object.keys(state).length} top-level keys.`);
}finally{db.close()}
