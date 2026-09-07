'use client';

import {useEffect,useMemo,useState} from 'react';
import {LineChart} from '@mui/x-charts/LineChart';
import {historyFor} from '../lib/demo-metrics.mjs';
import {cleanDisplayText} from '../lib/display-text.mjs';

const COLORS=['#2f68d8','#4a9b7a','#d58a45','#8a76c2','#c45b6b','#5798a8'];

function formatCurrency(value:number|null){
  if(value==null)return '';
  const amount=Number(value||0);
  if(Math.abs(amount)>=1000000)return 'PHP '+(amount/1000000).toFixed(1)+'M';
  if(Math.abs(amount)>=1000)return 'PHP '+(amount/1000).toFixed(0)+'K';
  return 'PHP '+Math.round(amount).toLocaleString('en-US');
}

export default function SalesPerformanceChart({s}:any){
  const [view,setView]=useState('overall');
  const [selected,setSelected]=useState('all');
  const history=useMemo(()=>historyFor(s).sort((a:any,b:any)=>a.date.localeCompare(b.date)),[s]);
  const months=useMemo(()=>Array.from(new Set(history.map((row:any)=>row.date))).sort(),[history]);
  const distributors=useMemo(()=>s.distributors.map((row:any)=>({id:row.id,name:cleanDisplayText(row.name)})),[s.distributors]);
  const regions=useMemo(()=>Array.from(new Set(s.distributors.map((row:any)=>row.region))).map((name:any)=>({id:name,name:cleanDisplayText(name)})),[s.distributors]);
  const choices=view==='distributor'?distributors:view==='region'?regions:[];

  useEffect(()=>setSelected('all'),[view]);

  const groups=useMemo(()=>{
    if(view==='overall')return [{key:'overall',label:'Overall sales',rows:history}];
    const source=view==='distributor'?distributors:regions;
    const filtered=selected==='all'?source:source.filter((row:any)=>row.id===selected);
    return filtered.map((row:any)=>({
      key:String(row.id),
      label:row.name,
      rows:history.filter((item:any)=>view==='distributor'?item.distributor===row.id:item.region===row.id)
    }));
  },[distributors,history,regions,selected,view]);

  const series=groups.map((group:any,index:number)=>({
    id:group.key,
    data:months.map((month:string)=>group.rows.filter((row:any)=>row.date===month).reduce((sum:number,row:any)=>sum+Number(row.salesValue||0),0)),
    label:group.label,
    color:COLORS[index%COLORS.length],
    showMark:true,
    curve:'natural',
    valueFormatter:formatCurrency
  }));

  return <section className="panel sales-performance-graph">
    <div className="sales-graph-header">
      <div>
        <span className="eyebrow">Sales performance</span>
        <h2>Sales performance overview</h2>
        <p>Compare recorded sales value across the business, distributors, and regions.</p>
      </div>
      <div className="sales-graph-filters">
        <label><span>View by</span><select aria-label="Sales graph view" value={view} onChange={e=>setView(e.target.value)}><option value="overall">Overall sales</option><option value="distributor">Distributor</option><option value="region">Region</option></select></label>
        <label><span>{view==='distributor'?'Distributor':view==='region'?'Region':'Filter'}</span><select aria-label="Sales graph filter" value={selected} onChange={e=>setSelected(e.target.value)} disabled={view==='overall'}><option value="all">{view==='distributor'?'All distributors':view==='region'?'All regions':'All sales'}</option>{choices.map((row:any)=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
      </div>
    </div>
    <div className="sales-performance-chart">
      {months.length&&series.length?<LineChart height={350} xAxis={[{scaleType:'point',data:months.map((month:string)=>new Date(month).toLocaleDateString('en-US',{month:'short'}))}]} yAxis={[{width:76,min:0,valueFormatter:formatCurrency}]} series={series} margin={{left:4,right:20,top:20,bottom:42}} grid={{horizontal:true}} slotProps={{legend:{direction:'horizontal',position:{vertical:'bottom',horizontal:'center'}}}}/>:<div className="chart-empty"><strong>No recorded sales history</strong><span>Add distributor sales records to populate this graph.</span></div>}
    </div>
  </section>;
}
