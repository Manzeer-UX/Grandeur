import {apply,inventory} from './engine.mjs';
export function finishDemo(s){if(s.demo?.detailVersion===1)return s;
const products=s.products.filter(p=>p.catalogSource==='User SKU screenshot');
products.forEach((p,i)=>{if(p.reorder===0){p.reorder=Math.round(inventory(s,p.id).available/(i===0?.9:1.2));p.reorderSynthetic=true;}});
const ws=s.warehouses.filter(w=>w.synthetic);const product=products.find(p=>p.name==='Coconut');
if(ws.length>=2&&product&&inventory(s,product.id,ws[0].id).available>50){
apply(s,{action:'create',table:'movements',role:'Super Admin',data:{type:'Stock Transfer',product:product.id,warehouse:ws[0].id,destination:ws[1].id,quantity:20,reason:'Warehouse transfer',notes:'Synthetic transfer example',synthetic:true}});
apply(s,{action:'create',table:'movements',role:'Super Admin',data:{type:'Adjustment',product:product.id,warehouse:ws[0].id,quantity:10,reason:'Breakage',notes:'Synthetic breakage example',synthetic:true}});
}
s.demo={...s.demo,detailVersion:1};s.version++;return s;}
