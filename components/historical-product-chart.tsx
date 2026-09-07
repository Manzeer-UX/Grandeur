'use client';
import {LineChart} from '@mui/x-charts/LineChart';

const labels=['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
const actual=[19800,20900,26400,24100,21200,27800,null,null,null,null,null,null];
const forecast=[null,null,null,null,null,27800,23500,20100,22800,19500,20200,24600];
const formatNumber=(value:number)=>Math.round(value||0).toLocaleString('en-US');

export default function HistoricalProductChart(){
  return <div className="historical-chart-panel">
    <div className="forecast-summary-cards">
      <div><span>Next month forecast</span><strong>24,600 Cases</strong></div>
      <div><span>Peak driver</span><strong>Holy Week</strong></div>
      <div><span>Forecast confidence</span><strong>87%</strong></div>
    </div>
    <div className="forecast-chart-legend"><span className="actual"><i/>Actual demand</span><span className="forecast"><i/>AI forecast</span><span className="festival"><i/>Festival window</span></div>
    <div className="forecast-chart-wrap">
      <div className="festival-window first" aria-hidden="true"/><div className="festival-window second" aria-hidden="true"/>
      <LineChart
        height={300}
        xAxis={[{scaleType:'point',data:labels}]}
        yAxis={[{width:52,min:19000,max:28000}]}
        series={[{data:actual,label:'Actual demand',color:'#3978d5',curve:'natural',showMark:true},{data:forecast,label:'AI forecast',color:'#7562d5',curve:'natural',showMark:true}]}
        margin={{left:8,right:18,top:18,bottom:32}}
        grid={{horizontal:true}}
        hideLegend
      />
    </div>
    <div className="forecast-chart-note">Reference forecast and Holy Week uplift are shown from the supplied planning graphic.</div>
    <div className="historical-chart-summary"><span>Next month forecast <strong>{formatNumber(24600)} units</strong></span><span>Forecast confidence <strong>87%</strong></span></div>
  </div>;
}


