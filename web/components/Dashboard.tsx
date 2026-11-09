'use client';
import { categoryColors as palette } from '../lib/theme';
import DayAgenda from './DayAgenda';
import CalendarSettings from './CalendarSettings';
import { DEFAULT_PLANNING_WINDOW, CALENDAR_SETTINGS_KEY, isPlanningWindow, PlanningWindow } from '../lib/calendar-settings';
import WeekCalendar from './WeekCalendar';
import ActivityInsights from './ActivityInsights';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {Sun, CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Settings, Sparkles, Trash2, X} from 'lucide-react';
type Item={id:string;title:string;category:string;startAt:string;endAt:string;status:'planned'|'completed'|'skipped';notes:string};
type Template={id:string;title:string;category:string;weekday:number;startTime:string;endTime:string};
const cats=['Health','Family','Career','Learning','Personal'];
const pad=(n:number)=>String(n).padStart(2,'0');
const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const monday=(d:Date)=>addDays(new Date(d.getFullYear(),d.getMonth(),d.getDate()),-((d.getDay()+6)%7));
const formatTime=(iso:string)=>new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const dateTime=(key:string,time:string)=>new Date(`${key}T${time}:00`).toISOString();
const localInput=(iso:string)=>{const d=new Date(iso);return `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
const api=async(url:string,options?:RequestInit)=>{const r=await fetch(url,options);const j=await r.json();if(!r.ok)throw Error(j.error||'Request failed');return j};
const json=(method:string,body:unknown)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
export default function Dashboard(){
 const [planningWindow,setPlanningWindow]=useState<PlanningWindow>(DEFAULT_PLANNING_WINDOW);
 const [settingsOpen,setSettingsOpen]=useState(false);
 useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem(CALENDAR_SETTINGS_KEY)||'null');if(isPlanningWindow(stored))setPlanningWindow(stored)}catch{/* Use safe defaults if stored settings are unavailable or invalid. */}},[]);
 const [week,setWeek]=useState(()=>monday(new Date()));const [items,setItems]=useState<Item[]>([]);const [templates,setTemplates]=useState<Template[]>([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [view,setView]=useState<'agenda'|'calendar'|'list'>('agenda');const [editing,setEditing]=useState<Item|null>(null);const [modal,setModal]=useState(false);const [form,setForm]=useState({title:'',category:'Health',start:'',end:'',notes:''});
 const [selectedDay,setSelectedDay]=useState(()=>new Date());
 useEffect(()=>{const mode=new URLSearchParams(window.location.search).get('view');if(mode==='log')setView('list');else if(mode==='week')setView('calendar')},[]);
 const changeView=(next:'agenda'|'calendar'|'list')=>{
  setView(next);
  const url=new URL(window.location.href);
  if(next==='list')url.searchParams.set('view','log');else if(next==='calendar')url.searchParams.set('view','week');else url.searchParams.delete('view');
  window.history.replaceState(null,'',url.pathname+url.search+url.hash);
 };
 const requestVersion=useRef(0);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const [formError,setFormError]=useState('');
 const [notice,setNotice]=useState('');
 const [undoMove,setUndoMove]=useState<{before:Item;after:Item}|null>(null);
 const movingRef=useRef(false);
 const loadedWeek=useRef('');
 const feedbackRef=useRef<HTMLDivElement>(null);
 const [feedbackHeight,setFeedbackHeight]=useState(0);
 // Retain the feedback footprint after dismissal/retry, avoiding bottom-of-page scroll clamping.
 useLayoutEffect(()=>{const height=feedbackRef.current?.getBoundingClientRect().height||0;setFeedbackHeight(current=>Math.max(current,height))},[error,notice]);
 const returnFocus=useRef<HTMLElement|null>(null);
 const returnEntry=useRef<{id:string;control:string}|null>(null);
 const lastCalendarFocus=useRef<{target:HTMLElement;entry:{id:string;control:string}}|null>(null);
 const rememberFocus=()=>{if(!modal){
  const target=document.activeElement instanceof HTMLElement?document.activeElement:null;
  returnFocus.current=target;
  const entry=target?.closest<HTMLElement>('[data-activity-id]');
  returnEntry.current=entry?{id:entry.dataset.activityId!,control:target!.className}:null;
  if(target&&returnEntry.current)lastCalendarFocus.current={target,entry:returnEntry.current};
 }};
 // Restore only focus we own, without moving either the page or the time grid.
 useLayoutEffect(()=>{
  if(modal){
   const dialog=dialogRef.current;
   // Disabling Save can blur it to the body. Keep a failed save inside the editor.
   if(!busy && dialog?.open && !dialog.contains(document.activeElement))dialog.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus({preventScroll:true});
   return;
  }
  if(busy)return;
  let target=returnFocus.current;
  if(target && !target.isConnected){
   const entry=returnEntry.current;
   target=Array.from(document.querySelectorAll<HTMLElement>('[data-activity-id]')).find(node=>node.dataset.activityId===entry?.id)?.querySelector<HTMLElement>(entry?.control?'.'+entry.control.split(' ').join('.'):'.scheduled-edit')||document.querySelector<HTMLElement>('.time-scroll, .agenda-list');
   if(target && !target.getClientRects().length)target=document.querySelector<HTMLElement>('.time-scroll, .agenda-list');
  }
  if(target?.isConnected && (document.activeElement===document.body || document.activeElement===target)){
   target.focus({preventScroll:true});
  }
  returnFocus.current=null;returnEntry.current=null;
 },[busy,modal,error]);
 useEffect(()=>{if(modal){setFormError('');dialogRef.current?.showModal();dialogRef.current?.querySelector('input')?.focus()}},[modal]);
 const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(week,i)),[week]);
 const agendaDay=days.some(day=>dateKey(day)===dateKey(selectedDay))?selectedDay:days[0];
 const chooseDay=(day:Date)=>{setSelectedDay(day);if(dateKey(monday(day))!==dateKey(week))setWeek(monday(day))};
 const load=useCallback(async()=>{
  const version=++requestVersion.current;
  // Only a new week replaces the schedule with a skeleton. Same-week refreshes
  // retain the mounted calendar, its selected day, scroll offsets, and keyed cards.
  const initial=loadedWeek.current!==dateKey(week);
  if(initial){setLoading(true);setItems([])}
  setError('');setUndoMove(null);
  try{
   const from=dateTime(dateKey(week),'00:00');
   const to=dateTime(dateKey(addDays(week,7)),'00:00');
   const [a,t]=await Promise.all([
    api(`/api/activities?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    api('/api/templates'),
   ]);
   if(version===requestVersion.current){
    loadedWeek.current=dateKey(week);setItems(a.activities);setTemplates(t.templates);
   }
  }catch(e){
   if(version===requestVersion.current)setError((e as Error).message);
  }finally{
   if(version===requestVersion.current)setLoading(false);
  }
 },[week]);
 const retry=()=>{
  const previous=lastCalendarFocus.current;
  if(previous){returnFocus.current=previous.target;returnEntry.current=previous.entry}
  void load();
 };
 useEffect(()=>{load()},[load]);
 const summary=useMemo(()=>({planned:items.length,done:items.filter(x=>x.status==='completed').length,skipped:items.filter(x=>x.status==='skipped').length,minutes:items.filter(x=>x.status==='completed').reduce((n,x)=>n+(Date.parse(x.endAt)-Date.parse(x.startAt))/60000,0)}),[items]);
 const openNew=(date?:Date)=>{rememberFocus();setEditing(null);const key=dateKey(date||(view==='agenda'?agendaDay:undefined)||(days.some(d=>dateKey(d)===dateKey(new Date()))?new Date():week));const startMinute=Math.max(planningWindow.start,Math.min(9*60,planningWindow.end-15));const startDate=new Date(`${key}T00:00:00`);startDate.setMinutes(startMinute);const end=new Date(`${key}T00:00:00`);end.setMinutes(Math.min(startMinute+60,planningWindow.end));setForm({title:'',category:'Health',start:localInput(startDate.toISOString()),end:localInput(end.toISOString()),notes:''});setModal(true)};
 const openEdit=(a:Item)=>{rememberFocus();setEditing(a);setForm({title:a.title,category:a.category,start:localInput(a.startAt),end:localInput(a.endAt),notes:a.notes});setModal(true)};
 const save=async()=>{if(!form.title.trim()||!form.start||!form.end||new Date(form.end)<=new Date(form.start)){setFormError('Add a name and an end time after the start time.');return}setFormError('');setBusy(true);setError('');try{const payload={title:form.title.trim(),category:form.category,startAt:new Date(form.start).toISOString(),endAt:new Date(form.end).toISOString(),notes:form.notes,...(editing?{status:editing.status}:{})};const result=await api(editing?`/api/activities/${editing.id}`:'/api/activities',json(editing?'PUT':'POST',payload));setItems(current=>editing?current.map(item=>item.id===editing.id?result.activity:item):[...current,result.activity]);dialogRef.current?.close();setModal(false);await load()}catch(e){setFormError('Could not save this activity. Your changes are still here. Please try again.')}finally{setBusy(false)}};
 const changeStatus=async(a:Item,status:Item['status'])=>{rememberFocus();setBusy(true);setError('');try{const result=await api(`/api/activities/${a.id}`,json('PUT',{...a,status}));setItems(current=>current.map(item=>item.id===a.id?result.activity:item));await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 const remove=async()=>{if(!editing||!confirm(`Delete “${editing.title}”? This cannot be undone.`))return;setFormError('');setBusy(true);try{await api(`/api/activities/${editing.id}`,{method:'DELETE'});setItems(current=>current.filter(item=>item.id!==editing.id));dialogRef.current?.close();setModal(false);await load()}catch(e){setFormError('Could not delete this activity. Please try again.')}finally{setBusy(false)}};
 const moveActivity=async(activity:Item,startAt:string,remember=true)=>{
  if(movingRef.current)return false;
  rememberFocus();movingRef.current=true;setBusy(true);setError('');setNotice('');setUndoMove(null);
  const duration=Date.parse(activity.endAt)-Date.parse(activity.startAt);
  const moved={...activity,startAt,endAt:new Date(Date.parse(startAt)+duration).toISOString()};
  setItems(current=>current.map(item=>item.id===activity.id?moved:item));
  try{
   const result=await api(`/api/activities/${activity.id}`,json('PUT',moved));
   setItems(current=>current.map(item=>item.id===activity.id?result.activity:item));
   setNotice(`${activity.title} moved to ${new Date(startAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at ${formatTime(startAt)}.`);
   if(remember)setUndoMove({before:activity,after:result.activity});
   return true;
  }catch{
   setItems(current=>current.map(item=>item.id===activity.id?activity:item));
   setError('The move could not be saved. The activity is back at its original time. Try dragging again or edit its time.');
   return false;
  }finally{movingRef.current=false;setBusy(false)}
 };
 const seed=async()=>{rememberFocus();setBusy(true);setError('');try{const result=templates.length?{templates}:await api('/api/templates',{method:'POST'});const current=result.templates as Template[];let created=0;for(const d of days){for(const t of current.filter(t=>t.weekday===d.getDay())){const start=dateTime(dateKey(d),t.startTime);if(items.some(a=>a.title===t.title&&a.startAt===start))continue;await api('/api/activities',json('POST',{title:t.title,category:t.category,startAt:start,endAt:dateTime(dateKey(d),t.endTime),notes:''}));created++}}await load();setNotice(created?`${created} routine activities added.`:'Your routine is already up to date for this week.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}};
 return <div className="shell agenda-shell"><header className="sidebar"><div className="brand"><Sun className="brandmark" size={28} strokeWidth={1.6}/><div>daywell</div></div><nav aria-label="Main navigation"><button className={'nav'+(view!=='list'?' active':'')} onClick={()=>changeView('agenda')}><CalendarDays size={18}/> My calendar</button><button className={'nav'+(view==='list'?' active':'')} onClick={()=>changeView('list')}><Check size={18}/> Activity log</button></nav></header>
 <main className="main">
 <header className="schedule-toolbar"><div className="schedule-title"><h1>{view==='agenda'?(dateKey(agendaDay)===dateKey(new Date())?'Today':agendaDay.toLocaleDateString('en-US',{weekday:'long'})):view==='calendar'?'Your week':'Activity log'}</h1><p>{view==='agenda'?agendaDay.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}):`${days[0].toLocaleDateString('en-US',{month:'long',day:'numeric'})} – ${days[6].toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}`}</p></div>
 <div className="date-navigation"><button className="square" disabled={busy||loading} aria-label={view==='agenda'?'Previous day':'Previous week'} onClick={()=>view==='agenda'?chooseDay(addDays(agendaDay,-1)):setWeek(addDays(week,-7))}><ChevronLeft size={18}/></button><button className="outline today-button" disabled={busy} onClick={()=>chooseDay(new Date())}>Today</button><button className="square" disabled={busy||loading} aria-label={view==='agenda'?'Next day':'Next week'} onClick={()=>view==='agenda'?chooseDay(addDays(agendaDay,1)):setWeek(addDays(week,7))}><ChevronRight size={18}/></button></div>
 <div className="tabs view-tabs" aria-label="Schedule view"><button aria-pressed={view==='agenda'} className={view==='agenda'?'selected':''} onClick={()=>changeView('agenda')}>Agenda</button><button aria-pressed={view==='calendar'} className={view==='calendar'?'selected':''} onClick={()=>changeView('calendar')}>Week</button><button aria-pressed={view==='list'} className={view==='list'?'selected':''} onClick={()=>changeView('list')}><span className="tab-full">Activity log</span><span className="tab-short">Log</span></button></div>
 <div className="toolbar-actions"><button className="primary" disabled={loading||busy} onClick={()=>openNew()}><Plus size={17}/> New activity</button><button className="square calendar-settings-button" title="Calendar settings" aria-label="Calendar settings" aria-haspopup="dialog" disabled={busy||modal} onClick={()=>setSettingsOpen(true)}><Settings size={18}/></button></div></header>
 <section className="compact-stats" aria-label="Weekly progress" aria-busy={loading}>
 <p className="stats-scope">Week of <b>{week.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</b></p>
 <dl><div><dt>Scheduled</dt><dd>{loading?'—':summary.planned}</dd></div><div><dt>Completed</dt><dd>{loading?'—':summary.done}<small>{loading?'':`${summary.planned?Math.round(summary.done/summary.planned*100):0}%`}</small></dd></div><div><dt>Hours<span className="sr-only"> — planned hours of completed activities</span></dt><dd title="Planned hours of completed activities">{loading?'—':Math.round(summary.minutes/60*10)/10}<small>hrs</small></dd></div><div><dt>Skipped</dt><dd>{loading?'—':summary.skipped}</dd></div></dl>
 </section>
 {view==='agenda'&&<div className="agenda-dates" aria-label="Choose a day">{days.map(day=><button key={dateKey(day)} aria-pressed={dateKey(day)===dateKey(agendaDay)} disabled={busy||loading} onClick={()=>chooseDay(day)}><span>{day.toLocaleDateString('en-US',{weekday:'short'})}</span><b>{day.getDate()}</b></button>)}</div>}
 <section className="calendar-panel">

 {view==='list'&&<ActivityInsights week={week} refreshItems={items} refreshing={loading}/>}
 {loading?<div className="loading-state" role="status"><p>Loading your week…</p><div className="skeleton-grid">{days.map(d=><div key={dateKey(d)}><span/><span/><span/></div>)}</div></div>:error&&items.length===0?<div className="empty"><h3>Your schedule is unavailable</h3><p>Check that the local services are running, then retry.</p><button className="outline" onClick={retry}>Retry loading</button></div>:items.length===0?<div className="empty"><CalendarDays size={38}/><h3>A little space to start.</h3><p>Bring in your school runs, walks, and focus blocks—or add an activity of your own.</p><button className="primary" disabled={busy} onClick={seed}><Sparkles size={16}/> Load my weekly routine</button></div>:view==='agenda'?<DayAgenda day={agendaDay} items={items} hours={planningWindow} busy={busy} onEdit={openEdit} onNew={openNew} onStatus={changeStatus} onMove={moveActivity} onViewLog={()=>changeView('list')}/>:view==='calendar'?<WeekCalendar startMinute={planningWindow.start} endMinute={planningWindow.end} onViewLog={()=>changeView('list')} days={days} items={items} busy={busy} onEdit={openEdit} onNew={openNew} onStatus={changeStatus} onMove={moveActivity}/>:<div className="list-view"><div className="log-records-heading"><h3>This week’s activities</h3><span>{items.length} scheduled</span></div>{[...items].sort((a,b)=>a.startAt.localeCompare(b.startAt)).map(a=><div className="list-item" key={a.id}><span className="dot" style={{background:palette[a.category]||'var(--muted)'}}/><button className="list-content" onClick={()=>openEdit(a)}><b>{a.title}</b><small>{new Date(a.startAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {formatTime(a.startAt)} – {formatTime(a.endAt)} · {a.category}</small></button><span className={'status '+a.status}>{a.status}</span><button title="Mark complete" disabled={busy} className="icon-btn" onClick={()=>changeStatus(a,a.status==='completed'?'planned':'completed')}><Check size={17}/></button><button title="Mark skipped" disabled={busy} className="icon-btn" onClick={()=>changeStatus(a,a.status==='skipped'?'planned':'skipped')}><X size={17}/></button></div>)}</div>}
 <div ref={feedbackRef} style={{minHeight:feedbackHeight}}>{error&&<div className="error" role="alert"><span>Could not update your schedule. {error}</span><button onClick={retry}>Retry</button></div>}{notice&&<div className="notice" role="status"><span>{notice}</span><div>{undoMove&&<button disabled={busy} onClick={()=>moveActivity(undoMove.after,undoMove.before.startAt,false)}>Undo move</button>}<button onClick={()=>{setNotice('');setUndoMove(null)}}>Dismiss</button></div></div>}</div>
 {items.length>0&&<div className="panel-footer"><span>{summary.planned-summary.done-summary.skipped} planned · {summary.done} completed · {summary.skipped} skipped</span><button onClick={seed} disabled={busy}>+ Fill missing routine slots</button></div>}
 </section><footer>Designed for progress, not perfection. <Sun size={14} aria-hidden="true"/></footer></main>
 {settingsOpen&&<CalendarSettings value={planningWindow} onSave={setPlanningWindow} onClose={()=>setSettingsOpen(false)}/>}
 {modal&&<dialog ref={dialogRef} className="dialog" aria-labelledby="activity-title" onCancel={()=>setModal(false)} onClose={()=>setModal(false)}><form onSubmit={e=>{e.preventDefault();save()}}><div className="dialog-head"><div><h2 id="activity-title">{editing?'Edit activity':'New activity'}</h2><p>Make space for what matters.</p></div><button type="button" aria-label="Close activity editor" className="icon-btn" onClick={()=>setModal(false)}><X size={20}/></button></div><label>Activity name<input autoFocus required value={form.title} maxLength={200} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Morning strength training"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select></label><div className="two"><label>Start<input required type="datetime-local" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label><label>End<input required type="datetime-local" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div><label>Notes<textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional notes or reflection"/></label>{editing&&<div className="status-row"><span>Actual outcome</span>{(['planned','completed','skipped'] as const).map(s=><button type="button" key={s} className={editing.status===s?'chosen':''} onClick={()=>setEditing({...editing,status:s})}>{s}</button>)}</div>}{formError&&<p className="form-error" role="alert">{formError}</p>}<div className="dialog-actions">{editing&&<button type="button" className="danger" disabled={busy} onClick={remove}><Trash2 size={16}/> Delete</button>}<div className="spacer"/><button type="button" className="outline" onClick={()=>setModal(false)}>Cancel</button><button className="primary" disabled={busy||!form.title.trim()||!form.start||!form.end} type="submit">{busy?'Saving…':'Save activity'}</button></div></form></dialog>}
 </div>
}
