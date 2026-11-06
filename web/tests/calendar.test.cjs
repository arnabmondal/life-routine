const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const output = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/calendar.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, Date, Math, String };
vm.runInNewContext(output, context);
const { layoutDay, moveActivityTo, snapMinute } = context.exports;
const day = new Date(2026, 9, 30);
const at = (hour, minute=0, offset=0) => new Date(2026, 9, 30 + offset, hour, minute).toISOString();
const activity = (id, startAt, endAt) => ({ id, title:id, category:'Personal', startAt, endAt, status:'planned', notes:'Keep these notes' });

test('overlaps stay at their times in separate lanes; touching endpoints share a lane', () => {
 const rows=layoutDay([activity('a',at(9),at(10)),activity('b',at(9,30),at(10,30)),activity('c',at(11),at(12))],day);
 assert.equal(rows[0].start,540);assert.equal(rows[1].start,570);
 assert.equal(rows[0].lanes,2);assert.equal(rows[1].lanes,2);assert.notEqual(rows[0].lane,rows[1].lane);assert.equal(rows[2].lanes,1);
 const touching=layoutDay([activity('a',at(9),at(10)),activity('b',at(10),at(11))],day);
 assert.equal(touching[0].lanes,1);assert.equal(touching[1].lanes,1);
});
test('chain overlaps reuse lanes without obscuring a still-running activity', () => {
 const rows=layoutDay([activity('a',at(9),at(12)),activity('b',at(9,30),at(10)),activity('c',at(10),at(11))],day);
 assert.equal(rows[0].lanes,2);assert.equal(rows[1].lane,rows[2].lane);assert.notEqual(rows[0].lane,rows[2].lane);
});
test('three simultaneous activities allocate three lanes deterministically', () => {
 const rows=layoutDay(['c','a','b'].map(id=>activity(id,at(9),at(10))),day);
 assert.equal(new Set(rows.map(r=>r.lane)).size,3);assert.ok(rows.every(r=>r.lanes===3));assert.equal(rows[0].activity.id,'a');
});
test('very short cards get separate visual lanes and midnight events are clipped', () => {
 const rows=layoutDay([activity('a',at(9),at(9,5)),activity('b',at(9,5),at(9,10))],day);
 assert.equal(rows[0].visualEnd,560);assert.notEqual(rows[0].lane,rows[1].lane);
 const overnight=activity('night',at(23,30),at(1,0,1));
 const first=layoutDay([overnight],day)[0];const second=layoutDay([overnight],new Date(2026,9,31))[0];
 assert.equal(first.end,1440);assert.equal(second.start,0);assert.equal(second.end,60);assert.equal(second.continuation,true);
});
test('dragging preserves duration, category, status and notes across midnight', () => {
 const source={...activity('a',at(9,40),at(10,25)),status:'completed'};
 const moved=moveActivityTo(source,new Date(2026,9,31),1425);
 assert.equal(Date.parse(moved.endAt)-Date.parse(moved.startAt),45*60000);
 assert.equal(new Date(moved.startAt).getHours(),23);assert.equal(new Date(moved.startAt).getMinutes(),45);assert.equal(new Date(moved.endAt).getDate(),1);
 assert.equal(moved.status,'completed');assert.equal(moved.notes,source.notes);assert.equal(source.startAt,at(9,40));
});
test('local destination survives DST transition while elapsed duration stays fixed', () => {
 const source=activity('dst',at(9),at(10));
 const moved=moveActivityTo(source,new Date(2026,10,1),9*60);
 assert.equal(new Date(moved.startAt).getHours(),9);assert.equal(Date.parse(moved.endAt)-Date.parse(moved.startAt),3600000);
});
test('snap rounds to quarter hours and clamps to the current day', () => {
 assert.equal(snapMinute(546),540);assert.equal(snapMinute(548),555);assert.equal(snapMinute(-300),0);assert.equal(snapMinute(1600),1425);
});


test('planning hours hide outside events and clip crossings before overlap layout', () => {
 const rows=layoutDay([
  activity('before',at(4),at(6)),activity('cross-start',at(5),at(7)),
  activity('morning',at(6,30),at(8)),activity('cross-end',at(21,30),at(23)),
  activity('after',at(22),at(23)),
 ],day,360,1320);
 assert.deepEqual(Array.from(rows,r=>r.activity.id),['cross-start','morning','cross-end']);
 assert.equal(rows[0].start,360);assert.equal(rows[0].end,420);
 assert.equal(rows[0].lanes,2);assert.equal(rows[1].lanes,2);
 assert.equal(rows[2].end,1320);assert.equal(rows[2].visualEnd,1320);
});
test('quarter-hour windows and overnight continuations stay within visible boundaries', () => {
 const rows=layoutDay([activity('overnight',at(23,0,-1),at(9)),activity('short',at(9,10),at(9,15))],day,495,555);
 assert.equal(rows[0].start,495);assert.equal(rows[0].continuation,true);
 assert.equal(rows[1].visualEnd,555);
 assert.ok(rows.every(row=>row.start>=495&&row.visualEnd<=555));
});
