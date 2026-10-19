"use client";
import Image from 'next/image';
import {sceneStudies} from '../lib/scene-studies';
export function dismissStudy(control,setStudyId){
 control.studyManual=false;control.studyPinned=false;control.studyFocused=false;control.studyDismissed=true;setStudyId('');
}
export default function StudyOverlay({control,studyId,setStudyId,ready}){
 const study=sceneStudies[studyId],dismiss=()=>dismissStudy(control,setStudyId);
 return <>
  <svg className="study-overlay" aria-hidden="true"><rect data-study-box rx="8"/><path data-study-line/></svg>
  <section className="study-card" hidden={!study} aria-label="관련 학습 기록"
   onPointerEnter={()=>{control.studyPinned=true;}} onPointerLeave={()=>{control.studyPinned=!!control.studyFocused;}}
   onFocus={()=>{control.studyFocused=true;control.studyPinned=true;}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){control.studyFocused=false;control.studyPinned=false;}}}>
   <button className="study-close" type="button" aria-label="학습 기록 닫기" onClick={dismiss}>×</button>
   {study&&<a href={study.href}><Image src={study.image} width={48} height={48} alt="" sizes="48px"/><span><strong>{study.title}</strong><small>{study.text}</small></span><span aria-hidden="true">↗</span></a>}
  </section>
  <button className="study-toggle" type="button" hidden={!ready} aria-label="관련 학습 기록 표시" aria-expanded={!!study} onClick={()=>{if(studyId)dismiss();else{control.studyDismissed=false;control.studyManual=true;}}}>학습 기록 <span aria-hidden="true">＋</span></button>
 </>;
}
