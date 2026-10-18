/* Andrew Tharwat V12 — a calm, non-duplicated professional work index.
   All records come from the existing truthful V10/V11 portfolio dataset.
   Twenty-five original examples are each attached to exactly one relevant work area. */
(() => {
  "use strict";
  const root=document.getElementById("full-work-list");
  const source=window.PORTFOLIO_DATA;
  if(!root || !source || !Array.isArray(source.cases) || !Array.isArray(source.samples)) return;

  const ar=document.documentElement.lang==="ar";
  const pick=x => ar ? x[1] : x[0];
  const labels=ar
    ? { examples:"نماذج من نفس المجال", responsibility:"حدود دوري", open:"افتح تفاصيل", close:"إخفاء التفاصيل" }
    : { examples:"Related work samples", responsibility:"My role", open:"Read details", close:"Hide details" };

  // One index per unique case study, with no repeats across groups.
  const groups=[
    { en:"Digital safety tools", ar:"الأنظمة والأدوات الرقمية", items:[0,1,2,3,15] },
    { en:"HSE documentation & coordination", ar:"التوثيق والتقارير والمتابعة", items:[4,5,6] },
    { en:"Technical layouts & sketches", ar:"المخططات والرسومات التوضيحية", items:[7,8,9,10] },
    { en:"Safety design & video", ar:"التصميم والتوعية والفيديو", items:[11,12,13,14] }
  ];

  // One owner for each of the 25 already-indexed original samples.
  // Public operational drawings are deliberately NOT embedded here.
  const relatedSamples={
    7:[8,13,14,15],
    8:[9,10,11,12],
    9:[16,17],
    10:[18,19,20],
    11:[0,1,2,3,4,5,6],
    12:[7,21,22,23,24]
  };
  const seenCases=new Set();
  const seenSamples=new Set();

  const line=(tag,cls,content)=>{
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(content!=null)e.textContent=content;
    return e;
  };

  for(const group of groups){
    const wrapper=line("section","work-group");
    const title=line("h3","work-group-title", ar ? group.ar : group.en);
    const list=line("ul","work-lines");

    for(const id of group.items){
      const item=source.cases[id];
      if(!item || seenCases.has(id))continue;
      seenCases.add(id);
      const row=line("li","work-line");
      const details=document.createElement("details");
      details.className="work-detail";
      const summary=document.createElement("summary");
      summary.setAttribute("aria-label",(ar ? "تفاصيل: " : "Details: ")+pick(item));
      summary.append(
        line("span","work-dot"),
        line("span","work-line-label",pick(item)),
        line("span","work-plus","+")
      );

      const extra=line("div","work-extra");
      extra.append(line("p","work-summary",ar?item[5]:item[4]));
      const roleText=ar?item[7]:item[6];
      if(roleText){
        const note=line("p","work-responsibility");
        const strong=line("strong","",labels.responsibility+": ");
        note.append(strong,document.createTextNode(roleText));
        extra.append(note);
      }

      const examples=(relatedSamples[id]||[]).filter(sampleId=>{
        if(!source.samples[sampleId] || seenSamples.has(sampleId))return false;
        seenSamples.add(sampleId);
        return true;
      });
      if(examples.length){
        extra.append(line("p","work-example-heading",labels.examples));
        const u=line("ul","work-examples");
        for(const sampleId of examples){
          u.append(line("li","",pick(source.samples[sampleId])));
        }
        extra.append(u);
      }
      details.append(summary,extra);
      row.append(details);
      list.append(row);
    }
    wrapper.append(title,list);
    root.append(wrapper);
  }

  // Extra source data remains preserved in data.js even if new cases are added
  // later and have not yet been assigned to a display group.
  if(seenCases.size<source.cases.length){
    const g=line("section","work-group");
    g.append(line("h3","work-group-title",ar?"أعمال أخرى":"Other work"));
    const ul=line("ul","work-lines");
    source.cases.forEach((item,id)=>{
      if(seenCases.has(id))return;
      const li=line("li","work-line");
      const d=line("details","work-detail");
      const s=line("summary");
      s.append(line("span","work-dot"),line("span","work-line-label",pick(item)),line("span","work-plus","+"));
      const p=line("p","work-summary",ar?item[5]:item[4]);
      const content=line("div","work-extra");content.append(p);
      d.append(s,content);li.append(d);ul.append(li);
    });
    g.append(ul);root.append(g);
  }
})();
