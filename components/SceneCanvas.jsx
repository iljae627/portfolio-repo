"use client";
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {sceneStudies} from '../lib/scene-studies';

export default function SceneCanvas({kind,control}) {
  const root=useRef(null);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const [studyId,setStudyId]=useState('');
  const study=sceneStudies[studyId];
  function dismissStudy(){control.studyFocused=false;control.studyManual=false;control.studyPinned=false;control.pointerActive=false;control.studyDismissed=true;setStudyId('');}
  useEffect(()=>{
    const host=root.current;
    let disposed=false,cleanup,started=false;
    const observer=new IntersectionObserver(async entries=>{
      if(started||!entries.some(entry=>entry.isIntersecting))return;
      started=true;
      try{
        const {mountScene}=await import('./interest-3d-runtime');
        if(disposed)return;
        cleanup=mountScene(host,kind,control,()=>{if(!disposed)setReady(true);},id=>{if(!disposed)setStudyId(id);});
      }catch{
        if(!disposed)setFailed(true);
      }
    },{rootMargin:'300px'});
    observer.observe(host);
    return()=>{disposed=true;observer.disconnect();cleanup?.();};
  },[kind,control]);
  return <div ref={root} className={`scene-webgl ${ready?'is-ready':''}`} data-renderer={failed?'unavailable':ready?'webgl':'loading'} data-study-open={!!study}
    onKeyDown={event=>{if(event.key==='Escape')dismissStudy();}}
    onPointerMove={event=>{
      if(event.pointerType!=='mouse')return;

      const rect=event.currentTarget.getBoundingClientRect();
      control.pointerX=(event.clientX-rect.left)/rect.width*2-1;
      control.pointerY=(event.clientY-rect.top)/rect.height*2-1;
      control.pointerActive=true;control.studyDismissed=false;
    }} onPointerLeave={()=>{control.pointerX=0;control.pointerY=0;control.pointerActive=false;control.studyPinned=!!control.studyFocused;}}>
      {failed && <p className="scene-unavailable">이 기기에서 3D 화면을 표시할 수 없습니다.</p>}
      <svg className="study-overlay" aria-hidden="true"><rect data-study-box rx="8" /><path data-study-line /></svg>
      <section className="study-card study-ui" hidden={!study} aria-label="관련 학습 기록"
        onPointerEnter={()=>{control.studyPinned=true;}} onPointerLeave={()=>{control.studyPinned=!!control.studyFocused;}}
        onFocus={()=>{control.studyFocused=true;control.studyPinned=true;}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){control.studyFocused=false;control.studyPinned=false;}}}>
        <button type="button" className="study-close" aria-label="학습 기록 닫기" onClick={dismissStudy}>×</button>
        {study && <a href={study.href}><Image src={study.image} width={48} height={48} alt="" sizes="48px" /><span><strong>{study.title}</strong><small>{study.text}</small></span><span aria-hidden="true">↗</span></a>}
      </section>
      <button type="button" className="study-toggle study-ui" hidden={!ready} aria-expanded={!!study} aria-label="관련 학습 기록 표시"
        onClick={()=>{if(studyId)dismissStudy();else{control.studyDismissed=false;control.studyManual=true;control.pointerActive=false;}}}>학습 기록 <span aria-hidden="true">＋</span></button>
    </div>;
}
