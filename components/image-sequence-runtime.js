import {SEQUENCE_FRAMES,SEQUENCE_WIDTH,SEQUENCE_HEIGHT,frameIndex,frameURL,sequencePose,imageFit,partRegion,compactPose} from '../lib/image-sequence.mjs';
import {selectStudy,nearStudy} from '../lib/study-selection.mjs';

export function mountImageSequence(host,kind,control,onReady,onStudy){
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx)throw new Error('CANVAS_UNAVAILABLE');
 const small=window.matchMedia('(max-width: 700px)').matches;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const blobs=new Map(),decoded=new Map(),decoding=new Set(),pending=new Set(),failed=new Set();
 const abort=new AbortController();
 let disposed=false,raf=0,width=1,height=1,fit=imageFit(1,1),selected='',shown=-1,wanted=0,active=0,revision=0,lastKey='',lastTime=performance.now(),progress=control.progress||0,ready=false;
 const saveData=navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType);
 const queue=reduced.matches?[0]:[0,SEQUENCE_FRAMES-1,...Array.from({length:20},(_,i)=>i*12),...(saveData?[]:Array.from({length:SEQUENCE_FRAMES},(_,i)=>i))].filter((n,i,a)=>a.indexOf(n)===i);
 function evict(limit=8){while(decoded.size>limit){const key=decoded.keys().next().value;if(key===shown){const value=decoded.get(key);decoded.delete(key);decoded.set(key,value);continue;}decoded.get(key).close();decoded.delete(key);}}
 async function decode(index){
  if(disposed||decoded.has(index)||decoding.has(index)||!blobs.has(index))return;
  decoding.add(index);
  try{
   const bitmap=await createImageBitmap(blobs.get(index));
   if(disposed){bitmap.close();return;}
   decoded.set(index,bitmap);evict();revision++;
  }catch{failed.add(index);}finally{decoding.delete(index);}
 }
 function pump(){
  if(disposed||(!control.visible&&ready)||document.visibilityState==='hidden')return;
  while(active<4&&queue.length){
   const index=queue.shift();if(blobs.has(index)||pending.has(index)||failed.has(index))continue;
   pending.add(index);active++;
   fetch(frameURL(kind,index,small),{signal:abort.signal,cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error('FRAME_UNAVAILABLE');return response.blob();}).then(blob=>{
    if(disposed)return;blobs.set(index,blob);revision++;
    if(index===wanted||!ready)decode(index);
   }).catch(()=>{if(!disposed)failed.add(index);}).finally(()=>{pending.delete(index);active--;pump();});
  }
 }
 function request(index){
  if(decoded.has(index)||blobs.has(index)){decode(index);return;}
  if(!pending.has(index)&&!failed.has(index)){const position=queue.indexOf(index);if(position>=0)queue.splice(position,1);queue.unshift(index);}
  pump();
 }
 function resize(){
  width=host.clientWidth;height=host.clientHeight;fit=imageFit(width,Math.max(1,height-70),small);
  const ratio=Math.min(window.devicePixelRatio||1,small?1.5:2);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  host.querySelector('svg')?.setAttribute('viewBox',`0 0 ${width} ${height}`);lastKey='';
 }
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function regionFor(part){
  const box=partRegion(part,fit),x=box.x+box.width/2,endX=width<700?width/2:width-150,endY=width<700?height-142:height*.26+40;
  return {box,line:[{x,y:box.y},{x,y:endY},{x:endX,y:endY}]};
 }
 function render(){
  if(disposed)return;raf=requestAnimationFrame(render);
  const now=performance.now(),dt=Math.min(80,now-lastTime);lastTime=now;
  if(!control.visible&&ready){evict(2);return;}
  if(document.visibilityState==='hidden')return;
  progress=reduced.matches?0:progress+((control.progress||0)-progress)*(1-Math.exp(-dt/55));
  wanted=frameIndex(progress);request(wanted);
  // Decode two neighbours, but keep only a bounded window of RGBA frames in memory.
  for(const n of reduced.matches?[]:[wanted-1,wanted+1])if(n>=0&&n<SEQUENCE_FRAMES)request(n);
  const key=[wanted,revision,control.pointerX,control.pointerY,control.pointerActive,control.studyManual,control.studyPinned,control.studyDismissed,width,height].join(':');
  if(key===lastKey)return;lastKey=key;
  let frame=decoded.has(wanted)?wanted:[...decoded.keys()].sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];
  if(frame!==undefined){
   ctx.clearRect(0,0,width,height);ctx.drawImage(decoded.get(frame),fit.x,fit.y,(small?640:SEQUENCE_WIDTH)*fit.scale,SEQUENCE_HEIGHT*fit.scale);shown=frame;
   if(!ready){ready=true;onReady();}host.dataset.frame=String(frame);host.dataset.progress=(frame/(SEQUENCE_FRAMES-1)).toFixed(4);
  }
  const rawPose=sequencePose(kind,shown<0?0:shown),pose=small?compactPose(rawPose):rawPose,point=control.pointerActive?{x:(control.pointerX+1)*width/2,y:(control.pointerY+1)*height/2}:null;
  const parts=pose.parts.filter(p=>p.study&&p.alpha>.25),current=parts.find(p=>p.study===selected),region=current&&regionFor(current);
  const card=host.querySelector('.study-card');
  if(region&&card&&!card.hidden){const r=card.getBoundingClientRect(),h=host.getBoundingClientRect();region.card={x:r.left-h.left,y:r.top-h.top,width:r.width,height:r.height};}
  const near=!!region&&nearStudy(point,region);
  const hovered=point&&!control.studyPinned&&!control.studyManual?[...parts].reverse().find(p=>nearStudy(point,{box:partRegion(p,fit)},10))?.study||'':'';
  const next=selectStudy({selected,hovered,near,manual:control.studyManual,pinned:control.studyPinned,dismissed:control.studyDismissed},parts[0]?.study);
  const nextPart=parts.find(p=>p.study===next),nextRegion=nextPart&&regionFor(nextPart);
  if(nextRegion){for(const [k,v] of Object.entries(nextRegion.box))host.querySelector('[data-study-box]')?.setAttribute(k,v);host.querySelector('[data-study-line]')?.setAttribute('d',nextRegion.line.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' '));}
  if(next!==selected){selected=next;host.dataset.study=selected;onStudy(selected);}
  host.dataset.loaded=String(blobs.size);host.dataset.decoded=String(decoded.size);host.dataset.renderer='image-sequence';
 }
 pump();render();
 return()=>{disposed=true;abort.abort();cancelAnimationFrame(raf);observer.disconnect();for(const bitmap of decoded.values())bitmap.close();decoded.clear();blobs.clear();};
}
