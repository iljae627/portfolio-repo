"use client";
import {useEffect,useRef,useState} from 'react';
import StudyOverlay,{dismissStudy} from './StudyOverlay';
import {frameURL} from '../lib/image-sequence.mjs';

export default function SequenceScene({kind,control}){
 const root=useRef(null),[ready,setReady]=useState(false),[studyId,setStudyId]=useState(''),[compact,setCompact]=useState(null);
 const dismiss=()=>dismissStudy(control,setStudyId);
 useEffect(()=>{const media=window.matchMedia('(max-width: 700px)');const update=()=>setCompact(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{
  if(compact===null)return;
  setReady(false);setStudyId('');
  let stopped=false,cleanup,started=false;
  const host=root.current;
  const observer=new IntersectionObserver(async entries=>{
   if(started||!entries.some(e=>e.isIntersecting))return;started=true;
   try{const {mountImageSequence}=await import('./image-sequence-runtime');if(stopped)return;cleanup=mountImageSequence(host,kind,control,()=>{if(!stopped)setReady(true);},id=>{if(!stopped)setStudyId(id);});}
   catch{host.dataset.renderer='image-poster';}
  },{rootMargin:'400px'});
  observer.observe(host);return()=>{stopped=true;observer.disconnect();cleanup?.();};
 },[kind,control,compact]);
 return <div ref={root} className={`scene-sequence ${ready?'is-ready':''}`} data-study-open={!!studyId} data-renderer="image-sequence-loading"
  onPointerMove={event=>{if(event.pointerType!=='mouse')return;const r=event.currentTarget.getBoundingClientRect();control.pointerX=(event.clientX-r.left)/r.width*2-1;control.pointerY=(event.clientY-r.top)/r.height*2-1;control.pointerActive=true;control.studyDismissed=false;}}
  onPointerLeave={()=>{control.pointerActive=false;control.studyPinned=!!control.studyFocused;}}
  onKeyDown={event=>{if(event.key==='Escape')dismiss();}}>
  {/* This poster belongs to the same new sequence; legacy concept images are never mounted. */}
  <picture className="sequence-poster"><source media="(max-width: 700px)" srcSet={frameURL(kind,0,true)}/><img src={frameURL(kind,0)} alt="" loading={kind==='forensics'?'eager':'lazy'} width="1280" height="832"/></picture>
  <canvas aria-hidden="true"/>
  <StudyOverlay control={control} ready={ready} studyId={studyId} setStudyId={setStudyId}/>
 </div>;
}
