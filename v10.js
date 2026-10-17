/* Andrew personal portfolio — V10, bilingual and progressively enhanced. */
(()=>{"use strict";
const DATA=window.PORTFOLIO_DATA||{}, cases=Array.isArray(DATA.cases)?DATA.cases:[];
const ar=document.documentElement.lang==="ar";
const ui=ar?{
  open:"افتح تفاصيل العمل",safety:"السلامة المهنية",archive:"عرض بقية الأعمال",closeArchive:"إخفاء بقية الأعمال",examples:"بعض تفاصيل المواقع غير معروضة حفاظًا على الخصوصية وسرية معلومات التشغيل.",scope:"نطاق العمل",role:"حدود المسؤولية",close:"إغلاق",play:"شاهد الفيديو",missing:"مختارات الفيديو قيد التجهيز للنشر. ستظهر هنا بعد اعتماد الملفات ورفعها واختبار تشغيلها.",noMedia:"لا توجد فيديوهات جاهزة للعرض الآن.",videoError:"تعذّر تشغيل الملف. يرجى المحاولة لاحقًا.",types:{digital:"حلول رقمية",compliance:"متابعة وتوثيق",planning:"تواصل تقني",creative:"تواصل بصري",pilot:"نموذج تجريبي"}
}:{
  open:"Explore the work",safety:"Safety & systems",archive:"View the other work",closeArchive:"Hide the other work",examples:"Sensitive site layouts and operational records are intentionally not published.",scope:"What I worked on",role:"Scope & responsibility",close:"Close",play:"Watch film",missing:"Selected films are being prepared. Approved files will appear here after upload and playback verification.",noMedia:"No videos are currently ready to show.",videoError:"This video could not be played. Please try again later.",types:{digital:"Digital tools",compliance:"Documentation",planning:"Technical visuals",creative:"Visual communication",pilot:"Pilot"}
};
const pick=(it)=>ar?it[1]:it[0], t=(s)=>document.createTextNode(s||"");
const workIds=[0,4,5,7,11,14];
const work=document.getElementById("selected-work");
const archive=document.getElementById("archive-list");
const archivePanel=document.getElementById("archive-panel");
const archiveToggle=document.getElementById("archive-toggle");
const caseModal=document.getElementById("case-modal");
let focusReturn=null;
function caseDetails(index,trigger){
  const c=cases[index];if(!c||!caseModal)return;
  focusReturn=trigger||null;
  document.getElementById("case-type").textContent=ui.types[c[3]]||ui.safety;
  document.getElementById("case-title").textContent=pick(c);
  document.getElementById("case-intro").textContent=ar?c[5]:c[4];
  document.getElementById("case-role").textContent=ar?c[7]:c[6];
  caseModal.showModal();
}
const typeLabel=(c)=>ui.types[c[3]]||ui.safety;
workIds.forEach((index,pos)=>{
  if(!work||!cases[index])return;
  const c=cases[index];
  const button=document.createElement("button");
  button.type="button";button.className="work-item";
  button.setAttribute("aria-label",ui.open+": "+pick(c));
  const num=document.createElement("span");num.className="work-number";num.textContent=String(pos+1).padStart(2,"0");
  const block=document.createElement("span");block.className="work-item-content";
  const type=document.createElement("span");type.className="category";type.textContent=typeLabel(c);
  const name=document.createElement("h3");name.textContent=pick(c);
  const desc=document.createElement("p");desc.textContent=ar?c[5]:c[4];
  const arrow=document.createElement("span");arrow.className="arrow";arrow.textContent="↗";arrow.setAttribute("aria-hidden","true");
  block.append(type,name,desc);button.append(num,block,arrow);button.addEventListener("click",()=>caseDetails(index,button));work.append(button);
});
cases.forEach((c,index)=>{
  if(!archive||workIds.includes(index))return;
  const button=document.createElement("button");button.className="archive-entry";button.type="button";
  const text=document.createElement("span");text.textContent=pick(c);text.style.color="inherit";text.style.fontSize="inherit";
  const arrow=document.createElement("span");arrow.textContent="↗";arrow.setAttribute("aria-hidden","true");
  button.append(text,arrow);button.addEventListener("click",()=>caseDetails(index,button));archive.append(button);
});
archiveToggle?.addEventListener("click",()=>{
  const opening=archivePanel.hasAttribute("hidden");
  if(opening)archivePanel.removeAttribute("hidden");else archivePanel.setAttribute("hidden","");
  archiveToggle.setAttribute("aria-expanded",String(opening));
  archiveToggle.textContent=opening?ui.closeArchive+" −":ui.archive+" +";
});
const caseClose=document.getElementById("case-close");
caseClose?.addEventListener("click",()=>caseModal.close());
caseModal?.addEventListener("click",event=>{if(event.target===caseModal)caseModal.close()});
caseModal?.addEventListener("close",()=>focusReturn?.focus());
const menu=document.getElementById("main-menu"),menuToggle=document.getElementById("mobile-toggle");
menuToggle?.addEventListener("click",()=>{const open=menu?.classList.toggle("is-open")||false;menuToggle.setAttribute("aria-expanded",String(open));menuToggle.textContent=open?"×":"☰"});
menu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu.classList.remove("is-open");menuToggle?.setAttribute("aria-expanded","false");if(menuToggle)menuToggle.textContent="☰"}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu?.classList.contains("is-open")){menu.classList.remove("is-open");menuToggle?.setAttribute("aria-expanded","false");menuToggle?.focus()}});
const portrait=document.querySelector(".portrait-panel");
if(portrait){
  const img=new Image();
  img.alt=ar?"صورة شخصية لأندرو ثروت":"Portrait of Andrew Tharwat";
  img.loading="lazy";img.decoding="async";
  img.onload=()=>{if(img.naturalWidth>0){portrait.prepend(img);portrait.classList.add("has-image")}};
  img.src="assets/work/andrew-portrait.webp";
}
const videoSection=document.getElementById("films");
const videoGrid=document.getElementById("films-ready");
const empty=document.getElementById("films-empty");
const filmModal=document.getElementById("film-modal");
const player=document.getElementById("film-player");
const filmTitle=document.getElementById("film-title");
const filmDescription=document.getElementById("film-description");
const filmError=document.getElementById("video-error");
const filmClose=document.getElementById("film-close");
const safeVideo=/^assets\/videos\/[A-Za-z0-9._-]+\.mp4$/;
const safePoster=/^assets\/video-posters\/[A-Za-z0-9._-]+\.(?:webp|png|jpe?g)$/;
let filmTrigger=null;
function openVideo(v,trigger){
  if(!filmModal||!player)return;filmTrigger=trigger;
  filmTitle.textContent=v[ar?"title_ar":"title_en"]||"Selected work";
  filmDescription.textContent=v[ar?"description_ar":"description_en"]||"";
  filmError.textContent="";
  player.src=v.src;
  if(typeof v.poster==="string"&&safePoster.test(v.poster))player.poster=v.poster;else player.removeAttribute("poster");
  filmModal.showModal();player.play().catch(()=>{});
}
function closeVideo(){
  if(!player)return;player.pause();player.removeAttribute("src");player.removeAttribute("poster");player.load();
}
filmClose?.addEventListener("click",()=>filmModal?.close());
filmModal?.addEventListener("click",e=>{if(e.target===filmModal)filmModal.close()});
filmModal?.addEventListener("close",()=>{closeVideo();filmTrigger?.focus()});
player?.addEventListener("error",()=>{if(filmModal?.open)filmError.textContent=ui.videoError});
function makeFilm(v,i){
  const card=document.createElement("article");card.className="film-card"+(i>2?" compact":"");
  const art=document.createElement("div");art.className="film-image";
  if(v.poster&&safePoster.test(v.poster)){
    const img=document.createElement("img");img.alt="";img.loading="lazy";img.decoding="async";
    img.onerror=()=>img.remove();img.src=v.poster;art.append(img);
  }
  const play=document.createElement("button");play.type="button";play.className="film-play";play.textContent="▶";
  play.setAttribute("aria-label",ui.play+": "+(v[ar?"title_ar":"title_en"]||""));
  play.addEventListener("click",()=>openVideo(v,play));art.append(play);
  const copy=document.createElement("div");copy.className="film-copy";
  const h=document.createElement("h3");h.textContent=v[ar?"title_ar":"title_en"]||"Selected film";
  const p=document.createElement("p");p.textContent=v[ar?"category_ar":"category_en"]||ui.safety;
  copy.append(h,p);card.append(art,copy);return card;
}
async function loadFilms(){
  if(!videoSection||!videoGrid||!empty)return;
  let available=[];
  try{
    const response=await fetch("data/videos.json",{cache:"no-store"});
    if(!response.ok)throw Error("manifest");
    const manifest=await response.json();
    const entries=Array.isArray(manifest.videos)?manifest.videos.filter(v=>v&&typeof v.src==="string"&&safeVideo.test(v.src)&&!v.src.includes("..")):[];
    const confirmed=await Promise.all(entries.map(async v=>{
      try{const response=await fetch(v.src,{method:"HEAD",cache:"no-store"});return response.ok?v:null}catch{return null}
    }));
    available=confirmed.filter(Boolean);
  }catch{}
  if(!available.length){videoGrid.hidden=true;empty.hidden=false;return}
  empty.hidden=true;videoGrid.hidden=false;
  const first=available.slice(0,3),rest=available.slice(3);
  first.forEach((v,i)=>videoGrid.append(makeFilm(v,i)));
  if(rest.length){
    const more=document.createElement("div");more.className="films-rest";
    rest.forEach((v,i)=>more.append(makeFilm(v,i+3)));
    videoGrid.insertAdjacentElement("afterend",more);
  }
}
loadFilms();
})();