"use client";
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import StudyOverlay,{dismissStudy} from './StudyOverlay';
export default function CyberScene({kind,control}){
 const root=useRef(null),[ready,setReady]=useState(false),[studyId,setStudyId]=useState('');
 useEffect(()=>{
  let disposed=false,cleanup,started=false;const host=root.current;
  const observer=new IntersectionObserver(async entries=>{
   if(started||!entries.some(e=>e.isIntersecting))return;started=true;
   const {mountCyberScene}=await import('./cyber-runtime');if(disposed)return;
   cleanup=mountCyberScene(host,kind,control,id=>{if(!disposed)setStudyId(id);});setReady(true);
  },{rootMargin:'300px'});observer.observe(host);return()=>{disposed=true;observer.disconnect();cleanup?.();};
 },[kind,control]);
 return <div ref={root} className={`cyber-scene cyber-${kind}`} data-study-open={!!studyId} data-renderer="scroll-scene-loading"
  onKeyDown={e=>{if(e.key==='Escape')dismissStudy(control,setStudyId);}}
  onPointerMove={e=>{if(e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();control.pointerX=(e.clientX-r.left)/r.width*2-1;control.pointerY=(e.clientY-r.top)/r.height*2-1;control.pointerActive=true;control.studyDismissed=false;}}
  onPointerLeave={()=>{control.pointerActive=false;control.studyPinned=!!control.studyFocused;}}>
  <canvas className="cyber-rain" aria-hidden="true"/>
  {kind==='reversing'?<>
   <div className="analysis-orbit orbit-vm" data-cyber-study="reversing-vm"><span>ELF / BYTECODE</span><strong>BBBQ VM</strong><i aria-hidden="true">↗</i></div>
   <div className="analysis-window" data-cyber-study="reversing-debugger">
    <div className="window-bar"><span className="window-dots" aria-hidden="true">● ● ●</span><span>Python Debugger</span><code>my_debugger.py</code></div>
    <div className="analysis-capture"><Image src="/images/portfolio/python-debugger.png" width={1918} height={980} alt="직접 만든 Python 디버거의 소스 코드 화면" sizes="(max-width:700px) 90vw, 760px"/><span className="analysis-scan" aria-hidden="true"/></div>
    <div className="analysis-status"><span>BREAKPOINT</span><span>STEP INTO → CALL → RETURN</span><span className="trace-led"/></div>
   </div>
  </>:<>
   <div className="web-browser" data-cyber-study="web-requests">
    <div className="window-bar"><span className="window-dots" aria-hidden="true">● ● ●</span><code>portfolio.local</code><span data-web-status>200 OK</span></div>
    <div className="web-viewport">
     <Image className="web-original" src="/images/portfolio/web-demo-before.webp" width={1265} height={712} alt="변조 효과가 적용되기 전 포트폴리오 홈 화면" sizes="(max-width:700px) 90vw, 800px"/>
     <div className="web-slices" aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i} className="web-slice" style={{'--slice':i,'--slice-bg':`${i/7*100}%`}}/>)}</div>
     <div className="web-takeover" data-cyber-study="web-auth" data-min-progress="0.55"><span className="breach-mark" aria-hidden="true">⌁</span><strong>PAGE<br/>MODIFIED</strong><span>권한 없는 화면 변경</span></div>
     <div className="web-scanlines" aria-hidden="true"/>
    </div>
    <div className="web-status"><span>INPUT → REQUEST → RESPONSE</span><span>스크롤 시뮬레이션</span></div>
   </div>
  </>}
  <StudyOverlay control={control} ready={ready} studyId={studyId} setStudyId={setStudyId}/>
 </div>;
}
