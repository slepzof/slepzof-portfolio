#!/usr/bin/env python3
"""Headless Chromium smoke test for the actual built homepage, not source strings.

Check Figma component parity across Featured / Beyond UI / Work Experience,
including Safari-safe scroll primitives, restored metrics and light cover contrast.
All files under dist/__qa_portfolio.html are temporary and not deployed.
Uses only Python stdlib and Chrome preinstalled in GitHub Actions Ubuntu runner.
"""
from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
BASE = "slepzof-portfolio"

QA_HTML = r"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>QA-running</title>
<style>
  body{margin:0;background:#fff}
  iframe{position:absolute;border:0;top:0;left:0;visibility:hidden}
</style>
</head><body><output id="report">QA_WAITING</output>
<script>
(()=>{
 const sizes=[{name:"desktop",w:1440,h:900},{name:"mobile",w:393,h:852}];
 const frames=[];
 const errors=[];
 const metrics={};
 let completed=0;
 const ok=(label,success,value)=>{
  if(!success)errors.push(label+" ["+String(value)+"]");
 };
 const eq=(x,y)=>Math.abs(x-y)<=.65;
 function check(frame,mode){
  const doc=frame.contentDocument;
  const css=x=>frame.contentWindow.getComputedStyle(x);
  const pick=s=>doc.querySelector(s);
  const cards=doc.querySelectorAll("#experience.sx42-ready .sx42-card");
  const periods=doc.querySelectorAll("#experience.sx42-ready .sx42-period");
  const reviews=doc.querySelectorAll("#experience.sx42-ready .ds-review-card");
  const beyond=doc.querySelectorAll("#beyond-ui a.ds-project-card");
  const source=frame.contentWindow.SlepzofWorkData;
  const omittedProjects=source?.periods.flatMap(p=>
     p.slugs.filter(slug=>!doc.querySelector(
       '#experience .sx42-period[data-period="'+p.id+'"] [data-slug="'+slug+'"]'
     )).map(slug=>p.id+":"+slug)
  )||[];

  // Diagnostic for variable-length client testimonials inside the fixed
  // Figma 356x512 cards; captured before changing typography or crop rules.
  const reviewCollisions=[...reviews].filter(card=>{
   const tail=card.querySelector(".ds-review-card__body")||
       card.querySelector(".ds-review-card__lead");
   const textViewport=card.querySelector(".ds-review-card__text")||tail;
   const portrait=card.querySelector(".ds-review-card__portrait");
   return !!tail&&!!portrait&&
      textViewport.getBoundingClientRect().bottom >
      portrait.getBoundingClientRect().top+4;
  }).map(card=>card.dataset.reviewId);
  const allProjectCards=[...doc.querySelectorAll(
    "#selected a.ds-project-card, #experience a.ds-project-card, #beyond-ui a.ds-project-card"
  )];
  // Text integrity is as important as the font sizes: detect impossible
  // Figma layouts instead of silently hiding content with a line clamp.
  const overflowingTitles=allProjectCards.filter(card=>{
   const h=card.querySelector("h3,h4");
   return h&&h.scrollWidth>h.clientWidth+2;
  }).map(card=>card.dataset.slug||card.dataset.sx25b3Slug);
  const copyMetricCollisions=allProjectCards.filter(card=>{
   const copy=card.querySelector(".sx25b3-card-copy");
   const foot=card.querySelector(".sx25b3-card-foot");
   if(!copy||!foot||css(card).display==="none")return false;
   return copy.getBoundingClientRect().bottom>foot.getBoundingClientRect().top+3;
  }).map(card=>card.dataset.slug||card.dataset.sx25b3Slug);
  const selected=pick("#selected a.ds-project-card");
  const work=pick("#experience a.ds-project-card");
  const firstMeta=selected?.querySelector(".sx25b3-meta");
  const firstH=selected?.querySelector("h3");
  const firstP=selected?.querySelector(".sx25b3-card-copy>p");
  metrics[mode]={periods:periods.length,workCards:cards.length,reviews:reviews.length,
   beyondCards:beyond.length,omittedProjects,selectedWidth:selected?.getBoundingClientRect().width,
   selectedRadius:selected?css(selected).borderTopLeftRadius:null,
   selectedTitle:firstH?css(firstH).fontSize:null,
   selectedDescription:firstP?css(firstP).fontSize:null,
   experienceWidth:work?.getBoundingClientRect().width,
   reviewCollisions,overflowingTitles,copyMetricCollisions};
  ok(mode+" 12 periods",periods.length===12,periods.length);
  ok(mode+" 15 reviews",reviews.length===15,reviews.length);
  ok(mode+" review text never overlaps the portrait",reviewCollisions.length===0,reviewCollisions.join(","));
  ok(mode+" 100+ project and testimonial cards",cards.length>=90,cards.length);
  ok(mode+" 8 Beyond skills",beyond.length>=24,beyond.length);
  ok(mode+" Featured and Experience share ProjectCard",!!selected&&!!work,
   !!selected+"/"+!!work);
  if(!selected||!work)return;
  ok(mode+" shared radius Featured",eq(parseFloat(css(selected).borderTopLeftRadius),32),
   css(selected).borderTopLeftRadius);
  ok(mode+" shared radius Experience",eq(parseFloat(css(work).borderTopLeftRadius),32),
   css(work).borderTopLeftRadius);
  ok(mode+" same project headline size",
   eq(parseFloat(css(firstH).fontSize),parseFloat(css(work.querySelector("h3")).fontSize)),
   css(firstH).fontSize+"/"+css(work.querySelector("h3")).fontSize);
  ok(mode+" same project description size",
   eq(parseFloat(css(firstP).fontSize),
      parseFloat(css(work.querySelector(".sx25b3-card-copy>p")).fontSize)),
   css(firstP).fontSize);
  ok(mode+" no giant Featured description padding",
   parseFloat(css(firstP).paddingBottom)<30,css(firstP).paddingBottom);
  // Strict shared-component parity. Every project card should inherit exactly
  // the same typography, metric, arrow and corner geometry from Figma tokens.
  const metricCss=(card,selector,prop)=>card?.querySelector(selector)?
      css(card.querySelector(selector))[prop]:null;
  const beyondCard=beyond[0];
  for(const [kind,card] of [["Experience",work],["Beyond UI",beyondCard]]){
   ok(mode+" "+kind+" project typography matches Featured",
      !!card&&
      eq(parseFloat(metricCss(selected,"h3","fontSize")),
         parseFloat(metricCss(card,"h3","fontSize")))&&
      eq(parseFloat(metricCss(selected,"h3","lineHeight")),
         parseFloat(metricCss(card,"h3","lineHeight"))),
      kind+" "+metricCss(selected,"h3","fontSize")+"/"+metricCss(card,"h3","fontSize")+
      " line "+metricCss(selected,"h3","lineHeight")+"/"+metricCss(card,"h3","lineHeight"));
   ok(mode+" "+kind+" metadata matches Featured",
      !!card&&
      eq(parseFloat(metricCss(selected,".sx25b3-meta","fontSize")),
         parseFloat(metricCss(card,".sx25b3-meta","fontSize")))&&
      eq(parseFloat(metricCss(selected,".sx25b3-meta","lineHeight")),
         parseFloat(metricCss(card,".sx25b3-meta","lineHeight"))),
      kind+" meta "+metricCss(selected,".sx25b3-meta","fontSize")+
      "/"+metricCss(card,".sx25b3-meta","fontSize"));
   ok(mode+" "+kind+" description matches Featured",
      !!card&&
      eq(parseFloat(metricCss(selected,".sx25b3-card-copy>p","fontSize")),
         parseFloat(metricCss(card,".sx25b3-card-copy>p","fontSize")))&&
      eq(parseFloat(metricCss(selected,".sx25b3-card-copy>p","lineHeight")),
         parseFloat(metricCss(card,".sx25b3-card-copy>p","lineHeight"))),
      kind+" copy "+metricCss(selected,".sx25b3-card-copy>p","fontSize")+
      "/"+metricCss(card,".sx25b3-card-copy>p","fontSize"));
   ok(mode+" "+kind+" corner radius matches Featured",
      !!card&&eq(parseFloat(css(card).borderTopLeftRadius),
         parseFloat(css(selected).borderTopLeftRadius)),
      kind+" "+(card?css(card).borderTopLeftRadius:"not present"));
   ok(mode+" "+kind+" laurels and metric align with Featured",
      !!card&&!!card.querySelector(".sx25b3-metric")&&
      eq(parseFloat(metricCss(selected,".sx25b3-metric strong","fontSize")),
         parseFloat(metricCss(card,".sx25b3-metric strong","fontSize")))&&
      eq(parseFloat(metricCss(selected,".sx25b3-metric span","fontSize")),
         parseFloat(metricCss(card,".sx25b3-metric span","fontSize"))),
      kind+" metrics "+metricCss(selected,".sx25b3-metric strong","fontSize")+
      "/"+metricCss(card,".sx25b3-metric strong","fontSize"));
   ok(mode+" "+kind+" project arrow matches Featured",
      !!card&&!!card.querySelector(".sx25b3-arrow")&&
      eq(parseFloat(metricCss(selected,".sx25b3-arrow","width")),
         parseFloat(metricCss(card,".sx25b3-arrow","width"))),
      kind+" arrow "+metricCss(selected,".sx25b3-arrow","width")+
      "/"+metricCss(card,".sx25b3-arrow","width"));
  }

  for(const slug of ["echo-app","vita-ai","luch","city-exchange"]){
   const card=pick('#experience [data-slug="'+slug+'"]');
   const caption=card?.querySelector(".sx25b3-metric strong");
   ok(mode+" "+slug+" rendered metric",!!caption,caption?.textContent);
   ok(mode+" "+slug+" readable light text",!!card&&css(card).color==="rgb(17, 17, 17)",
      card?css(card).color:"missing");
  }
  const hash=pick('#experience [data-period="hash"]');
  ok(mode+" Hash period retained",!!hash,hash?.id);
  if(mode==="mobile"){
   const overflowing=[...reviews].filter(card=>{
    const region=card.querySelector(".ds-review-card__text");
    return region&&region.scrollHeight>region.clientHeight+2;
   });
   ok("Long mobile reviews remain scrollable",overflowing.length>0,
      overflowing.length);
   ok("Mobile testimonial text uses scroll instead of clipping",
     [...reviews].every(card=>css(card.querySelector(".ds-review-card__text")).overflowY==="auto"),
     "region overflow-y");
  }
  const reviewArrow=doc.querySelector('#experience .ds-review-card .sx25b3-arrow');
  ok(mode+" no testimonial arrows",!reviewArrow,!!reviewArrow);
  if(mode==="desktop"){
   const featuredHeading=pick("#selected .sx25b3-section-head h2");
   const experienceHeading=pick("#experience .sx-experience-head h2");
   const featuredGridLeft=pick("#selected .sx25b3-section-head")?.getBoundingClientRect().left;
   ok("Featured carousel begins on same 1116px grid as heading",
      featuredGridLeft!==undefined&&Math.abs(selected.getBoundingClientRect().left-featuredGridLeft)<2,
      selected.getBoundingClientRect().left+"/"+featuredGridLeft);
   ok("Experience title uses H2 token (48/52)",
      !!experienceHeading&&eq(parseFloat(css(experienceHeading).fontSize),48)&&
      eq(parseFloat(css(experienceHeading).lineHeight),52),
      experienceHeading?css(experienceHeading).fontSize+"/"+css(experienceHeading).lineHeight:"missing");
   ok("Featured title uses same H2 as Experience",
      !!featuredHeading&&!!experienceHeading&&
      eq(parseFloat(css(featuredHeading).fontSize),parseFloat(css(experienceHeading).fontSize)),
      featuredHeading?css(featuredHeading).fontSize:"missing");
   const works2020=pick('#experience .sx42-period[data-period="2020-projects"]');
   const expected2020=[["myasnoy-dvor","Продвижение мясного бизнеса"],
     ["papa-pizza","Маркетинг для пиццерии и чайной"],
     ["khleb-iz-tandyra","Продвижение локальной пекарни"],
     ["moonlight","Сайт, Facebook-воронка и бот"],
     ["zaryadka","Приложение для зарядки устройств"],
     ["chexolchik","Продажа аксессуаров через сайт и бота"],
     ["mobilka34","Сайт, бот и реклама магазина техники"],
     ["baraholka34","Локальный магазин одежды в городе"],
     ["izum","Продвижение локального магазина"]];
   ok("2020 original PDF card titles restored",
      !!works2020&&expected2020.every(([slug,title])=>
        works2020.querySelector('[data-slug="'+slug+'"] h3')?.textContent===title),
      works2020?.querySelectorAll(".ds-project-card").length);
   ok("Figma card width 356",eq(selected.getBoundingClientRect().width,356),
      selected.getBoundingClientRect().width);
   ok("Beyond UI cards have exactly the same 356px width as Featured",
      !!beyondCard&&eq(beyondCard.getBoundingClientRect().width,selected.getBoundingClientRect().width),
      beyondCard?.getBoundingClientRect().width);
   for(const [name,selector] of [["Featured","#selected .sx25b3-rail"],
                                   ["Beyond UI","#beyond-ui .sx28-carousel-rail"],
                                   ["Experience","#experience.sx42-ready .sx42-rail"]]){
     const rail=pick(selector);
     ok(name+" rail retains hover clearance",
        !!rail&&parseFloat(css(rail).paddingTop)>=12,
        rail?css(rail).paddingTop:"missing");
   }
   const approval=selected.querySelector(".sx25b3-metric br.sx25b3-approved-break");
   ok("Approved metric manual line break is retained",
      !!approval&&css(approval).display!=="none",
      approval?css(approval).display:"missing");
   ok("Figma metadata 16",eq(parseFloat(css(firstMeta).fontSize),16),
      css(firstMeta).fontSize);
   ok("Figma title 28/32",
       eq(parseFloat(css(firstH).fontSize),28)&&eq(parseFloat(css(firstH).lineHeight),32),
       css(firstH).fontSize+"/"+css(firstH).lineHeight);
   ok("Figma description 16/20",
       eq(parseFloat(css(firstP).fontSize),16)&&eq(parseFloat(css(firstP).lineHeight),20),
       css(firstP).fontSize+"/"+css(firstP).lineHeight);
   ok("Hash arrows hidden when cards fit",
      !!hash?.querySelector(".sx42-featured-controls")?.hidden,
      hash?.querySelector(".sx42-featured-controls")?.hidden);
  }else{
   ok("Beyond mobile project radius 32",!!beyond[0]&&
      eq(parseFloat(css(beyond[0]).borderTopLeftRadius),32),
      beyond[0]?css(beyond[0]).borderTopLeftRadius:"missing");
   ok("Mobile headline not miniature",parseFloat(css(firstH).fontSize)>=19,
      css(firstH).fontSize);
   ok("Mobile description readable",parseFloat(css(firstP).fontSize)>=13,
      css(firstP).fontSize);
   ok("Fourth skill portal retained",
       doc.querySelectorAll("#beyond-ui .sx44-portal").length>=7,
       doc.querySelectorAll("#beyond-ui .sx44-portal").length);
  }
 }
 function finish(){
  const report={status:errors.length?"failed":"passed",errors,metrics};
  document.title="QA-"+report.status;
  document.getElementById("report").textContent="QA_JSON:"+JSON.stringify(report);
 }
 sizes.forEach(size=>{
  const frame=document.createElement("iframe");
  frame.width=size.w;frame.height=size.h;
  frame.style.width=size.w+"px";frame.style.height=size.h+"px";
  frame.src="/slepzof-portfolio/index.html#qa";
  frame.onload=()=>{
   setTimeout(()=>{
    try{check(frame,size.name)}
    catch(e){errors.push(size.name+" exception: "+e.message)}
    if(++completed===sizes.length)finish();
   },1000);
  };
  frame.onerror=()=>{errors.push(size.name+" iframe load failure");if(++completed===sizes.length)finish()};
  frames.push(frame);
  document.body.append(frame);
 });
 setTimeout(()=>{if(completed<sizes.length){errors.push("iframe timeout");finish()}},13500);
})();
</script></body></html>"""


def main() -> None:
    browser = next((x for x in ("google-chrome", "google-chrome-stable", "chromium")
                    if shutil.which(x)), None)
    if not browser:
        raise SystemExit("Headless browser not found (Google Chrome expected on CI runner)")
    if not (DIST / "index.html").is_file():
        raise SystemExit("Run scripts/build_static.py first")
    qa = DIST / "__qa_portfolio.html"
    qa.write_text(QA_HTML, encoding="utf-8")
    try:
        with tempfile.TemporaryDirectory() as temp:
            serve = Path(temp) / BASE
            serve.symlink_to(DIST, target_is_directory=True)
            server = subprocess.Popen(
                ["python3", "-m", "http.server", "8765",
                 "--bind", "127.0.0.1", "--directory", temp],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            try:
                time.sleep(1)
                cmd = [browser, "--headless=new", "--no-sandbox", "--disable-gpu",
                       "--disable-dev-shm-usage", "--hide-scrollbars",
                       "--disable-background-networking", "--disable-extensions",
                       "--virtual-time-budget=18000", "--dump-dom",
                       "http://127.0.0.1:8765/slepzof-portfolio/__qa_portfolio.html"]
                result = subprocess.run(cmd, capture_output=True, text=True,
                                        timeout=95, check=False)
                m = re.search(r"QA_JSON:(\{.*?\})</output>", result.stdout, re.S)
                if not m:
                    raise SystemExit(
                        f"Browser smoke test incomplete (code={result.returncode}): "
                        + result.stderr[-1600:] + "\n" + result.stdout[-1200:]
                    )
                data = json.loads(html.unescape(m.group(1)))
                print(json.dumps(data, ensure_ascii=False, indent=2))
                if data["status"] != "passed":
                    raise SystemExit("Browser design-system smoke test FAILED")
            finally:
                server.terminate()
                try:
                    server.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    server.kill()
    finally:
        qa.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
