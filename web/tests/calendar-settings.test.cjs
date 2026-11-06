const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
const output=ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../lib/calendar-settings.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const context={exports:{}};vm.runInNewContext(output,context);
const {isPlanningWindow,planningTimeLabel}=context.exports;
test('planning windows accept quarter hours, including an end at midnight',()=>{
 assert.equal(isPlanningWindow({start:360,end:1320}),true);
 assert.equal(isPlanningWindow({start:495,end:1245}),true);
 assert.equal(isPlanningWindow({start:0,end:1440}),true);
 assert.equal(isPlanningWindow({start:1425,end:1440}),true);
});
test('invalid and malformed persisted windows cannot enter calendar geometry',()=>{
 for(const value of [null,[],{},'06:00', {start:'360',end:1320},{start:360,end:360},{start:1320,end:360},{start:-15,end:60},{start:0,end:1455},{start:361,end:1320},{start:NaN,end:1320}])assert.equal(isPlanningWindow(value),false);
});
test('time labels distinguish midnight at the end of the day',()=>{
 assert.equal(planningTimeLabel(360),'6:00 AM');assert.equal(planningTimeLabel(1320),'10:00 PM');assert.equal(planningTimeLabel(1440),'12:00 AM (end of day)');
});
