'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Info} from 'lucide-react';
import {CoverageTable} from './demo-analytics';
import {inventory} from '../lib/engine.mjs';

const colors=['#3b82f6','#8b5cf6','#10b981','#f59e0b'];
const compactTotal=(value:number)=>value>=1000?`${(value/1000).toFixed(value>=100000?0:1).replace(/\.0$/,'')}k`:value.toLocaleString();

function Donut({items,unit}:any){
 const total=items.reduce((n:number,i:any)=>n+i.value,0);
 let offset=0;
 return <div className="donut-layout">
  <div className="donut-wrap">
   <svg viewBox="0 0 120 120" role="img" aria-label={items.map((i:any)=>`${i.name}: ${i.value}`).join(', ')}>
    <circle cx="60" cy="60" r="43" fill="none" stroke="#eef2f7" strokeWidth="15"/>
   {total>0&&items.map((i:any,index:number)=>{const length=i.value/total*270.18;const node=<circle key={i.name} cx="60" cy="60" r="43" fill="none" stroke={colors[index%4]} strokeWidth="15" strokeDasharray={`${length} ${270.18-length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"/>;offset+=length;return node})}
   </svg>
   <div className="donut-center"><strong title={total.toLocaleString()}>{total?compactTotal(total):'—'}</strong><small>{total?(unit?'TOTAL CASES':'TOTAL VALUE'):'NO DATA'}</small></div>
  </div>
  <div className="donut-legend"><div className="donut-total"><span>Total recorded</span><strong>{total?total.toLocaleString():'—'}{unit&&<> <small>{unit}</small></>}</strong></div>{items.map((i:any,index:number)=><div key={i.name}><i style={{background:colors[index%4]}}/><span>{i.name}</span><strong>{i.value.toLocaleString()}{unit&&<> <small>{unit}</small></>}</strong></div>)}</div>
  <p className="chart-caption"><Info size={11}/>Use the split to see where demand or stock is concentrated.</p>
 </div>;
}

export default function InsightCharts({s,initialTab='Coverage & demand'}:any){
 const [tab,setTab]=useState(initialTab);
 const [currency,setCurrency]=useState('PHP');
 const regions=Array.from(new Set([...s.warehouses,...s.distributors].map((r:any)=>r.region))) as string[];
 const regionalSales=regions.map(name=>({name,value:s.distributors.filter((d:any)=>d.region===name).reduce((n:number,d:any)=>n+Number(d.sold||0),0)}));
 const regionalStock=regions.map(name=>({name,value:s.distributors.filter((d:any)=>d.region===name).reduce((n:number,d:any)=>n+Number(d.stock||0),0)+s.warehouses.filter((w:any)=>w.region===name).reduce((n:number,w:any)=>n+inventory(s,null,w.id).onHand,0)}));
 const moving=s.products.map((p:any)=>({id:p.id,name:p.name,value:s.movements.filter((m:any)=>m.product===p.id&&m.reason==='Order fulfillment').reduce((n:number,m:any)=>n+m.quantity,0)}));
 const movingMax=Math.max(1,...moving.map((item:any)=>item.value));

 return <section className={'panel insight-explorer '+(tab==='Regional distribution'?'regional-view':'')}>
  <div className="panel-heading"><div><h2>Performance & risk explorer</h2><p>Coverage, regional concentration, and collection risk.</p></div></div>
  <div className="tabs explorer-tabs">{['Coverage & demand','Regional distribution','Financial exposure'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='Coverage & demand'?<div className="explorer-grid">
   <article className="coverage-panel"><h3>Days of cover · SKU × region</h3><CoverageTable s={s}/></article>
  </div>:tab==='Regional distribution'?<div className="explorer-grid regional-distribution-grid">
   <article className="regional-card regional-donut-card">
    <div className="regional-card-heading"><h3>Regional share of sales</h3><p>Distribution of recent reported movement to trade</p></div>
    <Donut items={regionalSales} unit="cases"/>
   </article>
   <article className="regional-card regional-donut-card">
    <div className="regional-card-heading"><h3>Stock by region · share of business</h3><p>Combined warehouse and distributor inventory allocation</p></div>
    <Donut items={regionalStock} unit="cases"/>
   </article>
   <article className="regional-card regional-table-card">
    <div className="regional-card-heading"><h3>Sales-to-trade · regional accounts</h3><p>Active distributor breakdown by geography</p></div>
    <table><thead><tr><th>Region</th><th>Accounts</th><th>STT cases</th></tr></thead><tbody>{regions.map(name=><tr key={name}><td><Link href="/analytics">{name}</Link></td><td>{s.distributors.filter((d:any)=>d.region===name).length}</td><td><strong>{s.distributors.filter((d:any)=>d.region===name).reduce((n:number,d:any)=>n+Number(d.sold||0),0).toLocaleString()}</strong></td></tr>)}</tbody></table>
   </article>
   <article className="regional-card regional-moving-card">
    <div className="regional-card-heading"><h3>Top-moving SKUs · STD</h3><p>Highest velocity stock items across entire network</p></div>
    <div className="bars">{moving.map((item:any)=><div className="bar-row" key={item.id}><Link href="/analytics">{item.name}</Link><div className="bar-track"><div style={{width:(item.value/movingMax*100)+'%'}}/></div><strong>{item.value.toLocaleString()} <small>cases</small></strong></div>)}</div>
   </article>
  </div>:<>
   <div className="currency-select"><label>Invoice currency <select value={currency} onChange={e=>setCurrency(e.target.value)}>{Array.from(new Set(['PHP',...s.invoices.map((i:any)=>i.currency)])).map((c:any)=><option key={c}>{c}</option>)}</select></label><span>Each currency is reported separately.</span></div>
   <div className="explorer-grid financial-exposure-grid"><article><h3>Accounts receivable aging · {currency}</h3><Donut items={['Current / ≤30 days','31–60 days','61–90 days','90+ days'].map((name,i)=>({name,value:s.invoices.filter((r:any)=>{const days=Math.floor((Date.now()-new Date(r.due).getTime())/86400000);return r.currency===currency&&(i===0?days<=30:i===1?days>30&&days<=60:i===2?days>60&&days<=90:days>90)}).reduce((n:number,r:any)=>n+Math.max(0,Number(r.amount||0)-Number(r.paid||0)),0)}))}/></article></div>
  </>}
 </section>;
}
