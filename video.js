(()=>{"use strict";
const root=document.getElementById("video-library");
if(!root)return;
const ar=document.documentElement.lang==="ar";
const grid=document.getElementById("video-grid");
const modal=document.getElementById("video-dialog");
const player=document.getElementById("video-player");
const close=document.getElementById("video-close");
const heading=document.getElementById("video-title");
const summary=document.getElementById("video-summary");
const error=document.getElementById("video-error");
const safeVideo=/^assets\/videos\/[a-zA-Z0-9._-]+\.mp4$/;
const safePoster=/^assets\/video-posters\/[a-zA-Z0-9._-]+\.(?:webp|jpe?g|png)$/;
let lastTrigger=null;
const words=ar?{watch:"شاهد الفيديو",error:"تعذر تشغيل الفيديو. يُرجى تجربة صفحة المصدر.",type:"عمل مرئي",heading:"فيديوهات مختارة"}:
{watch:"WATCH VIDEO",error:"The media could not be played. Please use the source-page link.",type:"Video work",heading:"Selected video work"};
function stop(){try{player.pause()}catch{}player.removeAttribute("src");player.removeAttribute("poster");player.load()}
close.addEventListener("click",()=>modal.close());
modal.addEventListener("close",()=>{stop();lastTrigger?.focus()});
modal.addEventListener("click",e=>{if(e.target===modal)modal.close()});
player.addEventListener("error",()=>{if(modal.open)error.textContent=words.error});
function isSafe(name,re){return typeof name==="string"&&re.test(name)&&!name.includes("..")}
function show(item,from){lastTrigger=from;heading.textContent=item["title_"+(ar?"ar":"en")]||item.title_en||"HSE Video";summary.textContent=item["description_"+(ar?"ar":"en")]||item.description_en||"";error.textContent="";
player.src=item.src;if(isSafe(item.poster,safePoster))player.poster=item.poster;modal.showModal();
const play=player.play();if(play&&play.catch)play.catch(()=>{});
}
fetch("data/videos.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Missing media manifest");return r.json()}).then(async data=>{
const planned=(Array.isArray(data.videos)?data.videos:[]).filter(v=>v&&isSafe(v.src,safeVideo));
const verified=await Promise.all(planned.map(async v=>{
 try{const response=await fetch(v.src,{method:"HEAD",cache:"no-store"});return response.ok?v:null}catch{return null}
}));
const records=verified.filter(Boolean);
if(!records.length){root.hidden=true;return}
root.hidden=false;
records.forEach(v=>{
const card=document.createElement("article");card.className="video-card";
const art=document.createElement("div");art.className="video-card-art";
if(isSafe(v.poster,safePoster)){const img=document.createElement("img");img.src=v.poster;img.alt="";img.loading="lazy";img.decoding="async";art.append(img)}
const play=document.createElement("button");play.className="video-art-play";play.type="button";play.textContent="▶";
play.setAttribute("aria-label",words.watch+": "+(v["title_"+(ar?"ar":"en")]||v.title_en||words.type));
play.addEventListener("click",()=>show(v,play));art.append(play);
const body=document.createElement("div");body.className="video-card-content";
const h=document.createElement("h3");h.textContent=v["title_"+(ar?"ar":"en")]||v.title_en||words.type;
const p=document.createElement("p");p.textContent=v["description_"+(ar?"ar":"en")]||v.description_en||"";
const b=document.createElement("button");b.type="button";b.textContent=words.watch+" ↗";b.addEventListener("click",()=>show(v,b));
body.append(h,p,b);card.append(art,body);grid.append(card);
});
}).catch(()=>{root.hidden=true});
})();