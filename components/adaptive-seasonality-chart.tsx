'use client';

import {useMemo,useState} from 'react';
import {LineChart} from '@mui/x-charts/LineChart';
import {CloudSun,History,Radio,TrendingDown,TrendingUp} from 'lucide-react';

const FACTORS=[
  {name:'Sales',short:'Sales',detail:'Recent sell-through is below the historical pattern, leaving room for external signals to shape demand.'},
  {name:'Weather',short:'Weather',detail:'Warmer conditions are increasing near-term beverage demand across active regions.'},
  {name:'Climate',short:'Climate',detail:'The longer-range climate pattern is reinforcing the warmer weather signal.'},
  {name:'Festivals',short:'Festivals',detail:'Upcoming regional festivals create a strong temporary lift in the selected demand scenario.'},
  {name:'Local events',short:'Events',detail:'Local event activity remains meaningful, but is softer than the festival contribution.'},
  {name:'Market',short:'Market',detail:'Promotions and channel activity are producing the highest current demand influence.'},
  {name:'Emerging',short:'New',detail:'New signals are elevated and should be monitored as more sales evidence arrives.'}
];

const SCENARIOS={
  current:{label:'Current mix',values:[28,61,76,88,66,96,81]},
  peak:{label:'Peak season',values:[36,72,82,96,79,92,86]},
  conservative:{label:'Conservative',values:[24,52,64,74,58,79,68]}
} as const;

const BASELINE=[39,46,55,64,58,67,73];

export default function AdaptiveSeasonalityChart(){
  const [scenario,setScenario]=useState<keyof typeof SCENARIOS>('current');
  const [selected,setSelected]=useState(3);
  const [showCurrent,setShowCurrent]=useState(true);
  const [showBaseline,setShowBaseline]=useState(true);
  const values:number[]=[...SCENARIOS[scenario].values];
  const delta=values[selected]-BASELINE[selected];
  const strongest=useMemo(()=>values.indexOf(Math.max(...values)),[values]);
  const series:any[]=[];

  if(showCurrent)series.push({id:'current',label:'Adaptive demand signal',data:values,color:'#2864d9',curve:'natural',showMark:true,valueFormatter:(value:number|null)=>value==null?'':`${value}% impact`});
  if(showBaseline)series.push({id:'baseline',label:'Historical baseline',data:BASELINE,color:'#459b78',curve:'natural',showMark:true,valueFormatter:(value:number|null)=>value==null?'':`${value}% impact`});

  return <div className="seasonality-chart">
    <div className="seasonality-toolbar">
      <div className="seasonality-segments" aria-label="Demand scenario">
        {Object.entries(SCENARIOS).map(([key,item])=><button key={key} type="button" className={scenario===key?'active':''} aria-pressed={scenario===key} onClick={()=>setScenario(key as keyof typeof SCENARIOS)}>{item.label}</button>)}
      </div>
      <div className="seasonality-toggles">
        <label><input type="checkbox" checked={showCurrent} onChange={e=>setShowCurrent(e.target.checked)}/><i className="current"/>Adaptive signal</label>
        <label><input type="checkbox" checked={showBaseline} onChange={e=>setShowBaseline(e.target.checked)}/><i className="baseline"/>Historical baseline</label>
      </div>
    </div>

    <div className="seasonality-plot" aria-label={`${SCENARIOS[scenario].label} adaptive seasonality chart`}>
      {series.length?<LineChart height={320} xAxis={[{scaleType:'point',data:FACTORS.map(f=>f.short)}]} yAxis={[{width:48,min:0,max:100,valueFormatter:(value:number)=>`${value}%`}]} series={series} margin={{left:0,right:20,top:22,bottom:34}} grid={{horizontal:true}} hideLegend/>:<div className="seasonality-empty">Select at least one signal to display.</div>}
    </div>

    <div className="seasonality-factors" aria-label="Inspect a demand factor">
      {FACTORS.map((factor,index)=><button key={factor.name} type="button" className={selected===index?'active':''} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{factor.name}</span><strong>{values[index]}%</strong></button>)}
    </div>

    <div className="seasonality-insight" aria-live="polite">
      <span className="seasonality-insight-icon"><CloudSun size={19}/></span>
      <div>
        <span className="seasonality-kicker">Selected factor</span>
        <strong>{FACTORS[selected].name}</strong>
        <p>{FACTORS[selected].detail}</p>
      </div>
      <div className="seasonality-score">
        <span>{values[selected]}%</span>
        <small>Current impact</small>
      </div>
      <div className={`seasonality-delta ${delta>=0?'up':'down'}`}>
        {delta>=0?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {delta>=0?'+':''}{delta} pts
        <small>vs baseline</small>
      </div>
    </div>

    <div className="seasonality-footnote">
      <span><Radio size={14}/>Strongest signal: <strong>{FACTORS[strongest].name}</strong></span>
      <span><History size={14}/>Updated from the current 30-day demand window</span>
    </div>
  </div>;
}
