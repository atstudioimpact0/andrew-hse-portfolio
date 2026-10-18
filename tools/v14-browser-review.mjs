// Dedicated V14 PREVIEW browser smoke test + four screenshot exports.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
const root = "http://127.0.0.1:4173/";
const configs=[
  {name:"en-desktop",path:"",lang:"en",width:1440,height:900},
  {name:"en-mobile",path:"",lang:"en",width:390,height:844},
  {name:"ar-desktop",path:"ar.html",lang:"ar",width:1440,height:900},
  {name:"ar-mobile",path:"ar.html",lang:"ar",width:390,height:844}
];
fs.mkdirSync("v14-review-screenshots",{recursive:true});
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const results=[];
try{
 for(const c of configs){
  const context=await browser.newContext({viewport:{width:c.width,height:c.height},reducedMotion:"reduce",deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const response=await page.goto(root+c.path,{waitUntil:"networkidle",timeout:30000});
  assert.equal(response?.status(),200,c.name+" HTML load");
  await page.waitForFunction(()=>document.querySelectorAll(".work-line").length===16,{timeout:10000});
  assert.equal(await page.locator(".door").count(),3,c.name+" doorway count");
  assert.equal(await page.locator(".preview-strip").count(),0,c.name+" preview strip should never appear on the published design");
  assert.ok(!(await page.title()).includes("Preview")&&!(await page.title()).includes("معاينة"),c.name+" title must be official");
  assert.equal(await page.locator(".timeline-item").count(),2,c.name+" two grounded CV positions");
  assert.equal(await page.locator(".education").count(),1,c.name+" education entry");
  assert.equal(await page.locator(".hero-role").count(),1,c.name+" clear job title");
  const readability=await page.evaluate(()=>{
    const selectors=[".hero-description",".timeline-item time",".project",".door-desc",".work-line-label",".site-nav a"];
    return selectors.map(selector=>{
      const el=document.querySelector(selector);
      return {selector,size:el?parseFloat(getComputedStyle(el).fontSize):0};
    });
  });
  for(const item of readability){
    assert.ok(item.size>=12,c.name+" text too small "+item.selector+"="+item.size);
  }

  assert.equal(await page.locator(".work-line").count(),16,c.name+" 16 work areas");
  assert.equal(await page.locator(".work-examples li").count(),25,c.name+" 25 unique example labels");
  assert.equal(await page.locator(".hero-photo img").evaluate(img=>img.naturalWidth>0),true,c.name+" portrait loaded");
  assert.equal(await page.evaluate(()=>document.documentElement.lang),c.lang);
  const bounds=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
  assert.ok(bounds.body<=bounds.viewport+2&&bounds.html<=bounds.viewport+2,c.name+" horizontal overflow "+JSON.stringify(bounds));
  await page.screenshot({path:"v14-review-screenshots/"+c.name+".png",fullPage:true,animations:"disabled"});
  const videos=page.locator('[data-open="videos"]');
  await videos.click();
  await page.waitForFunction(()=>document.querySelectorAll(".video-tile").length===2,{timeout:15000});
  assert.equal(await page.locator(".video-tile").count(),2,c.name+" published videos");
  const play=page.locator(".video-tile .open-action").first();
  await play.click();
  assert.equal(await page.locator("#player-dialog").evaluate(d=>d.open),true,c.name+" video viewer");
  assert.ok((await page.locator("#player-video").getAttribute("src")).endsWith(".mp4"));
  await page.locator("#player-close").click();
  await page.locator("#library-close").click();
  await page.locator('[data-open="signs"]').click();
  await page.waitForFunction(()=>document.querySelectorAll(".sign-tile").length===12,{timeout:16000});
  assert.equal(await page.locator(".sign-tile").count(),12,c.name+" signs and work graphics");
  await page.locator("#library-close").click();
  await page.locator('[data-open="layouts"]').click();
  assert.equal(await page.locator(".layout-tile").count(),4,c.name+" disclosed planning areas");
  assert.equal(await page.locator(".layout-caption").count(),4,c.name+" conceptual disclaimers");
  const imgLoaded=await page.locator(".layout-tile .library-thumb img").evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0));
  // Browser may be resolving images at element creation; wait if needed.
  if(!imgLoaded)await page.waitForFunction(()=>[...document.querySelectorAll(".layout-tile .library-thumb img")].every(i=>i.complete&&i.naturalWidth>0),{timeout:10000});
  await page.locator(".layout-tile .open-action").first().click();
  assert.equal(await page.locator("#detail-dialog").evaluate(d=>d.open),true,c.name+" detail dialog");
  assert.equal(await page.locator(".detail-examples li").count(),4,c.name+" related examples details");
  await page.locator("#detail-close").click();
  await page.locator("#library-close").click();
  assert.deepEqual(errors,[],c.name+" page JS exceptions");
  results.push({viewport:c.name,portrait:true,cases:16,examples:25,videos:2,signs:12,layouts:4,overflow:false,jsErrors:0});
  await context.close();
 }
 console.log(JSON.stringify({status:"PASS",reviewScreenshots:"v14-review-screenshots",results},null,2));
} finally {await browser.close();}
