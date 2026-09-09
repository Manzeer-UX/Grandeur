'use client';

type ChartItem={label:string;value:number;lines?:string[]};

const regional:ChartItem[]=[
  {label:'Region IX',value:6340},
  {label:'Region X (CDO)',value:3340,lines:['Region X','(CDO)']},
  {label:'Region XII (SOCCSKSARGEN)',value:5240,lines:['Region XII','(SOCCS)']},
  {label:'Region IVB (Palawan)',value:5177,lines:['Region','IVB (Pala...)']},
  {label:'Region V (Bicol)',value:1310,lines:['Region V','(Bicol)']},
  {label:'Lawson PH',value:3780,lines:['Lawson','PH']},
  {label:'Region I (La Union)',value:2200,lines:['Region I','(La Union)']},
  {label:'Region III',value:3150},
  {label:'Region IV',value:3900},
];

const categories:ChartItem[]=[
  {label:'Lychee',value:9069},
  {label:'Strawberry',value:8695},
  {label:'Blackcurrant',value:6009,lines:['Blackcurr','ant']},
  {label:'Coconut',value:5504},
  {label:'Mango',value:3097},
  {label:'Melon',value:2403},
];

const formatNumber=(value:number)=>value.toLocaleString('en-US');

function SalesBarChart({title,items,max,ticks,xLabel}:{title:string;items:ChartItem[];max:number;ticks:number[];xLabel:string}){
  const chart={width:620,height:502,left:58,right:16,top:52,bottom:90};
  const plotWidth=chart.width-chart.left-chart.right;
  const plotHeight=chart.height-chart.top-chart.bottom;
  const step=plotWidth/items.length;
  const barWidth=36;
  const baseline=chart.top+plotHeight;
  const gradientId=`sales-trade-${items.length}-gradient`;
  return <figure className="sales-trade-chart">
    <figcaption>{title}</figcaption>
    <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={title}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#122033"/>
          <stop offset="100%" stopColor="#366099"/>
        </linearGradient>
      </defs>
      {ticks.map(tick=>{const y=baseline-(tick/max)*plotHeight;return <text key={tick} className="sales-trade-tick" x={chart.left-10} y={y+4} textAnchor="end">{formatNumber(tick)}</text>})}
      <line className="sales-trade-axis" x1={chart.left} x2={chart.width-chart.right} y1={baseline} y2={baseline}/>
      <text className="sales-trade-y-label" x="16" y={chart.top+plotHeight/2} textAnchor="middle" transform={`rotate(-90 16 ${chart.top+plotHeight/2})`}>Sales-to-Trade</text>
      {items.map((item,index)=>{
        const x=chart.left+index*step+(step-barWidth)/2;
        const barHeight=(item.value/max)*plotHeight;
        const y=baseline-barHeight;
        const lines=item.lines||[item.label];
        const radius=Math.min(barWidth/2,barHeight);
        const barPath=`M ${x} ${baseline} V ${y+radius} A ${radius} ${radius} 0 0 1 ${x+radius} ${y} H ${x+barWidth-radius} A ${radius} ${radius} 0 0 1 ${x+barWidth} ${y+radius} V ${baseline} Z`;
        return <g key={item.label}>
          <path className="sales-trade-bar" d={barPath} stroke="#e2e8f0" strokeWidth="1" style={{fill:`url(#${gradientId})`,filter:'drop-shadow(0 8px 24px rgba(31,61,95,.05))'}}/>
          <text className="sales-trade-value" x={x+barWidth/2} y={y-10} textAnchor="middle">{formatNumber(item.value)}</text>
          <text className="sales-trade-category" x={x+barWidth/2} y={baseline+20} textAnchor="middle">{lines.map((line,lineIndex)=><tspan key={line} x={x+barWidth/2} dy={lineIndex===0?0:15}>{line}</tspan>)}</text>
        </g>;
      })}
      <text className="sales-trade-x-label" x={chart.left+plotWidth/2} y={chart.height-26} textAnchor="middle">{xLabel}</text>
      <text className="sales-trade-total" x={chart.left+plotWidth/2} y={chart.height-5} textAnchor="middle">Total STT: 34,777</text>
    </svg>
  </figure>;
}

export default function HistoricalProductChart(){
  return <div className="historical-chart-panel sales-trade-comparison">
    <SalesBarChart title="Bonko Sales-to-Trade - Regional / Account Breakdown" items={regional} max={6340} ticks={[0,2000,4000,6000]} xLabel="Region / Account"/>
    <SalesBarChart title="Bonko STD (Sales-to-Trade) - By Category" items={categories} max={9069} ticks={[0,3000,6000,9000]} xLabel="Category"/>
  </div>;
}
