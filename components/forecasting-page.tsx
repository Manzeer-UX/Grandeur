'use client';

import {useState} from 'react';
import {ChartNoAxesCombined,Globe2,Layers,Sparkles} from 'lucide-react';
import AdaptiveSeasonalityChart from './adaptive-seasonality-chart';

const formatNumber=(value:number)=>value.toLocaleString('en-US');

const skuForecast=[
  {name:'Mango',region:'Luzon',base:22385,forecast:31200,adjustment:'+18%',driver:'Hot weather, weekend mall events, festival uplift'},
  {name:'Blackcurrant',region:'Mindanao',base:14518,forecast:18800,adjustment:'+9%',driver:'Rainy-week demand, local promotions, replenishment gap'},
  {name:'Strawberry',region:'Modern Trade',base:17867,forecast:24600,adjustment:'+14%',driver:'Payday basket trend, supermarket displays, school events'},
  {name:'Lychee',region:'Luzon',base:20146,forecast:27100,adjustment:'+12%',driver:'Climate index, historical sell-through, distributor orders'},
  {name:'Melon',region:'Mindanao',base:24874,forecast:29400,adjustment:'+6%',driver:'Baseline demand with lighter event impact'},
  {name:'Coconut',region:'Modern Trade',base:22373,forecast:33800,adjustment:'+22%',driver:'Heat index, beach-area local events, market buzz'}
];

const regionalForecast=[
  {name:'Luzon',value:58300,color:'#2864d9'},
  {name:'Mindanao',value:48200,color:'#49a078'},
  {name:'Modern Trade',value:51200,color:'#b7791f'}
];

const factors=[
  ['Historical sales','Always on','SKU, distributor, region, and sell-through history shape the baseline.'],
  ['Weather','Available factor','Heat index and rainfall can raise or lower expected beverage demand.'],
  ['Climate','Available factor','Longer temperature and humidity patterns adjust seasonal expectation.'],
  ['Festivals','Available factor','Regional holidays and festivals can create temporary demand lift.'],
  ['Local events','Available factor','Mall activations, school events, and community gatherings can be added.'],
  ['Current market conditions','Available factor','Promotions, competitor activity, and channel signals can change the forecast.'],
  ['Emerging factors','Expandable','New relevant factors can be added without locking the model to only three inputs.']
];

function Panel({title,subtitle,children}:any){
  return <section className="panel"><div className="panel-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div></div>{children}</section>;
}

function StatusBadge({children,tone='neutral'}:any){
  return <span className={`badge ${tone}`}><i/>{children}</span>;
}

export default function ForecastingPage(){
  const [tab,setTab]=useState('Forecast by SKU');
  const maxSku=Math.max(...skuForecast.map(row=>row.forecast));
  const maxRegion=Math.max(...regionalForecast.map(row=>row.value));

  return <>
    <div className="tabs" role="tablist">
      {['Forecast by SKU','Regional demand','Adaptive factors'].map(name=><button key={name} role="tab" aria-selected={tab===name} className={tab===name?'active':''} onClick={()=>setTab(name)}>{name}</button>)}
    </div>

    <div className="notice ai-notice"><Sparkles size={19}/><div><strong>AI Forecasting & Demand Prediction</strong><p>Forecasts combine SKU and regional demand with adaptive seasonality. Demand signals respond to sales, weather, climate, festivals, local events, market conditions, and emerging factors.</p></div></div>

    <div className="compact-stats forecast-stats">
      <div><span>Forecast horizon</span><strong className="small-value">Next 30 days</strong></div>
      <div><span>Forecast scope</span><strong className="small-value">SKU x region</strong></div>
      <div><span>Seasonality mode</span><strong className="small-value">Adaptive factors</strong></div>
      <div><span>Data mode</span><strong className="small-value">Demand signals</strong></div>
    </div>

    {tab==='Regional demand'?<div className="charts-grid">
      <Panel title="Regional demand forecast" subtitle="Cases forecast for the next 30 days">
        <div className="forecast-bars">{regionalForecast.map(row=><div className="forecast-bar" key={row.name}><div><span>{row.name}</span><strong>{formatNumber(row.value)}</strong></div><div className="forecast-track"><i style={{width:`${row.value/maxRegion*100}%`,background:row.color}}/></div></div>)}</div>
      </Panel>
      <Panel title="Regional adjustment notes" subtitle="Seasonality responds to current demand conditions">
        <div className="factor-stack"><div><strong>Luzon</strong><p>Warm weather, festivals, distributor ordering pace, and prior sell-through lift Mango and Lychee demand.</p></div><div><strong>Mindanao</strong><p>Rainfall pattern, replenishment gaps, and local trade activity rebalance Blackcurrant and Melon forecasts.</p></div><div><strong>Modern Trade</strong><p>Retail displays, payday cycles, and beach-area events increase Coconut and Strawberry expectations.</p></div></div>
      </Panel>
    </div>:tab==='Adaptive factors'?<div className="charts-grid">
      <Panel title="Expandable factor model" subtitle="The model can incorporate new relevant factors over time">
        <div className="factor-stack">{factors.map(([name,status,text])=><div key={name}><strong>{name}</strong><StatusBadge tone={status==='Expandable'?'green':'neutral'}>{status}</StatusBadge><p>{text}</p></div>)}</div>
      </Panel>
      <Panel title="Adaptive seasonality signal" subtitle="Compare the demand factors shaping the next 30 days."><AdaptiveSeasonalityChart/></Panel>
    </div>:<>
      <Panel title="Demand forecast by SKU" subtitle="Forecast considers SKU, region, and adaptive seasonal factors">
        <div className="forecast-sku-list">{skuForecast.map(row=><div className="forecast-sku" key={row.name}><div className="forecast-sku-head"><div><strong>{row.name}</strong><span>{row.region}</span></div><StatusBadge tone="green">{row.adjustment}</StatusBadge></div><div className="forecast-track"><i style={{width:`${row.forecast/maxSku*100}%`}}/></div><div className="forecast-sku-foot"><span>Baseline {formatNumber(row.base)}</span><strong>Forecast {formatNumber(row.forecast)} cases</strong></div><p>{row.driver}</p></div>)}</div>
      </Panel>
      <Panel title="Forecast model principle" subtitle="Seasonality adapts to changing demand signals">
        <div className="forecast-principles"><div><ChartNoAxesCombined size={19}/><strong>Historical sales baseline</strong><p>Starts from sales and sell-through patterns by SKU and region.</p></div><div><Globe2 size={19}/><strong>External demand signals</strong><p>Weather, climate, festivals, local events, and market conditions adjust the baseline.</p></div><div><Layers size={19}/><strong>Expandable inputs</strong><p>New factors can be added when they become relevant to demand.</p></div></div>
      </Panel>
    </>}
  </>;
}
