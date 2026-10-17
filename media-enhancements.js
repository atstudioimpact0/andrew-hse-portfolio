(()=>{"use strict";
const safeSamples={
0:"assets/signage/restricted-zone.webp",
1:"assets/signage/storage-area.webp",
2:"assets/signage/parking-area.webp",
3:"assets/signage/falling-objects.webp",
4:"assets/signage/drowsy-driving.webp",
5:"assets/signage/heat-stress.webp",
6:"assets/signage/water-conservation.webp",
7:"assets/signage/world-environment-day.webp",
21:"assets/work/safety-performance.webp",
22:"assets/work/six-million-hours.webp",
23:"assets/work/global-safety-day.webp",
24:"assets/work/hsse-board.webp"
};
function decorateGallery(){
 const list=document.querySelectorAll("#samples-grid .sample");
 list.forEach((card)=>{
  const label=card.querySelector("h3")?.textContent?.trim()||"";
  const originalIndex=(window.PORTFOLIO_DATA?.samples||[]).findIndex(item=>item[0]===label||item[1]===label);
  const src=safeSamples[originalIndex];if(!src||card.querySelector(".real-sample-image"))return;
  const img=document.createElement("img");img.src=src;img.loading="lazy";img.decoding="async";
  img.className="real-sample-image";img.alt=card.querySelector("h3")?.textContent||"HSE visual work";
  img.addEventListener("load",()=>{
    const link=document.createElement("button");link.className="real-sample-open";
    link.type="button";link.setAttribute("aria-label",img.alt);
    link.addEventListener("click",()=>openArtwork(src,img.alt,link));
    card.prepend(link);link.append(img);card.classList.add("has-image");
  },{once:true});
  img.addEventListener("error",()=>{}, {once:true});
 });
}
const dialog=document.createElement("dialog");dialog.id="sample-picture-dialog";
dialog.innerHTML='<div class="picture-top"><strong id="picture-title"></strong><button type="button" id="picture-close" aria-label="Close">×</button></div><img id="picture-image" alt="">';
document.body.append(dialog);
let lastTrigger=null;
function openArtwork(src,title,button){
 lastTrigger=button;dialog.querySelector("#picture-title").textContent=title;
 const image=dialog.querySelector("#picture-image");image.src=src;image.alt=title;dialog.showModal();
}
dialog.querySelector("#picture-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener("close",()=>lastTrigger?.focus());
const gallery=document.getElementById("samples-grid");
if(gallery){decorateGallery();new MutationObserver(()=>decorateGallery()).observe(gallery,{childList:true});}
const visual=document.querySelector(".hero-scene");
if(visual){
 const img=document.createElement("img");
 img.className="hero-photo";img.alt=document.documentElement.lang==="ar"?"صورة شخصية لأندرو ثروت":"Portrait of Andrew Tharwat";
 img.addEventListener("load",()=>{visual.classList.add("has-portrait");visual.prepend(img)},{once:true});
 img.src="assets/work/andrew-portrait.webp";
}
})();