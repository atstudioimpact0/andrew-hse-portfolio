import assert from "node:assert/strict";import fs from "node:fs";import { chromium } from "playwright";
const tests=[["en",1440,"index.html","beyond.html"],["en",390,"index.html","beyond.html"],["ar",1440,"ar.html","beyond-ar.html"],["ar",390,"ar.html","beyond-ar.html"]];
fs.mkdirSync("editorial-review",{recursive:true});
const browser=await chromium.launch({args:["--no-sandbox"]});
try{
for(const [lang,width,main,leaf] of tests){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const r=await page.goto("http://127.0.0.1:4173/"+main,{waitUntil:"networkidle",timeout:30000});
 assert.equal(r.status(),200);
 assert.equal(await page.locator(".second-volume-link").count(),1);
 await page.locator(".second-volume-link").click();
 await page.waitForLoadState("networkidle");assert.ok(page.url().endsWith(leaf));
 assert.equal(await page.locator(".toc-row").count(),4);
 assert.equal(await page.locator(".product-entry").count(),2);
 assert.equal(await page.locator(".hse-entry").count(),2);
 assert.equal(await page.locator(".footer-links a").count(),4);
 assert.equal(await page.locator(".cover-image img").evaluate(e=>e.complete&&e.naturalWidth>0),true);
 const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
 assert.ok(size.body<=size.width+2&&size.html<=size.width+2,"Horizontal overflow "+lang+" "+width+" "+JSON.stringify(size));
 const readable=await page.evaluate(()=>[...document.querySelectorAll(".short-copy,.role-intro,.product-entry>p:last-of-type,.hse-entry>p")].every(x=>parseFloat(getComputedStyle(x).fontSize)>=13));
 assert.equal(readable,true,"Text too small "+lang+" "+width);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:"editorial-review/"+lang+"-"+width+".png",fullPage:true,animations:"disabled"});
 await page.locator(".return-cv").click();await page.waitForLoadState("networkidle");assert.ok(page.url().endsWith(main));
 await page.close();
}
console.log("PASS: 4 viewport editorial review, readability, portfolio gateway, works and return to CV.");
}finally{await browser.close()}
