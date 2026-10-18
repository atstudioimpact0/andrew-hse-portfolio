/* Andrew V11 — categorized, publication-aware portfolio libraries. */
(()=>{"use strict";
const ar=document.documentElement.lang==="ar", data=window.PORTFOLIO_DATA||{}, samples=data.samples||[], cases=data.cases||[];
const $$=(id)=>document.getElementById(id);
const lib=$$("library-dialog"),back=$$("library-back"),exit=$$("library-close"),grid=$$("library-grid"),note=$$("library-note");
const detail=$$("detail-dialog"),dclose=$$("detail-close"), playerDlg=$$("player-dialog"),pclose=$$("player-close");
const player=$$("player-video"),pError=$$("player-error");
const names={
 videos:ar?{name:"الفيديوهات",intro:"أعمال مرئية وتوعوية مختارة. كل فيديو بيظهر هنا فقط بعد وجود ملف تشغيل فعلي.",note:"المقاطع التوضيحية أو المصنوعة بمساعدة AI لا تُقدَّم باعتبارها تصويرًا ميدانيًا أصليًا."}:{name:"Films & video",intro:"Selected films and safety learning materials. A film appears only after its actual playable file has been uploaded.",note:"Illustrative or AI-assisted footage is not presented as independently verified documentary site footage."},
 signs:ar?{name:"لافتات السلامة",intro:"تصميمات توعوية ولافتات عربي وإنجليزي، مجمعة في مكان واحد بعيدًا عن الصفحة الرئيسية.",note:"الأعمال المختارة للتقديم الشخصي؛ استخدام العلامات التجارية أو صور المشروع يخضع لتصريح النشر."}:{name:"Safety signs",intro:"Selected bilingual safety graphics, posters and awareness designs, all kept in one quiet gallery.",note:"Project marks or identifiable site imagery require publication permission."},
 layouts:ar?{name:"المخططات والرسومات",intro:"مساهمات في رسم وتحديث مخططات ميدانية وتصورات فنية، مع الفصل بين التصميم والتصديق الهندسي.",note:"المسارات التشغيلية ومعلومات الطوارئ التفصيلية مش معروضة بشكل عام. المعروض هنا وصف آمن لنطاق العمل."}:{name:"Layouts & drawings",intro:"Planning diagrams and technical visuals I contributed to, with design support kept distinct from engineering approval.",note:"Operational routes, emergency details and original engineering plans are not publicly published. The gallery includes safe descriptions only."}
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
function detailOpen(title,desc,boundary,trigger,source){
 lastDetail=trigger;
 $$("detail-title").textContent=title;$$("detail-description").textContent=desc||"";$$("detail-boundary").textContent=boundary||"";
 let img=$$("detail-image");if(img)img.remove();
 if(source&&safeImage.test(source)){
   img=element("img","detail-image");img.id="detail-image";img.src=source;img.alt=title;
   $$("detail-description").before(img);
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
 layouts.forEach((i,pos)=>{
   const c=cases[i];if(!c)return;
   const title=pick(c);const desc=ar?c[5]:c[4],scope=ar?c[7]:c[6];
   const article=cardShell("layout-tile",title,desc);
   const thumb=makeThumb(String(pos+1).padStart(2,"0"),title);
   article.prepend(thumb);
   const btn=element("button","open-action",terms.read+" ↗");btn.type="button";
   btn.addEventListener("click",()=>detailOpen(title,desc,scope,btn));
   article.append(btn);grid.append(article);
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
 if(["#videos","#signs","#layouts"].includes(location.hash))history.replaceState(null,"",location.pathname+location.search+"#work");
}
exit?.addEventListener("click",closeLibrary);
back?.addEventListener("click",closeLibrary);
lib?.addEventListener("click",e=>{if(e.target===lib)closeLibrary()});
lib?.addEventListener("close",()=>{const target=returnFocus;current=null;if(target?.isConnected)target.focus()});
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