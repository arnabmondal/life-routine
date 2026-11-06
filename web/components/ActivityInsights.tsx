'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CalendarActivity } from '../lib/calendar';
import { buildInsights } from '../lib/insights';

const colors: Record<string,string> = { Health:'#21a985',Family:'#d99356',Career:'#6789e8',Learning:'#9b7bdf',Personal:'#e47c9e' };
const shortDate = (date: Date) => date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
const fullDate = (date: Date) => date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});

type Props = { week: Date; refreshItems: CalendarActivity[]; refreshing: boolean };
export default function ActivityInsights({ week, refreshItems, refreshing }: Props) {
  const [weeks,setWeeks] = useState(4);
  const [items,setItems] = useState<CalendarActivity[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const [retry,setRetry] = useState(0);
  const [selected,setSelected] = useState<string|null>(null);
  const [inspected,setInspected] = useState<string|null>(null);
  const [width,setWidth] = useState(640);
  const plotRef = useRef<HTMLDivElement>(null);
  const chartId = useId();
  const range = useMemo(() => {
    const from = new Date(week); from.setDate(from.getDate()-(weeks-1)*7);
    const to = new Date(week); to.setDate(to.getDate()+7);
    const last = new Date(to); last.setDate(last.getDate()-1);
    return { from,to,last };
  },[week,weeks]);
  const fromISO = range.from.toISOString();
  const toISO = range.to.toISOString();

  useEffect(() => {
    setLoading(true);
    setError(false);
    if (refreshing) return;
    const controller = new AbortController();
    let current = true;
    (async () => {
      try {
        const response = await fetch(`/api/activities?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`,{signal:controller.signal});
        if (!response.ok) throw Error('Activity history unavailable');
        const data = await response.json();
        if (!Array.isArray(data.activities)) throw Error('Activity history unavailable');
        if (current) setItems(data.activities);
      } catch (failure) {
        if (current && !(failure instanceof Error && failure.name==='AbortError')) setError(true);
      } finally { if (current) setLoading(false); }
    })();
    return () => { current=false; controller.abort(); };
  },[fromISO,toISO,refreshItems,refreshing,retry]);

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(Math.max(240,Math.round(next)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  },[loading,error]);

  const all = useMemo(() => buildInsights(items,range.from,range.to,new Date()),[items,range]);
  const selectedActivity = selected ? all.leaderboard.find(activity=>activity.key===selected) : undefined;
  const selectedKey = selectedActivity?.key ?? null;
  const data = useMemo(() => buildInsights(items,range.from,range.to,new Date(),selectedKey),[items,range,selectedKey]);
  const defaultIndex = Math.max(0,data.days.findLastIndex(day=>!day.future));
  const foundIndex = inspected ? data.days.findIndex(day=>day.key===inspected) : -1;
  const index = foundIndex >= 0 ? foundIndex : defaultIndex;
  const day = data.days[index];
  const height=238, left=32, right=16, top=18, bottom=194;
  const observed = data.days.filter(day=>!day.future);
  const maximum = Math.max(4,...observed.map(day=>day.completed));
  const step = Math.max(1,Math.ceil(maximum/4));
  const ceiling = step*4;
  const x = (i:number) => left+i/(data.days.length-1)*(width-left-right);
  const y = (value:number) => bottom-value/ceiling*(bottom-top);
  const line = data.days.flatMap((point,i)=>point.future?[]:[`${i===0?'M':'L'}${x(i)},${y(point.completed)}`]).join(' ');
  const tickIndices = [...new Set(Array.from({length:width<420?4:6},(_,i)=>Math.round(i*(data.days.length-1)/(width<420?3:5))))];
  const totalLabel = `${data.total} completed ${data.total===1?'activity':'activities'}`;

  return <section className="activity-insights" aria-label="Activity trends and consistency" aria-busy={loading}>
    <div className="insights-toolbar"><div><h3>Your activity rhythm</h3><p>{shortDate(range.from)} – {shortDate(range.last)}, {range.last.getFullYear()}</p></div><label className="insights-range">Period<select aria-label="Trend period" value={weeks} onChange={event=>{setWeeks(Number(event.target.value));setInspected(null);}}><option value={4}>4 weeks</option><option value={8}>8 weeks</option></select></label></div>
    {error ? <div className="insights-error" role="alert"><h4>Your activity history couldn’t load.</h4><p>The weekly log is still available below.</p><button className="outline" onClick={()=>setRetry(value=>value+1)}>Retry history</button></div> : <div className="insights-columns">
      <figure className="trend-panel">
        <figcaption><div><h4>{selectedActivity ? selectedActivity.title : 'Completed activities'}</h4><p>{loading?'Loading your activity history…':`${totalLabel} · ${data.activeDays} active ${data.activeDays===1?'day':'days'}`}</p></div>{selectedKey&&<button className="insights-clear" onClick={()=>setSelected(null)}>Show all activities</button>}</figcaption>
        {loading ? <div className="insights-skeleton" role="status" aria-label="Loading activity trend"><span/><span/><span/></div> : <>
          <div className="trend-plot" ref={plotRef} onPointerMove={event=>{
            if (event.pointerType==='touch') return;
            const bounds=event.currentTarget.getBoundingClientRect();
            const i=Math.max(0,Math.min(data.days.length-1,Math.round((event.clientX-bounds.left-left)/(width-left-right)*(data.days.length-1))));
            setInspected(data.days[i].key);
          }} onClick={event=>{
            const bounds=event.currentTarget.getBoundingClientRect();
            const i=Math.max(0,Math.min(data.days.length-1,Math.round((event.clientX-bounds.left-left)/(width-left-right)*(data.days.length-1))));
            setInspected(data.days[i].key);
          }}>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${chartId}-title ${chartId}-description`}>
              <title id={`${chartId}-title`}>{selectedActivity?.title || 'All activities'}: {totalLabel} across {weeks} weeks</title>
              <desc id={`${chartId}-description`}>Daily completed counts grouped by scheduled local date. Upcoming dates are blank. Use the day slider or daily data table for exact values.</desc>
              {Array.from({length:5},(_,i)=>i*step).map(value=><g key={value}><line x1={left} x2={width-right} y1={y(value)} y2={y(value)} className="trend-grid"/><text x={left-10} y={y(value)+4} textAnchor="end" className="trend-axis">{value}</text></g>)}
              {observed.length>0&&observed.length<data.days.length&&<rect x={x(observed.length-1)+1} y={top} width={Math.max(0,width-right-x(observed.length-1)-1)} height={bottom-top} className="trend-future"/>}
              {line&&<path d={line} className="trend-line"/>}
              {observed.map((point,i)=>point.completed>0&&<circle key={point.key} cx={x(i)} cy={y(point.completed)} r={3} className="trend-point"/>)}
              {day&&<><line x1={x(index)} x2={x(index)} y1={top} y2={bottom} className="trend-cursor"/>{!day.future&&<circle cx={x(index)} cy={y(day.completed)} r={5} className="trend-selected"/>}</>}
              {tickIndices.map(i=><text key={i} x={x(i)} y={height-15} textAnchor={i===0?'start':i===data.days.length-1?'end':'middle'} className="trend-axis">{shortDate(data.days[i].date)}</text>)}
            </svg>
          </div>
          {day&&<div className="trend-day-readout"><span>{fullDate(day.date)}</span><strong>{day.future?'Upcoming':`${day.completed} completed`}</strong></div>}
          <label className="trend-day-slider">Inspect a day<input type="range" min={0} max={data.days.length-1} step={1} value={index} aria-label="Day to inspect" aria-valuetext={day?`${fullDate(day.date)}: ${day.future?'upcoming':`${day.completed} completed activities`}`:undefined} onChange={event=>setInspected(data.days[Number(event.target.value)].key)}/></label>
          {data.total===0&&<p className="trend-empty">{observed.length?'No completed activities in this period yet. Mark an activity complete to start your trend.':'This period is still ahead. Choose an earlier week to see your history.'}</p>}
          <p className="trend-method">Grouped by scheduled day. Upcoming days are left blank.</p>
          <details className="trend-data"><summary>View daily data</summary><div><table><caption>{selectedActivity?.title || 'All activities'} · {weeks}-week daily counts</caption><thead><tr><th scope="col">Date</th><th scope="col">Completed</th><th scope="col">Scheduled</th></tr></thead><tbody>{data.days.map(point=><tr key={point.key}><th scope="row">{shortDate(point.date)}</th><td>{point.future?'Upcoming':point.completed}</td><td>{point.scheduled}</td></tr>)}</tbody></table></div></details>
        </>}
      </figure>
      <aside className="consistency-panel" aria-labelledby={`${chartId}-leaders`}>
        <h4 id={`${chartId}-leaders`}>Most consistent</h4><p className="consistency-intro">The activities you keep coming back to.</p>
        {loading?<div className="leader-skeleton" role="status" aria-label="Loading consistency leaderboard">{[0,1,2,3,4].map(i=><span key={i}/>)}</div>:all.leaderboard.length===0?<div className="leader-empty"><p>No completed activities yet.</p><small>Your most regular activities will appear here as you log them.</small></div>:<ol className="consistency-list">{all.leaderboard.slice(0,5).map((activity,rank)=><li key={activity.key}><button aria-pressed={selectedKey===activity.key} aria-label={`Show trend for ${activity.title}, ${activity.activeDays} completed days out of ${activity.scheduledDays} scheduled days`} onClick={()=>{setSelected(selectedKey===activity.key?null:activity.key);setInspected(null);}}><span className="consistency-rank">{rank+1}</span><span className="consistency-name"><b>{activity.title}</b><span><i className="dot" style={{background:colors[activity.category]||'var(--muted)'}}/>{activity.category}</span><small>{activity.activeDays} of {activity.scheduledDays} scheduled days · {activity.completed} {activity.completed===1?'completion':'completions'}</small><span className="consistency-track" aria-hidden="true"><span style={{width:`${activity.rate*100}%`}}/></span></span><span className="consistency-score"><b>{activity.activeDays}</b><small>days</small></span></button></li>)}</ol>}
        <p className="consistency-method">Ranked by days with a completion, then scheduled-day completion rate. Multiple sessions on one day count as one day. Future slots don’t count against you.</p>
        {!loading&&all.leaderboard.length>0&&<p className="consistency-hint">Select an activity to explore its trend.</p>}
      </aside>
    </div>}
  </section>;
}
