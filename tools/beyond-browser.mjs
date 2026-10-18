import assert from "node:assert/strict";import { chromium } from "playwright";import fs from "node:fs";
const cases=[["en",1440,"index.html","beyond.html"],["en",390,"index.html","beyond.html"],["ar",1440,"ar.html","beyond-ar.html"],["ar",390,"ar.html","beyond-ar.html"]];
fs.mkdirSync("beyond-review",{recursive:true});
const browser=await chromium.launch({args:["--no-sandbox"]});
try{
 for(const [lang,width,main,beyond] of cases){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  let res=await page.goto("http://127.0.0.1:4173/"+main,{waitUntil:"networkidle"});
  assert.equal(res.status(),200);
  const link=page.locator(".beyond-entry");assert.equal(await link.count(),1);
  await link.click();
  await page.waitForLoadState("networkidle");
  assert.ok(page.url().endsWith(beyond));
  assert.equal(await page.locator(".feature").count(),2);
  assert.equal(await page.locator(".project").count(),3);
  assert.equal(await page.locator(".lab-feature").count(),2);
  assert.equal(await page.locator(".outlinks a").count(),4);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  assert.equal(overflow,false,"Horizontal overflow: "+lang+" "+width);
  const tiny=await page.evaluate(()=>[...document.querySelectorAll(".feature>p:not(.flag),.project>p:not(.label),.lab-feature>p")].some(n=>parseFloat(getComputedStyle(n).fontSize)<13));
  assert.equal(tiny,false,"Text too small");
  assert.deepEqual(errors,[],"JS errors");
  await page.screenshot({path:"beyond-review/"+lang+"-"+width+".png",fullPage:true,animations:"disabled"});
  const back=page.locator(".back-cv");await back.click();
  await page.waitForLoadState("networkidle");
  assert.ok(page.url().endsWith(main),"Return to original portfolio");
  await page.close();
 }
 console.log("PASS: 4 viewports, bilingual Beyond HSE navigation and content.");
}finally{await browser.close()}
