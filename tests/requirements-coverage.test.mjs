import test from 'node:test';
import assert from 'node:assert/strict';
import {apply,initialState} from '../lib/engine.mjs';

test('prototype includes configurable workflows, alerts, locations, currencies, and reasons',()=>{
 const state=initialState();
 assert.ok(state.workflows.length>=3);
 assert.ok(state.alerts.some(alert=>alert.type==='Near expiry'));
 assert.ok(state.countries.every(location=>location.timeZone));
 assert.ok(state.currencies.every(currency=>currency.usageRule));
 assert.ok(state.reasons.some(reason=>reason.name==='Damaged'));
});

test('stock and order distributor integrations are independently configurable',()=>{
 const state=initialState();
 state.distributors.push({id:'d1',name:'Demo distributor',region:'Luzon',contact:'Demo',currency:'PHP',exchangeTiming:'Order receipt'});
 for(const dataFlow of ['Stock updates','Orders'])apply(state,{action:'create',table:'connections',role:'Inventory Manager',data:{name:`${dataFlow} connection`,distributor:'d1',dataFlow,method:'API',endpoint:'https://example.invalid/api',frequency:'Real-time API'}});
 assert.deepEqual(state.connections.map(connection=>connection.dataFlow).sort(),['Orders','Stock updates']);
});
