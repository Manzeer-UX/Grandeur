import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {initialState,apply} from './engine.mjs';
const folder=process.env.DATA_DIR||(process.env.VERCEL?'/tmp':path.join(process.cwd(),'data'));
mkdirSync(folder,{recursive:true});
const db=new DatabaseSync(path.join(folder,'grandeur.sqlite'));
if(!process.env.VERCEL){db.exec('PRAGMA journal_mode=WAL;')}
db.exec('CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY, body TEXT NOT NULL)');
db.prepare('INSERT OR IGNORE INTO workspace(id,body) VALUES(1,?)').run(JSON.stringify(initialState()));
export function read(){return JSON.parse(db.prepare('SELECT body FROM workspace WHERE id=1').get().body)}
export function write(input){db.exec('BEGIN IMMEDIATE');try{const state=read();if(input.version!==state.version)throw new Error('The workspace changed in another window. Refresh and try again.');const result=apply(state,input);db.prepare('UPDATE workspace SET body=? WHERE id=1').run(JSON.stringify(result.state));db.exec('COMMIT');return result.state;}catch(e){db.exec('ROLLBACK');throw e}}
