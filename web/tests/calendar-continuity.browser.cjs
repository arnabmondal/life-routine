// Browser regression: isolated API fixtures; never mutates the user's stored routine.
// Requires Playwright and installed Chrome. See CALENDAR_CONTINUITY_VERIFICATION.md.
process.env.TZ='America/Los_Angeles';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const outputDir=process.env.CALENDAR_TEST_OUTPUT||require('node:path').join(require('node:os').tmpdir(),'daywell-calendar-continuity');
require('node:fs').mkdirSync(outputDir,{recursive:true});
const baseURL=process.env.BASE_URL||'http://localhost:3000';
(async()=>{
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),headless:true});
const results=[];
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/Los_Angeles'});
 await context.addInitScript(()=>localStorage.setItem('daywell.calendar-settings.v1',JSON.stringify({start:0,end:1440})));
 const page=await context.newPage();page.setDefaultTimeout(10000);console.error('width',width);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const monday=new Date();monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
 const at=(day,hour)=>{const d=new Date(monday);d.setDate(d.getDate()+day);d.setHours(hour);return d.toISOString()};
 let items=[{id:'early',title:'Early fixture',category:'Health',startAt:at(0,7),endAt:at(0,8),status:'planned',notes:''},{id:'target',title:'Evening fixture',category:'Personal',startAt:at(2,18),endAt:at(2,19),status:'planned',notes:''}];
 let failWrite=false,failRead=false,reads=0;
 await page.route('**/api/templates',r=>r.fulfill({json:{templates:[]}}));
 await page.route('**/api/activities**',async r=>{
  const req=r.request();await new Promise(res=>setTimeout(res,120));
  if(req.method()==='GET'){reads++;return r.fulfill({status:failRead?503:200,json:failRead?{error:'Test refresh failure'}:{activities:items}})}
  if(failWrite)return r.fulfill({status:503,json:{error:'Test save failure'}});
  const activity={...items.find(x=>x.id==='target'),...req.postDataJSON()};items=items.map(x=>x.id===activity.id?activity:x);
  return r.fulfill({json:{activity}});
 });
 console.error('goto');await page.goto(baseURL);console.error('loaded');await page.locator('.time-scroll').waitFor();
 if(width<850)await page.locator('.day-picker button').nth(2).click();
 await page.evaluate(()=>{const s=document.querySelector('.time-scroll');s.scrollTop=18*144-130;window.scrollTo(0,260);window.grid=s});
 const card=page.locator('[data-activity-id="target"]');
 const snapshot=()=>page.evaluate(()=>({scroll:document.querySelector('.time-scroll').scrollTop,y:window.scrollY,top:document.querySelector('[data-activity-id="target"]').getBoundingClientRect().top,same:window.grid===document.querySelector('.time-scroll'),focus:document.activeElement?.getAttribute('aria-label'),day:document.querySelector('.day-picker [aria-pressed="true"]')?.textContent}));
 const stable=async(before,label,focus)=>{const after=await snapshot();assert.equal(after.same,true,label+' grid identity');for(const k of ['scroll','y','top'])assert.ok(Math.abs(after[k]-before[k])<=1,`${label} ${k}: ${before[k]} -> ${after[k]}`);assert.equal(after.day,before.day,label+' day');if(focus)assert.equal(after.focus,focus,label+' focus');console.error('PASS',label);results.push({width,label,before,after})};
 for(const [action,status] of [['Complete','completed'],['Skip','skipped']]){
  const button=card.getByRole('button',{name:action+' Evening fixture',exact:true});await button.focus();console.error('action',action);const before=await snapshot();const prior=reads;await button.click();await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);await page.waitForTimeout(180);assert.ok(reads>prior);assert.equal(await card.getAttribute('class').then(c=>c.includes(status)),true);await stable(before,action,action+' Evening fixture');
 }
 const edit=card.locator('.scheduled-edit');await edit.focus();const beforeEdit=await snapshot();await edit.click();await page.getByLabel('Notes').fill('Saved draft');await page.getByRole('button',{name:'Save activity',exact:true}).click();await page.locator('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);await stable(beforeEdit,'edit success',(await edit.getAttribute('aria-label')));
 failWrite=true;
 const skip=card.getByRole('button',{name:'Skip Evening fixture',exact:true});await skip.focus();const beforeFail=await snapshot();await skip.click();await page.locator('.error').waitFor();await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);await stable(beforeFail,'skip write failure','Skip Evening fixture');assert.ok((await card.getAttribute('class')).includes('skipped'));
 await edit.focus();const beforeDialogFail=await snapshot();await edit.click();await page.getByLabel('Notes').fill('Unsaved draft retained');await page.getByRole('button',{name:'Save activity',exact:true}).click();await page.locator('.form-error').waitFor();assert.equal(await page.getByLabel('Notes').inputValue(),'Unsaved draft retained');assert.equal(await page.locator('dialog').evaluate(d=>d.open),true);assert.equal(await page.locator('dialog').evaluate(d=>d.contains(document.activeElement)),true,'failed save keeps focus in editor');assert.equal(await page.locator('.time-scroll').evaluate(s=>s.scrollTop),beforeDialogFail.scroll);await page.getByRole('button',{name:'Cancel',exact:true}).click();await stable(beforeDialogFail,'editor failure and cancel',await edit.getAttribute('aria-label'));
 const failedComplete=card.getByRole('button',{name:'Complete Evening fixture',exact:true});await failedComplete.focus();const beforeCompleteFailure=await snapshot();await failedComplete.click();await page.locator('.error').waitFor();await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);await stable(beforeCompleteFailure,'completion write failure','Complete Evening fixture');assert.ok((await card.getAttribute('class')).includes('skipped'));
 failWrite=false;
 for(const outcome of ['completed','skipped']){
  await edit.focus();const before=await snapshot();await edit.click();await page.locator('.status-row').getByRole('button',{name:outcome,exact:true}).click();await page.getByRole('button',{name:'Save activity',exact:true}).click();await page.locator('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);assert.ok((await card.getAttribute('class')).includes(outcome));await stable(before,'editor outcome '+outcome,await edit.getAttribute('aria-label'));
 }
 failRead=true;
 const complete=card.getByRole('button',{name:'Complete Evening fixture',exact:true});await complete.focus();const beforeRead=await snapshot();await complete.click();await page.locator('.error').waitFor();await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);await stable(beforeRead,'saved completion with refresh failure','Complete Evening fixture');assert.ok((await card.getAttribute('class')).includes('completed'));
 failRead=false;await page.getByRole('button',{name:'Retry',exact:true}).scrollIntoViewIfNeeded();const beforeRetry=await snapshot();await page.getByRole('button',{name:'Retry',exact:true}).click();await page.locator('.error').waitFor({state:'detached'});await stable(beforeRetry,'refresh retry','Complete Evening fixture');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');await page.screenshot({path:`${outputDir}/${width}.png`,fullPage:true});
 // Changing day intentionally relocates the card, while retaining the viewport.
 await edit.focus();const beforeMove=await snapshot();await edit.click();
 const local=(iso)=>{const d=new Date(iso);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:00`};
 await page.getByLabel('Start',{exact:true}).fill(local(at(3,18)));await page.getByLabel('End',{exact:true}).fill(local(at(3,19)));await page.getByRole('button',{name:'Save activity',exact:true}).click();await page.locator('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>!document.querySelector('.scheduled-edit').disabled);
 const afterMove=await snapshot();assert.equal(afterMove.same,true);assert.equal(afterMove.scroll,beforeMove.scroll);assert.equal(afterMove.y,beforeMove.y);assert.equal(afterMove.day,beforeMove.day);
 assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('.time-scroll')),width<850,'cross-day focus fallback');
 results.push({width,label:'editor changes day',before:beforeMove,after:afterMove});
 assert.deepEqual(errors,[]);await context.close();
}
console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
