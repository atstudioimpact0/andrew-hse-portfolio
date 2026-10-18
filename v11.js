/* Andrew V11 — categorized, publication-aware portfolio libraries. */
(()=>{"use strict";
const ar=document.documentElement.lang==="ar", data=window.PORTFOLIO_DATA||{}, samples=data.samples||[], cases=data.cases||[];
const $$=(id)=>document.getElementById(id);
const lib=$$("library-dialog"),back=$$("library-back"),exit=$$("library-close"),grid=$$("library-grid"),note=$$("library-note");
const detail=$$("detail-dialog"),dclose=$$("detail-close"), playerDlg=$$("player-dialog"),pclose=$$("player-close");
const player=$$("player-video"),pError=$$("player-error");
const names={
 videos:ar?{name:"الفيديوهات",intro:"فيديوهات تدريب وتوعية.",note:"المشاهد التوضيحية بمساعدة AI ليست تصويرًا ميدانيًا موثقًا."}:{name:"Videos",intro:"Safety training and awareness videos.",note:"AI-assisted visuals are illustrative, not verified site footage."},
 signs:ar?{name:"لافتات السلامة",intro:"لافتات ومواد توعية بالعربي والإنجليزي.",note:"تُعرض الأعمال المسموح بنشرها فقط."}:{name:"Safety Signage",intro:"Bilingual signs and safety graphics.",note:"Only authorized work is shown."},
 layouts:ar?{name:"المخططات والرسومات",intro:"رسومات فنية وتوضيحية مختارة.",note:"الرسومات المعروضة توضيحية، وليست المخططات التشغيلية الأصلية."}:{name:"Technical Layouts",intro:"Selected technical and visual drawings.",note:"Conceptual examples only. Original operational layouts are private."}
};
const terms=ar?{available:"شاهد العمل",notYet:"الملفات لسه مش مرفوعة",loading:"جاري التحقق من الملفات",empty:"المختارات المعتمدة هتظهر هنا بعد رفع الملفات واختبار عرضها.",read:"تفاصيل العمل",close:"إغلاق",watch:"شاهد الفيديو",error:"تعذّر تشغيل الفيديو",role:"نطاق المسؤولية"}:{available:"View work",notYet:"Files not uploaded yet",loading:"Checking media",empty:"Selected media will appear here after the files are uploaded and verified.",read:"Read about this work",close:"Close",watch:"Watch film",error:"Video could not be played",role:"Scope of responsibility"};
let current=null,returnFocus=null,lastDetail=null,lastPlayer=null;
const safeImage=/^assets\/(?:signage|work|layout-previews|video-posters)\/[a-zA-Z0-9._-]+\.(webp|png|jpe?g)$/i;
const safeVideo=/^assets\/videos\/[a-zA-Z0-9._-]+\.mp4$/;
const signList=[
 {i:0,path:"assets/signage/restricted-zone.webp"},
 {i:1,path:"assets/signage/storage-area.webp"},
 {i:2,path:"assets/signage/parking-area.webp"},
 {i:3,path:"assets/signage/falling-objects.webp"},
 {i:4,path:"assets/signage/drowsy-driving.webp"},
 {i:5,path:"assets/signage/heat-stress.webp"},
 {i:6,path:"assets/signage/water-conservation.webp"},
 {i:7,path:"assets/signage/world-environment-day.webp"},
 {i:21,path:"assets/work/safety-performance.webp"},
 {i:22,path:"assets/work/six-million-hours.webp"},
 {i:23,path:"assets/work/global-safety-day.webp"},
 {i:24,path:"assets/work/hsse-board.webp"}
];
const layouts=[7,8,9,10];
const pick=(x)=>ar?x[1]:x[0];
function element(tag,cl,text){const e=document.createElement(tag);if(cl)e.className=cl;if(text!=null)e.textContent=text;return e}
function cardShell(className,title,desc){
 const card=element("article","library-card "+className);
 const heading=element("h3","library-card-title",title);
 const description=element("p","library-card-desc",desc);
 card.append(heading,description);return card;
}
function makeThumb(symbol,alt){
 const wrap=element("div","library-thumb");
 const placeholder=element("span","thumb-placeholder",symbol);
 placeholder.setAttribute("aria-hidden","true");wrap.append(placeholder);
 wrap.setAttribute("aria-label",alt||"");return wrap;
}
function detailOpen(title,desc,boundary,trigger,source,examples){
 lastDetail=trigger;
 $$("detail-title").textContent=title;$$("detail-description").textContent=desc||"";$$("detail-boundary").textContent=boundary||"";
 const oldImg=$$("detail-image");if(oldImg)oldImg.remove();
 const oldList=$$("detail-examples");if(oldList)oldList.remove();
 if(source&&safeImage.test(source)){
   const img=element("img","detail-image");img.id="detail-image";img.src=source;img.alt=title;
   $$("detail-description").before(img);
 }
 if(Array.isArray(examples)&&examples.length){
   const container=element("section","detail-examples");container.id="detail-examples";
   container.append(element("h3","",ar?"نماذج الأعمال المرتبطة":"Related work examples"));
   const u=element("ul");
   examples.forEach(item=>u.append(element("li","",item)));
   container.append(u);
   $$("detail-boundary").before(container);
 }
 detail.showModal();
}
dclose?.addEventListener("click",()=>detail.close());
detail?.addEventListener("close",()=>lastDetail?.focus());
detail?.addEventListener("click",e=>{if(e.target===detail)detail.close()});
function appendAvailablePicture(card,src,title){
 if(!safeImage.test(src))return Promise.resolve(false);
 return new Promise(resolve=>{
   const image=new Image();image.decoding="async";image.alt=title;
   image.onload=()=>{
     if(!image.naturalWidth){resolve(false);return}
     const frame=makeThumb("",title);frame.replaceChildren(image);
     card.prepend(frame);
     const button=element("button","open-action",terms.available+" ↗");
     button.type="button";button.addEventListener("click",()=>detailOpen(title,"",names.signs.note,button,src));
     card.append(button);
     resolve(true);
   };
   image.onerror=()=>resolve(false);
   image.src=src;
 });
}
async function showSigns(){
 const items=signList.filter(x=>samples[x.i]);
 const present=await Promise.all(items.map(async item=>{
   const s=samples[item.i];const title=pick(s),c=cardShell("sign-tile",title,"");
   const found=await appendAvailablePicture(c,item.path,title);
   return found?c:null;
 }));
 if(current!=="signs")return;
 const available=present.filter(Boolean);
 if(!available.length){
   const empty=element("div","library-empty",terms.empty);grid.append(empty);
 }else available.forEach(x=>grid.append(x));
 note.textContent=names.signs.note;
}
function showLayouts(){
 const projects=[
  {i:7,slug:"traffic-layout",samples:[8,13,14,15]},
  {i:8,slug:"evacuation-layout",samples:[9,10,11,12]},
  {i:9,slug:"medical-route",samples:[16,17]},
  {i:10,slug:"lifting-sketch",samples:[18,19,20]}
 ];
 projects.forEach((entry)=>{
   const c=cases[entry.i];if(!c)return;
   const title=pick(c),desc=ar?c[5]:c[4],scope=ar?c[7]:c[6];
   const examples=entry.samples.map(i=>samples[i]).filter(Boolean).map(x=>pick(x));
   const article=cardShell("layout-tile",title,desc);
   const thumb=makeThumb("",title);
   const fallback=document.createElement("img");
   fallback.alt=ar?"رسم توضيحي عام، ليس مخطط الموقع الأصلي":"Conceptual illustration, not the original site drawing";
   fallback.loading="lazy";fallback.decoding="async";
   fallback.src="assets/layout-previews/"+entry.slug+".svg";
   thumb.replaceChildren(fallback);
   let publishedSource=null;
   const caption=element("p","layout-caption",ar?"تصور توضيحي — مش المخطط الأصلي":"Conceptual illustration — not an original plan");
   const listCount=element("p","layout-example-count",ar?examples.length+" نماذج مرتبطة بنفس المجال":examples.length+" related work examples");
   // Optional OWNER-SANITIZED WebP replaces the schematic only when it actually loads.
   const preview="assets/layout-previews/"+entry.slug+".webp";
   if(safeImage.test(preview)){
     const img=new Image();img.alt=title;img.decoding="async";
     img.onload=()=>{
       if(img.naturalWidth>0){
         publishedSource=preview;
         thumb.replaceChildren(img);
         caption.textContent=ar?"نسخة عرض مختارة":"Portfolio preview";
       }
     };
     img.src=preview;
   }
   const btn=element("button","open-action",terms.read+" ↗");btn.type="button";
   btn.addEventListener("click",()=>detailOpen(title,desc,scope,btn,publishedSource,examples));
   article.prepend(thumb);
   article.append(caption,listCount,btn);
   grid.append(article);
 });
 note.textContent=names.layouts.note;
}
function stop(){
 if(!player)return;
 player.pause();player.removeAttribute("src");player.removeAttribute("poster");player.load();
}
function playerOpen(v,trigger){
 lastPlayer=trigger;
 $$("player-title").textContent=ar?v.title_ar||v.title_en:v.title_en||v.title_ar;
 $$("player-description").textContent=ar?v.description_ar||"":v.description_en||"";
 pError.textContent="";
 player.src=v.src;
 if(v.poster&&safeImage.test(v.poster))player.poster=v.poster;else player.removeAttribute("poster");
 playerDlg.showModal();const p=player.play();if(p&&p.catch)p.catch(()=>{});
}
pclose?.addEventListener("click",()=>playerDlg.close());
playerDlg?.addEventListener("close",()=>{stop();lastPlayer?.focus()});
playerDlg?.addEventListener("click",e=>{if(e.target===playerDlg)playerDlg.close()});
player?.addEventListener("error",()=>{if(playerDlg?.open)pError.textContent=terms.error});
async function showVideos(){
 let manifest;
 try{const response=await fetch("data/videos.json",{cache:"no-store"});if(!response.ok)throw Error("manifest unavailable");manifest=await response.json()}catch{if(current==="videos")grid.append(element("p","library-empty",terms.empty));return}
 const records=Array.isArray(manifest.videos)?manifest.videos.filter(v=>v&&typeof v.src==="string"&&safeVideo.test(v.src)&&!v.src.includes("..")):[];
 const resolved=await Promise.all(records.map(async v=>{
   try{const response=await fetch(v.src,{method:"HEAD",cache:"no-store"});return response.ok?v:null}catch{return null}
 }));
 if(current!=="videos")return;
 const ready=resolved.filter(Boolean);
 if(!ready.length){
   grid.append(element("p","library-empty",terms.empty));
   note.textContent=names.videos.note;
   return;
 }
 ready.forEach(v=>{
   const title=ar?v.title_ar||v.title_en:v.title_en||v.title_ar;
   const desc=ar?v.description_ar||"":v.description_en||"";
   const card=cardShell("video-tile",title,desc);
   const thumb=makeThumb("▶",title);
   if(v.poster&&safeImage.test(v.poster)){
     const img=new Image();img.alt="";img.loading="lazy";img.decoding="async";
     img.onerror=()=>img.remove();img.src=v.poster;thumb.append(img);
   }
   const b=element("button","open-action",terms.watch+" ↗");b.type="button";
   b.addEventListener("click",()=>playerOpen(v,b));
   card.prepend(thumb);card.append(b);grid.append(card);
 });
 note.textContent=names.videos.note;
}
function openLibrary(type,from){
 if(!names[type]||!lib)return;
 if(lib.open&&current!==type)lib.close();
 current=type;returnFocus=from||returnFocus;
 const cfg=names[type];
 $$("library-kicker").textContent=ar?"مجموعة أعمال مختارة":"Personal selection";
 $$("library-title").textContent=cfg.name;$$("library-description").textContent=cfg.intro;
 grid.replaceChildren();note.textContent="";
 lib.showModal();
 grid.append(element("p","loading-note",terms.loading+"…"));
 grid.replaceChildren();
 if(type==="layouts")showLayouts();
 else if(type==="signs")showSigns();
 else if(type==="videos")showVideos();
}
function closeLibrary(){
 if(lib?.open){if(detail?.open)detail.close();if(playerDlg?.open)playerDlg.close();lib.close()}
 current=null;
 if(["#videos","#signs","#layouts"].includes(location.hash))history.replaceState(null,"",location.pathname+location.search+"#collections");
}
exit?.addEventListener("click",closeLibrary);
back?.addEventListener("click",closeLibrary);
lib?.addEventListener("click",e=>{if(e.target===lib)closeLibrary()});
lib?.addEventListener("close",()=>{const previous=current;const target=returnFocus;current=null;if(previous&&location.hash==="#"+previous)history.replaceState(null,"",location.pathname+location.search+"#collections");if(target?.isConnected)target.focus()});
document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>{
 const type=button.getAttribute("data-open");
 history.pushState(null,"",location.pathname+location.search+"#"+type);
 openLibrary(type,button);
}));
function route(){
 const key=location.hash.slice(1);
 if(names[key]){const trigger=document.querySelector('[data-open="'+key+'"]');if(!lib.open||current!==key)openLibrary(key,trigger)}
 else if(lib?.open)closeLibrary();
}
addEventListener("hashchange",route);
addEventListener("popstate",route);
if(names[location.hash.slice(1)])route();
})();