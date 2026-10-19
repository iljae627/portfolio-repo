"use client";
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {sceneStudies} from '../lib/scene-studies';

export default function SceneCanvas({kind,control}) {
  const root=useRef(null);
  const [ready,setReady]=useState(false);
  const [studyId,setStudyId]=useState('');
  const study=sceneStudies[studyId];
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
        // Keep the existing illustrated scene if WebGL is unavailable.
        host.dataset.renderer='fallback';
      }
    },{rootMargin:'300px'});
    observer.observe(host);
    return()=>{disposed=true;observer.disconnect();cleanup?.();};
  },[kind,control]);
  return <div ref={root} className={`scene-webgl ${ready?'is-ready':''}`} data-renderer={ready?'webgl':'loading'} data-study-open={!!study}
    onKeyDown={event=>{if(event.key==='Escape'){control.studyManual=false;control.studyPinned=false;control.pointerActive=false;setStudyId('');}}}
    onPointerMove={event=>{
      if(event.pointerType!=='mouse')return;
      if(event.target.closest('.study-ui'))return;
      const rect=event.currentTarget.getBoundingClientRect();
      control.pointerX=(event.clientX-rect.left)/rect.width*2-1;
      control.pointerY=(event.clientY-rect.top)/rect.height*2-1;
      control.pointerActive=true;
    }} onPointerLeave={()=>{control.pointerX=0;control.pointerY=0;control.pointerActive=false;control.studyPinned=false;}}>
      <svg className="study-overlay" aria-hidden="true"><rect data-study-box rx="8" /><path data-study-line /></svg>
      <section className="study-card study-ui" hidden={!study} aria-label="관련 학습 기록"
        onPointerEnter={()=>{control.studyPinned=true;}} onPointerLeave={()=>{control.studyPinned=false;}}
        onFocus={()=>{control.studyPinned=true;}} onBlur={()=>{control.studyPinned=false;}}>
        {study && <a href={study.href}><Image src={study.image} width={48} height={48} alt="" sizes="48px" /><span><strong>{study.title}</strong><small>{study.text}</small></span><span aria-hidden="true">↗</span></a>}
      </section>
      <button type="button" className="study-toggle study-ui" hidden={!ready} aria-expanded={!!study} aria-label="관련 학습 기록 표시"
        onClick={()=>{control.studyManual=!control.studyManual;control.pointerActive=false;}}>학습 기록 <span aria-hidden="true">＋</span></button>
    </div>;
}
