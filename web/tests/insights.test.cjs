const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const output = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/insights.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const context={exports:{},Date,Math,String};vm.runInNewContext(output,context);
const {buildInsights,activityKey}=context.exports;
const at=(day,hour=9)=>new Date(2026,9,day,hour);
const item=(id,title,day,status='completed',category='Health',hour=9)=>({id,title,category,startAt:at(day,hour).toISOString(),endAt:at(day,hour+1).toISOString(),status,notes:''});
const from=at(26,0),to=new Date(2026,10,2),now=at(30,12);

test('daily completion totals reconcile; duplicate sessions count as one consistent day',()=>{
 const data=buildInsights([item('1','Dog walk',26),item('2','Dog walk',26,'completed','Health',15),item('3','Dog walk',27),item('4','Dog walk',28,'skipped'),item('5','Read',26)],from,to,now);
 assert.equal(data.total,4);assert.equal(data.activeDays,2);assert.equal(data.days[0].completed,3);assert.equal(data.days.reduce((s,d)=>s+d.completed,0),data.total);
 const dog=data.leaderboard.find(a=>a.title==='Dog walk');assert.equal(dog.activeDays,2);assert.equal(dog.completed,3);assert.equal(dog.scheduledDays,3);assert.equal(dog.rate,2/3);
});
test('future dates and later planned slots today do not penalize consistency',()=>{
 const data=buildInsights([item('1','Walk',29),item('2','Walk',30,'planned','Health',18),item('3','Walk',31,'planned'),item('4','Walk',31,'completed')],from,to,now);
 const walk=data.leaderboard[0];assert.equal(walk.activeDays,1);assert.equal(walk.scheduledDays,1);assert.equal(walk.rate,1);assert.equal(data.total,1);assert.equal(data.days[5].future,true);assert.equal(data.days[5].completed,0);assert.equal(data.days[5].scheduled,2);
});
test('leaderboard rewards repeat days over many sessions on a single day and breaks ties by rate',()=>{
 const data=buildInsights([item('1','Daily',26),item('2','Daily',27),...Array.from({length:4},(_,i)=>item('repeat'+i,'Once',26)),item('3','Reliable',26),item('4','Reliable',27),item('5','Daily',28,'skipped')],from,to,now);
 assert.equal(data.leaderboard[0].title,'Reliable');assert.equal(data.leaderboard[1].title,'Daily');assert.equal(data.leaderboard[2].title,'Once');
});
test('activity selection filters chart totals but keeps the overall leaderboard',()=>{
 const items=[item('1',' Dog   walk ',26),item('2','dog walk',27),item('3','Dog walk',28,'completed','Personal')];
 const data=buildInsights(items,from,to,now,activityKey(items[0]));
 assert.equal(data.total,2);assert.equal(data.leaderboard.length,2);assert.equal(data.leaderboard[0].activeDays,2);assert.equal(data.days[2].completed,0);
});
test('range boundaries, empty history, and local dates across DST stay honest',()=>{
 const start=new Date(2026,9,12),end=new Date(2026,10,9);
 const data=buildInsights([],start,end,new Date(2026,10,1,12));assert.equal(data.days.length,28);assert.equal(new Set(data.days.map(d=>d.key)).size,28);assert.equal(data.total,0);assert.equal(data.leaderboard.length,0);
 const bounded=buildInsights([item('a','A',25),item('b','B',26),{...item('c','C',30),startAt:to.toISOString()}],from,to,now);assert.equal(bounded.total,1);
});
