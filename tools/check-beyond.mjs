import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const data=JSON.parse(read("data.js").replace(/^window.PORTFOLIO_DATA=/,"").replace(/;\s*$/,""));
assert.equal(data.cases.length,16);
assert.equal(data.samples.length,25);
for(const [main,beyond,lang] of [["index.html","beyond.html","en"],["ar.html","beyond-ar.html","ar"]]){
 const mainText=read(main),page=read(beyond);
 assert.ok(mainText.includes('href="'+beyond+'"'),"Portal entry not linked from "+main);
 assert.ok(page.includes('lang="'+lang+'"'));
 for(const id of ["roles","products","hse-tech","links"])assert.ok(page.includes('id="'+id+'"'),"Missing section "+id);
 for(const u of ["https://atstudioimpact.com/","https://atstudioimpact.com/air","https://hse.atstudioimpact.com/","https://www.linkedin.com/in/andrew-tharwat"])assert.ok(page.includes(u),"Missing link "+u);
 assert.ok(page.includes('class="role-grid"')&&page.includes('class="lab-grid"'));
 assert.ok(page.includes('name="robots" content="noindex,nofollow,noarchive"'));
 assert.ok(!page.includes("24/7 live broadcast")&&!page.includes("fully deployed")&&!page.includes("certified training"));
}
for(const asset of ["assets/work/andrew-portrait.webp","assets/videos/hse-decision-training.mp4","assets/videos/site-safety-briefing.mp4"])assert.ok(fs.existsSync(asset));
console.log("PASS Beyond HSE bilingual preview structure, links, preservation and claims.");
