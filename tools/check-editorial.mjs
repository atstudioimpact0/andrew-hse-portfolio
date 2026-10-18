import assert from "node:assert/strict";import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const data=JSON.parse(read("data.js").replace(/^window.PORTFOLIO_DATA=/,"").replace(/;\s*$/,""));
const videos=JSON.parse(read("data/videos.json")).videos;
assert.equal(data.cases.length,16);assert.equal(data.samples.length,25);assert.equal(videos.length,6);
for(const [main,leaf,lang] of [["index.html","beyond.html","en"],["ar.html","beyond-ar.html","ar"]]){
 const home=read(main),page=read(leaf);assert.ok(home.includes('href="'+leaf+'"'));
 assert.ok(page.includes('<html lang="'+lang+'"'));
 assert.ok(page.includes('href="'+main+'"'),"Return-to-CV link missing");
 assert.ok(page.includes('src="assets/work/andrew-portrait.webp"'));
 for(const id of ["studio","air","products","hse-tech","index","links"])assert.ok(page.includes('id="'+id+'"'),"section missing: "+id);
 assert.equal((page.match(/class="toc-row"/g)||[]).length,4);
 assert.equal((page.match(/class="product-entry"/g)||[]).length,2);
 assert.equal((page.match(/class="hse-entry"/g)||[]).length,2);
 for(const url of ["https://atstudioimpact.com/","https://atstudioimpact.com/air","https://rozy.atstudioimpact.com/","https://hse.atstudioimpact.com/","https://www.linkedin.com/in/andrew-tharwat"])assert.ok(page.includes(url));
 const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
 assert.ok(page.includes('noindex,nofollow,noarchive'));
 for(const forbidden of ["orbital","radio-wave","hero-art","feature studio","fake listener count","active certification"])assert.ok(!page.includes(forbidden),"Rejected/unverified content found "+forbidden);
}
assert.ok(read("folio.css").includes("@media(max-width:620px)"));
for(const asset of ["assets/work/andrew-portrait.webp","assets/videos/hse-decision-training.mp4","assets/videos/site-safety-briefing.mp4"])assert.ok(fs.existsSync(asset));
console.log("PASS: bilingual editorial content, protected HSE CV and existing published media.");
