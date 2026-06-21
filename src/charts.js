/* --- SVG Chart Library --- */

const Charts = (() => {

  const COLORS = {
    purple:"#818CF8", green:"#34D399", blue:"#60A5FA",
    orange:"#FB923C", pink:"#F472B6", yellow:"#FBBF24",
    red:"#F87171", teal:"#2DD4BF",
    grid:"#1E2028", text:"#64748B", textLight:"#94A3B8",
    surface:"#161820",
  };

  const PALETTE = [COLORS.purple,COLORS.green,COLORS.blue,COLORS.orange,COLORS.pink,COLORS.yellow];

  function svgEl(tag, attrs={}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    return el;
  }

  function makeSVG(w,h) {
    return svgEl("svg",{width:"100%",height:h,viewBox:`0 0 ${w} ${h}`,preserveAspectRatio:"none"});
  }

  function sparkline(container, data, color=COLORS.purple, filled=true) {
    const W=80,H=32;
    const svg=makeSVG(W,H);
    const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1;
    const pts=data.map((v,i)=>({
      x:(i/(data.length-1))*(W-4)+2,
      y:H-4-((v-mn)/range)*(H-8),
    }));
    const d=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
    if(filled){
      const area=d+` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
      const grad=svgEl("defs");
      grad.innerHTML=`<linearGradient id="sg_${color.replace("#","")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0.02"/></linearGradient>`;
      svg.appendChild(grad);
      svg.appendChild(svgEl("path",{d:area,fill:`url(#sg_${color.replace("#","")})`,stroke:"none"}));
    }
    svg.appendChild(svgEl("path",{d,fill:"none",stroke:color,"stroke-width":"1.5","stroke-linecap":"round","stroke-linejoin":"round"}));
    container.innerHTML="";
    container.appendChild(svg);
  }

  function funnel(container, stages) {
    const W=560,H=340;
    const svg=makeSVG(W,H);
    const total=stages[0].count;
    const barH=34,gap=10,maxW=W-180,minW=maxW*0.1;
    const colors=["#818CF8","#60A5FA","#34D399","#2DD4BF","#FBBF24","#FB923C","#F87171"];
    stages.forEach((stage,i)=>{
      const ratio=stage.count/total;
      const barW=Math.max(minW,maxW*Math.pow(ratio,0.5));
      const x=(maxW-barW)/2,y=i*(barH+gap);
      const color=colors[i%colors.length];
      svg.appendChild(svgEl("rect",{x,y,width:barW,height:barH,rx:6,fill:color,"fill-opacity":Math.max(0.55,1-i*0.08)}));
      const lbl=svgEl("text",{x:x-8,y:y+barH/2+5,"text-anchor":"end","font-size":"12",fill:COLORS.textLight,"font-family":"inherit"});
      lbl.textContent=stage.name; svg.appendChild(lbl);
      const cnt=svgEl("text",{x:x+10,y:y+barH/2+5,"text-anchor":"start","font-size":"13","font-weight":"600",fill:"#F1F5F9","font-family":"inherit"});
      cnt.textContent=stage.count.toLocaleString(); svg.appendChild(cnt);
      if(stage.conversion!==null){
        const cv=svgEl("text",{x:maxW+20,y:y+barH/2+5,"text-anchor":"start","font-size":"12",fill:color,"font-family":"inherit"});
        cv.textContent=`${stage.conversion}% conv`; svg.appendChild(cv);
      }
      if(stage.avgDays>0){
        const dv=svgEl("text",{x:maxW+110,y:y+barH/2+5,"text-anchor":"start","font-size":"11",fill:COLORS.text,"font-family":"inherit"});
        dv.textContent=`${stage.avgDays}d avg`; svg.appendChild(dv);
      }
      if(i<stages.length-1){
        const nr=stages[i+1].count/total,nw=Math.max(minW,maxW*Math.pow(nr,0.5)),nx=(maxW-nw)/2,ny=(i+1)*(barH+gap);
        svg.appendChild(svgEl("polygon",{points:`${x},${y+barH} ${x+barW},${y+barH} ${nx+nw},${ny} ${nx},${ny}`,fill:color,"fill-opacity":"0.1"}));
      }
    });
    svg.setAttribute("viewBox",`0 0 ${W} ${stages.length*(barH+gap)-gap}`);
    svg.setAttribute("height",stages.length*(barH+gap)-gap);
    container.innerHTML=""; container.appendChild(svg);
  }

  function lineChart(container,{labels,series,height=200,showGrid=true}){
    const W=560,H=height,padL=48,padR=20,padT=16,padB=32;
    const svg=makeSVG(W,H);
    const allVals=series.flatMap(s=>s.data.filter(v=>v!==null));
    const mn=Math.floor(Math.min(...allVals)*0.95),mx=Math.ceil(Math.max(...allVals)*1.05),range=mx-mn||1;
    const innerW=W-padL-padR,innerH=H-padT-padB;
    const px=i=>padL+(i/(labels.length-1))*innerW;
    const py=v=>padT+innerH-((v-mn)/range)*innerH;
    if(showGrid){
      for(let t=0;t<=4;t++){
        const v=mn+(range/4)*t,y=py(v);
        svg.appendChild(svgEl("line",{x1:padL,y1:y,x2:W-padR,y2:y,stroke:COLORS.grid,"stroke-width":"1"}));
        const l=svgEl("text",{x:padL-6,y:y+4,"text-anchor":"end","font-size":"10",fill:COLORS.text,"font-family":"inherit"}));
        l.textContent=Math.round(v); svg.appendChild(l);
      }
    }
    labels.forEach((l,i)=>{
      const t=svgEl("text",{x:px(i),y:H-6,"text-anchor":"middle","font-size":"10",fill:COLORS.text,"font-family":"inherit"});
      t.textContent=l; svg.appendChild(t);
    });
    const defs=svgEl("defs");
    series.forEach((s,si)=>{
      const gid=`lg_${si}_${Math.random().toString(36).slice(2)}`;
      s._gid=gid;
      defs.innerHTML+=`<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${s.color}" stop-opacity="0.25"/><stop offset="100%" stop-color="${s.color}" stop-opacity="0.01"/></linearGradient>`;
    });
    svg.appendChild(defs);
    series.forEach(s=>{
      const pts=s.data.map((v,i)=>v!==null?{x:px(i),y:py(v)}:null);
      const valid=pts.filter(Boolean);
      if(!valid.length)return;
      const d=valid.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      const area=d+` L${valid[valid.length-1].x},${H-padB} L${valid[0].x},${H-padB} Z`;
      svg.appendChild(svgEl("path",{d:area,fill:`url(#${s._gid})`,stroke:"none"}));
      svg.appendChild(svgEl("path",{d,fill:"none",stroke:s.color,"stroke-width":s.dashed?"1.5":"2","stroke-dasharray":s.dashed?"5,4":"none","stroke-linecap":"round","stroke-linejoin":"round"}));
      valid.forEach(p=>svg.appendChild(svgEl("circle",{cx:p.x,cy:p.y,r:"3",fill:s.color,stroke:COLORS.surface,"stroke-width":"1.5"})));
      const last=valid[valid.length-1];
      const lbl=svgEl("text",{x:last.x+5,y:last.y+4,"font-size":"10",fill:s.color,"font-family":"inherit"});
      lbl.textContent=s.label; svg.appendChild(lbl);
    });
    container.innerHTML=""; container.appendChild(svg);
  }

  function barChart(container,{labels,series,height=180,stacked=false,showValues=true}){
    const W=560,H=height,padL=44,padR=16,padT=16,padB=32;
    const svg=makeSVG(W,H);
    const innerW=W-padL-padR,innerH=H-padT-padB;
    const groupW=innerW/labels.length;
    const barW=stacked?groupW*0.55:(groupW*0.7)/series.length;
    const gap=stacked?0:(groupW*0.7-barW*series.length)/Math.max(series.length-1,1);
    const allVals=stacked?labels.map((_,i)=>series.reduce((s,sr)=>s+(sr.data[i]||0),0)):series.flatMap(s=>s.data.filter(v=>v!==null));
    const mx=Math.ceil(Math.max(...allVals)*1.15);
    const py=v=>padT+innerH-(v/mx)*innerH;
    [0,0.25,0.5,0.75,1].forEach(t=>{
      const v=Math.round(mx*t),y=py(v);
      svg.appendChild(svgEl("line",{x1:padL,y1:y,x2:W-padR,y2:y,stroke:COLORS.grid,"stroke-width":"1"}));
      const l=svgEl("text",{x:padL-6,y:y+4,"text-anchor":"end","font-size":"10",fill:COLORS.text,"font-family":"inherit"});
      l.textContent=v>=1000?(v/1000).toFixed(0)+"K":v; svg.appendChild(l);
    });
    labels.forEach((l,i)=>{
      const cx=padL+i*groupW+groupW/2;
      const xl=svgEl("text",{x:cx,y:H-6,"text-anchor":"middle","font-size":"10",fill:COLORS.text,"font-family":"inherit"});
      xl.textContent=l; svg.appendChild(xl);
      if(stacked){
        let yOff=H-padB;
        series.forEach(s=>{
          const v=s.data[i]??0;
          if(!v)return;
          const bH=(v/mx)*innerH;
          svg.appendChild(svgEl("rect",{x:cx-barW/2,y:yOff-bH,width:barW,height:bH,rx:i===0?4:0,fill:s.color,"fill-opacity":"0.85"}));
          yOff-=bH;
        });
      } else {
        series.forEach((s,si)=>{
          const v=s.data[i];
          if(v===null||v===undefined)return;
          const bH=(v/mx)*innerH;
          const bx=cx-(series.length*barW+(series.length-1)*gap)/2+si*(barW+gap);
          svg.appendChild(svgEl("rect",{x:bx,y:py(v),width:barW,height:bH,rx:3,fill:s.color,"fill-opacity":"0.85"}));
          if(showValues&&v>0){
            const vl=svgEl("text",{x:bx+barW/2,y:py(v)-4,"text-anchor":"middle","font-size":"9",fill:s.color,"font-family":"inherit"});
            vl.textContent=v; svg.appendChild(vl);
          }
        });
      }
    });
    container.innerHTML=""; container.appendChild(svg);
  }

  function donut(container,{segments,size=140,thickness=28,label,sublabel}){
    const cx=size/2,cy=size/2,r=(size-thickness)/2-4;
    const svg=svgEl("svg",{width:size,height:size,viewBox:`0 0 ${size} ${size}`});
    const total=segments.reduce((s,sg)=>s+sg.value,0);
    let startAngle=-Math.PI/2;
    svg.appendChild(svgEl("circle",{cx,cy,r,fill:"none",stroke:COLORS.grid,"stroke-width":thickness}));
    segments.forEach((seg,i)=>{
      const angle=(seg.value/total)*Math.PI*2,endAngle=startAngle+angle;
      const x1=cx+r*Math.cos(startAngle),y1=cy+r*Math.sin(startAngle);
      const x2=cx+r*Math.cos(endAngle),y2=cy+r*Math.sin(endAngle);
      const large=angle>Math.PI?1:0;
      svg.appendChild(svgEl("path",{d:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,fill:"none",stroke:seg.color||PALETTE[i%PALETTE.length],"stroke-width":thickness,"stroke-linecap":"round"}));
      startAngle=endAngle+0.03;
    });
    if(label){const t=svgEl("text",{x:cx,y:cy+6,"text-anchor":"middle","font-size":"22","font-weight":"700",fill:"#F1F5F9","font-family":"inherit"});t.textContent=label;svg.appendChild(t);}
    if(sublabel){const t=svgEl("text",{x:cx,y:cy+22,"text-anchor":"middle","font-size":"11",fill:COLORS.textLight,"font-family":"inherit"});t.textContent=sublabel;svg.appendChild(t);}
    container.innerHTML=""; container.appendChild(svg);
  }

  function hBar(container,{items,height=200,showPct=false,maxVal=null}){
    const W=440,barH=22,gap=14,labelW=100,barAreaW=W-labelW-72;
    const mx=maxVal||Math.max(...items.map(it=>it.value));
    const svg=makeSVG(W,items.length*(barH+gap));
    items.forEach((item,i)=>{
      const y=i*(barH+gap),barW=(item.value/mx)*barAreaW;
      const color=item.color||PALETTE[i%PALETTE.length];
      svg.appendChild(svgEl("rect",{x:labelW,y,width:barAreaW,height:barH,rx:4,fill:COLORS.grid}));
      svg.appendChild(svgEl("rect",{x:labelW,y,width:barW,height:barH,rx:4,fill:color,"fill-opacity":"0.85"}));
      const lbl=svgEl("text",{x:labelW-8,y:y+barH/2+5,"text-anchor":"end","font-size":"12",fill:COLORS.textLight,"font-family":"inherit"});
      lbl.textContent=item.label; svg.appendChild(lbl);
      const val=svgEl("text",{x:labelW+barAreaW+10,y:y+barH/2+5,"font-size":"12","font-weight":"600",fill:color,"font-family":"inherit"});
      val.textContent=showPct?item.value+"%":item.value.toLocaleString(); svg.appendChild(val);
    });
    svg.setAttribute("height",items.length*(barH+gap));
    container.innerHTML=""; container.appendChild(svg);
  }

  function budgetBars(container,{items,height}){
    const W=520,labelW=160,barAreaW=W-labelW-80,barH=12,gap=12;
    const mx=Math.max(...items.flatMap(it=>[it.budget,it.actual]));
    const svg=makeSVG(W,height||items.length*60);
    items.forEach((item,i)=>{
      const y=i*(barH*2+gap+20)+10;
      const bW=(item.budget/mx)*barAreaW,aW=(item.actual/mx)*barAreaW;
      const pct=Math.round((item.actual/item.budget)*100);
      const color=pct>95?COLORS.red:pct>80?COLORS.yellow:COLORS.green;
      const lbl=svgEl("text",{x:0,y:y+barH-1,"font-size":"12",fill:COLORS.textLight,"font-family":"inherit"});
      lbl.textContent=item.cat; svg.appendChild(lbl);
      svg.appendChild(svgEl("rect",{x:labelW,y,width:barAreaW,height:barH,rx:3,fill:COLORS.grid}));
      svg.appendChild(svgEl("rect",{x:labelW,y,width:bW,height:barH,rx:3,fill:"#475569","fill-opacity":"0.6"}));
      svg.appendChild(svgEl("rect",{x:labelW,y:y+barH+3,width:aW,height:barH,rx:3,fill:color,"fill-opacity":"0.85"}));
      const pl=svgEl("text",{x:labelW+barAreaW+10,y:y+barH+3,"font-size":"11","font-weight":"600",fill:color,"font-family":"inherit"});
      pl.textContent=pct+"%"; svg.appendChild(pl);
      const bl=svgEl("text",{x:labelW+barAreaW+36,y:y+barH-1,"font-size":"10",fill:COLORS.text,"font-family":"inherit"});
      bl.textContent="$"+(item.budget/1000).toFixed(0)+"K"; svg.appendChild(bl);
    });
    container.innerHTML=""; container.appendChild(svg);
  }

  return {sparkline,funnel,lineChart,barChart,donut,hBar,budgetBars};
})();
