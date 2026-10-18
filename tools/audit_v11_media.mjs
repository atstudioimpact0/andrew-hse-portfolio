// V11 asset audit: no external dependencies; normal mode warns, --strict fails on missing media.
import fs from "node:fs";
import path from "node:path";
const cwd=process.cwd();
const requiredSigns=[
"assets/signage/restricted-zone.webp","assets/signage/storage-area.webp",
"assets/signage/parking-area.webp","assets/signage/falling-objects.webp",
"assets/signage/drowsy-driving.webp","assets/signage/heat-stress.webp",
"assets/signage/water-conservation.webp","assets/signage/world-environment-day.webp",
"assets/work/safety-performance.webp","assets/work/six-million-hours.webp",
"assets/work/global-safety-day.webp","assets/work/hsse-board.webp"
];
const portrait="assets/work/andrew-portrait.webp";
const data=JSON.parse(fs.readFileSync(path.join(cwd,"data/videos.json"),"utf8"));
const videoPaths=(data.videos||[]).map(x=>x.src);
const unsafe=/^\/|\.{2}|[\\]|(?:original-layouts|traffic-pk04|medical-route|lifting-data|evacuation-route)/i;
for(const p of [...requiredSigns,portrait,...videoPaths]){
  if(typeof p!=="string"||unsafe.test(p))throw Error("Blocked unsafe asset path: "+p);
}
const all=[...requiredSigns,portrait,...videoPaths];
const actual=all.filter(p=>fs.existsSync(path.join(cwd,p)));
const missing=all.filter(p=>!fs.existsSync(path.join(cwd,p)));
const conceptualLayoutPreviews=[
 "assets/layout-previews/traffic-layout.svg",
 "assets/layout-previews/evacuation-layout.svg",
 "assets/layout-previews/medical-route.svg",
 "assets/layout-previews/lifting-sketch.svg"
];
for(const rel of conceptualLayoutPreviews){
 const full=path.join(cwd,rel);
 if(!fs.existsSync(full))throw Error("Missing safe conceptual layout preview: "+rel);
 const svg=fs.readFileSync(full,"utf8");
 if(!svg.includes("<svg")||!svg.includes("NOT A SITE DRAWING")){
   throw Error("Concept-only preview missing disclosure: "+rel);
 }
}
const layoutScript=fs.readFileSync(path.join(cwd,"v11.js"),"utf8");
for(const slug of ["traffic-layout","evacuation-layout","medical-route","lifting-sketch"]){
 if(!layoutScript.includes(slug))throw Error("Missing gallery map for "+slug);
}
const htmls=["index.html","ar.html"];
for(const p of htmls){
 const page=fs.readFileSync(path.join(cwd,p),"utf8");
 for(const id of ["library-dialog","library-grid","player-dialog","detail-dialog"]){
  if(!page.includes('id="'+id+'"'))throw Error("Missing library UI "+id+" in "+p);
 }
 if(!page.includes('src="v11.js"'))throw Error("Wrong JS entrypoint in "+p);
}
const result={
 version:"V11",sources:all.length,ready:actual.length,missing:missing.length,
 signs:requiredSigns.filter(p=>actual.includes(p)).length,
 portrait:actual.includes(portrait),
 videoCount:videoPaths.length,videoReady:videoPaths.filter(p=>actual.includes(p)).length,
 filesMissing:missing
};
result.conceptualLayoutPreviews=conceptualLayoutPreviews.length;
console.log(JSON.stringify(result,null,2));
if(missing.length)console.warn("Media not fully uploaded; missing media is intentionally hidden on the public site.");
if(process.argv.includes("--strict")&&missing.length)process.exitCode=2;
