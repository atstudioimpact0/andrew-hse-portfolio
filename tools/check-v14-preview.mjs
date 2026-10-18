// Andrew V14 Preview — automated safe-release QA; no external dependencies.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const read=(p)=>fs.readFileSync(path.join(process.cwd(),p),"utf8");
const data=JSON.parse(read("data.js").replace(/^window.PORTFOLIO_DATA=/,"").replace(/;\s*$/,""));
const films=JSON.parse(read("data/videos.json")).videos;
assert.equal(data.cases.length,16,"Original 16 professional areas remain present");
assert.equal(data.samples.length,25,"Original 25 sample labels remain present");
assert.equal(films.length,6,"All six approved video registrations remain present");
const expectedCases=[0,1,2,3,15,4,5,6,7,8,9,10,11,12,13,14];
assert.equal(new Set(expectedCases).size,16);
const assignedSamples={
 7:[8,13,14,15],
 8:[9,10,11,12],
 9:[16,17],
 10:[18,19,20],
 11:[0,1,2,3,4,5,6],
 12:[7,21,22,23,24]
};
const allSamples=Object.values(assignedSamples).flat();
assert.equal(allSamples.length,25);
assert.equal(new Set(allSamples).size,25,"Each example appears only once");
const workIndex=read("v12-work.js");
for(const n of expectedCases){
 assert.match(workIndex,new RegExp("(?:[^0-9]|^)"+n+"(?:[^0-9]|$)"),"Case index missing "+n);
}
for(const k of ["index.html","ar.html"]){
 const text=read(k);
 assert.match(text,/<html lang="(?:en|ar)" dir="(?:ltr|rtl)">/);
 for(const resource of ['src="data.js"','src="v11.js"','src="v12-work.js"','href="v14.css"','id="full-work-list"','id="library-dialog"','id="library-grid"','id="library-back"','id="library-close"','id="detail-dialog"','id="player-dialog"','id="player-video"','id="collections"','id="experience"','id="contact"','name="robots" content="noindex,nofollow,noarchive"']){
   assert.ok(text.includes(resource),k+" missing "+resource);
 }
 for(const key of ["videos","signs","layouts"]){
   assert.ok(text.includes('data-open="'+key+'"'),k+" missing "+key);
 }
 assert.equal((text.match(/data-open="/g)||[]).length,3);
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,k+" has duplicate IDs");
 const targets=[...text.matchAll(/href="#([a-z][a-z0-9-]*)"/g)].map(m=>m[1]);
 for(const target of targets)assert.ok(ids.includes(target),"Broken anchor "+target+" in "+k);
 assert.ok(text.indexOf('id="collections"')<text.indexOf('id="experience"'));
 assert.ok(text.includes("andrew-portrait.webp"));
 assert.ok(text.includes('id="career"'),"Career timeline missing");
 assert.ok(text.includes('class="timeline-item"'),"CV role records missing");
 assert.ok(!text.includes('class="preview-strip"'),"Production page still includes the preview strip");
 assert.ok(!text.includes("معاينة التصميم")&&!text.includes("DESIGN PREVIEW"),"Stale preview banner visible");
 assert.ok(!text.includes("Live site ↗")&&!text.includes("الموقع الحالي ↗"),"Stale return-to-live link visible");
 assert.ok(!/Safety,|made human\.|الشغل اللي|السلامة تبدأ|A record of my work/.test(text),"Old marketing-heavy headings remain");
 assert.ok(!text.includes("data-open=\"archive\""));
}
const v11=read("v11.js");
assert.ok(!v11.includes('"#work"'),"Old dead library close link");
assert.ok(v11.includes('"#collections"'),"Collection close should return to correct anchor");
for(const asset of ["assets/work/andrew-portrait.webp","assets/signage/restricted-zone.webp","assets/videos/hse-decision-training.mp4","assets/videos/site-safety-briefing.mp4","assets/layout-previews/traffic-layout.svg","assets/layout-previews/evacuation-layout.svg","assets/layout-previews/medical-route.svg","assets/layout-previews/lifting-sketch.svg"]){
 assert.ok(fs.existsSync(path.join(process.cwd(),asset)),"Missing original or safe media asset: "+asset);
}
for(const name of ["traffic-layout","evacuation-layout","medical-route","lifting-sketch"]){
 const svg=read("assets/layout-previews/"+name+".svg");
 assert.ok(svg.includes("CONCEPTUAL PREVIEW")&&svg.includes("NOT A SITE DRAWING"),"Disclosure missing: "+name);
}
const style=read("v14.css");
for(const selector of [".hero-main",".site-header",".door-title",".scope-groups",".library-dialog",".library-thumb",".work-line",".career-section",".contact"]){
 assert.ok(style.includes(selector),"Missing key V14 selector "+selector);
}
assert.ok(style.includes("max-width:720px"),"Mobile breakpoint missing");
assert.ok(style.includes("prefers-reduced-motion"),"Reduced motion missing");
const published=films.filter(f=>fs.existsSync(path.join(process.cwd(),f.src)));
const unpublished=films.filter(f=>!fs.existsSync(path.join(process.cwd(),f.src)));
assert.equal(published.length,2,"Exactly the original two MP4 files uploaded");
assert.equal(unpublished.length,4,"Four later MP4 files are not published");
console.log(JSON.stringify({result:"PASS",version:"V14 preview ONLY",cases:data.cases.length,samples:data.samples.length,filmsRegistered:films.length,filmsPlayableOnDeploy:published.length,filmsUnpublished:unpublished.length,conceptualLayoutPreviews:4,liveBranchUntouched:true},null,2));
