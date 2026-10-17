(() => {
"use strict";
const data=window.PORTFOLIO_DATA;if(!data)return;
const ar=document.documentElement.lang==="ar",u=data.ui[ar?"ar":"en"];
const $=id=>document.getElementById(id);
const statusAr={"Implemented":"منفذ فعليًا","Operational responsibility":"مسؤولية تشغيلية","Technical visualization":"تصور فني","Technical drafting":"رسم فني","Visual communication":"اتصال بصري","Visual reporting":"تقارير مرئية","Training media":"إنتاج تدريبي","Experimental pilot":"نموذج تجريبي"};
const typeNames=ar?["الكل","لافتات وتوعية","مخططات الموقع","الطوارئ","رسومات الرفع","الفعاليات"]:["All","Signage","Site layouts","Emergency","Lifting sketches","Events"];
const types=["all","signage","planning","emergency","lifting","events"];
const caseTypes=["all","digital","compliance","planning","creative","pilot"];
document.querySelectorAll("[data-ui]").forEach(el=>{if(typeof u[el.dataset.ui]==="string")el.textContent=u[el.dataset.ui]});
document.querySelectorAll("[data-ui-html]").forEach(el=>{if(typeof u[el.dataset.uiHtml]==="string")el.innerHTML=u[el.dataset.uiHtml]});
document.querySelectorAll("[data-nav]").forEach(el=>el.textContent=u.nav[Number(el.dataset.nav)]||"");
const menu=$("menu-toggle"),nav=$("nav-links");
function setMenu(open){nav.classList.toggle("open",open);menu.setAttribute("aria-expanded",String(open))}
menu.addEventListener("click",()=>setMenu(menu.getAttribute("aria-expanded")!=="true"));
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
u.principles.forEach(([title,desc],i)=>{
const card=document.createElement("article");card.className="principle";
const n=document.createElement("span");n.className="num";n.textContent=String(i+1).padStart(2,"0");
const h=document.createElement("strong");h.textContent=title;
const p=document.createElement("p");p.textContent=desc;card.append(n,h,p);$("principles").append(card);
});
function filters(el,values,labels,current,update){
el.replaceChildren();values.forEach((key,i)=>{const b=document.createElement("button");b.type="button";b.textContent=labels[i];b.setAttribute("aria-pressed",String(key===current));b.addEventListener("click",()=>update(key));el.append(b)})}
let selectedCase="all";
const search=$("case-search");search.placeholder=u.search;search.setAttribute("aria-label",u.srchLabel);
$("case-filters").setAttribute("aria-label",u.filterLabel);
let focused=null;
const dialog=$("case-dialog");
function showCase(c,btn){
focused=btn;$("dialog-label").textContent=ar?(statusAr[c[2]]||c[2]):c[2];
$("dialog-title").textContent=ar?c[1]:c[0];$("dialog-intro").textContent=ar?c[5]:c[4];
const dl=$("dialog-details");dl.replaceChildren();
[[u.role,ar?c[7]:c[6]],[u.result,ar?c[5]:c[4]],[u.status,ar?(statusAr[c[2]]||c[2]):c[2]]].forEach(([k,v])=>{const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=k;dd.textContent=v;dl.append(dt,dd)});
dialog.showModal();
}
$("dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener("close",()=>focused?.focus());
function renderCases(){
const q=search.value.trim().toLocaleLowerCase(ar?"ar":"en");
const visible=data.cases.map((c,i)=>({c,i})).filter(({c})=>(selectedCase==="all"||selectedCase===c[3])&&(!q||[c[0],c[1],c[4],c[5],c[6],c[7]].join(" ").toLocaleLowerCase(ar?"ar":"en").includes(q)));
$("case-grid").replaceChildren();
visible.forEach(({c,i})=>{
const article=document.createElement("article");article.className="case-card";
const top=document.createElement("div");top.className="case-top";
const num=document.createElement("span");num.textContent=String(i+1).padStart(2,"0")+" / CASE";
const status=document.createElement("span");status.className="case-status";status.textContent=ar?(statusAr[c[2]]||c[2]):c[2];top.append(num,status);
const h=document.createElement("h3");h.textContent=ar?c[1]:c[0];
const p=document.createElement("p");p.textContent=ar?c[5]:c[4];
const b=document.createElement("button");b.type="button";b.textContent=u.viewCase;b.addEventListener("click",()=>showCase(c,b));
article.append(top,h,p,b);$("case-grid").append(article);
});
$("no-cases").hidden=visible.length>0;$("no-cases").textContent=u.noresults;
$("result-count").textContent=ar?"عرض "+visible.length+" من "+data.cases.length+" عملًا":visible.length+" of "+data.cases.length+" case studies";
}
function updateCases(key){selectedCase=key;filters($("case-filters"),caseTypes,u.categories,selectedCase,updateCases);renderCases()}
updateCases("all");search.addEventListener("input",renderCases);
let selectedSample="all";
function renderSamples(){
$("samples-grid").replaceChildren();
data.samples.forEach((s,i)=>{
if(selectedSample!=="all"&&s[2]!==selectedSample)return;
const article=document.createElement("article");article.className="sample";
const label=document.createElement("span");label.className="sample-mark";label.textContent=String(i+1).padStart(2,"0")+" / "+s[2].toUpperCase();
const h=document.createElement("h3");h.textContent=ar?s[1]:s[0];
const p=document.createElement("small");p.textContent=u.pendingGallery;article.append(label,h,p);$("samples-grid").append(article);
});
}
function updateSamples(key){selectedSample=key;filters($("sample-filters"),types,typeNames,selectedSample,updateSamples);renderSamples()}
updateSamples("all");
[[u.planned,u.timeline1,u.timeline1d],[u.dates2,u.timeline2,u.timeline2d],[u.dates3,u.timeline3,u.timeline3d]].forEach(([date,title,desc])=>{
const card=document.createElement("article");card.className="experience-item";
const t=document.createElement("time");t.textContent=date;const h=document.createElement("h3");h.textContent=title;
const p=document.createElement("p");p.textContent=desc;card.append(t,h,p);$("experience-list").append(card);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")setMenu(false)});
})();