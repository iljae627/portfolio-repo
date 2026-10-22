import {cyberPose,rainHead,rainGlyph} from '../lib/cyber-motion.mjs';
import {selectStudy,nearStudy} from '../lib/study-selection.mjs';

export function mountCyberScene(host,kind,control,onStudy){
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let width=1,height=1,disposed=false,raf=0,last='',selected='',progress=control.progress||0,time=performance.now();
 const targets=[...host.querySelectorAll('[data-cyber-study]')],slices=[...host.querySelectorAll('.web-slice')];
 function resize(){width=host.clientWidth;height=host.clientHeight;const ratio=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx?.setTransform(ratio,0,0,ratio,0,0);host.querySelector('svg')?.setAttribute('viewBox',`0 0 ${width} ${height}`);last='';}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function drawRain(pose){
  if(!ctx)return;ctx.clearRect(0,0,width,height);ctx.font=`${width<700?11:13}px Consolas, monospace`;
  const spacing=width<700?24:27;
  for(let col=0;col<Math.ceil(width/spacing);col++){
   const head=rainHead(col,pose.progress,height);
   for(let row=0;row<19;row++){
    const y=head-row*19;if(y<0||y>height)continue;
    const alpha=(1-row/19)*(.22+(col%4)*.1);
    ctx.fillStyle=row===0?`rgba(211,255,240,${alpha+.15})`:`rgba(${col%3===0?'72,173,211':'58,211,164'},${alpha})`;
    ctx.fillText(rainGlyph(col,row),col*spacing+8,y);
   }
  }
 }
 function rectFor(el){const r=el.getBoundingClientRect(),h=host.getBoundingClientRect();return {x:r.left-h.left,y:r.top-h.top,width:r.width,height:r.height};}
 function regionFor(el){const box=rectFor(el),x=box.x+box.width/2,endX=width<700?width/2:width-150,endY=width<700?height-142:height*.26+40;return {box,line:[{x,y:box.y},{x,y:endY},{x:endX,y:endY}]};}
 function render(){
  if(disposed)return;raf=requestAnimationFrame(render);const now=performance.now(),dt=Math.min(80,now-time);time=now;
  if(!control.visible||document.visibilityState==='hidden')return;
  const requested=motion.matches?0:control.progress||0;progress+= (requested-progress)*(1-Math.exp(-dt/55));if(Math.abs(requested-progress)<.00005)progress=requested;
  const pose=cyberPose(kind,progress,motion.matches),key=[pose.frame,control.pointerX,control.pointerY,control.pointerActive,control.studyManual,control.studyPinned,control.studyDismissed,width,height].join(':');
  if(key===last)return;last=key;
  host.style.setProperty('--attack',pose.attack.toFixed(4));host.style.setProperty('--modified',pose.modified.toFixed(4));host.style.setProperty('--trace',pose.trace);
  host.style.setProperty('--pointer-x',motion.matches?0:(control.pointerX||0)*1.5);host.style.setProperty('--pointer-y',motion.matches?0:(control.pointerY||0)*1.2);
  host.dataset.frame=String(pose.frame);host.dataset.progress=pose.progress.toFixed(4);host.dataset.renderer=kind==='web'?'web-scroll-simulation':kind==='fuzzing'?'scroll-fuzzing-flow':'scroll-code-rain';
  if(kind==='reversing')drawRain(pose);
  else if(kind==='web'){for(let i=0;i<slices.length;i++)slices[i].style.setProperty('--slice-shift',`${pose.slices[i].toFixed(2)}px`);const status=host.querySelector('[data-web-status]');if(status)status.textContent=pose.status;}
  else{
   host.style.setProperty('--fuzz-input',pose.input.toFixed(4));host.style.setProperty('--fuzz-coverage',pose.coverage.toFixed(4));host.style.setProperty('--fuzz-crash',pose.crash.toFixed(4));
   for(const el of host.querySelectorAll('[data-fuzz-bytes]'))el.textContent=pose.bytes[Number(el.dataset.fuzzBytes)];
   const stage=host.querySelector('[data-fuzz-stage]');if(stage)stage.textContent=pose.crash>.5?'CRASH → REPRODUCE → ANALYZE':pose.coverage>.2?'MUTATION → RUN → NEW PATH':'INPUT → MUTATION → EXECUTION';
  }
  const liveTargets=targets.filter(el=>pose.progress>=Number(el.dataset.minProgress||0));
  const point=control.pointerActive?{x:(control.pointerX+1)*width/2,y:(control.pointerY+1)*height/2}:null;
  const current=liveTargets.find(el=>el.dataset.cyberStudy===selected),region=current&&regionFor(current),card=host.querySelector('.study-card');
  if(region&&card&&!card.hidden)region.card=rectFor(card);
  const near=!!region&&nearStudy(point,region),hovered=point&&!control.studyPinned&&!control.studyManual?[...liveTargets].reverse().find(el=>nearStudy(point,{box:rectFor(el)},12))?.dataset.cyberStudy||'':'';
  const onConnector=!!region&&nearStudy(point,{line:region.line,card:region.card});
  const next=selectStudy({selected,hovered,near,onConnector,manual:control.studyManual,pinned:control.studyPinned,dismissed:control.studyDismissed},liveTargets[0]?.dataset.cyberStudy);
  const nextTarget=liveTargets.find(el=>el.dataset.cyberStudy===next);
  if(nextTarget){const r=regionFor(nextTarget);for(const [k,v] of Object.entries(r.box))host.querySelector('[data-study-box]')?.setAttribute(k,v);host.querySelector('[data-study-line]')?.setAttribute('d',r.line.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' '));}
  if(next!==selected){selected=next;host.dataset.study=selected;onStudy(selected);}
 }
 render();return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();};
}
