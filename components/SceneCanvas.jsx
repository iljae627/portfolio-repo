"use client";
import {useEffect,useRef,useState} from 'react';

export default function SceneCanvas({kind,control}) {
  const root=useRef(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const host=root.current;
    let disposed=false,cleanup,started=false;
    const observer=new IntersectionObserver(async entries=>{
      if(started||!entries.some(entry=>entry.isIntersecting))return;
      started=true;
      try{
        const {mountScene}=await import('./interest-3d-runtime');
        if(disposed)return;
        cleanup=mountScene(host,kind,control,()=>{if(!disposed)setReady(true);});
      }catch{
        // Keep the existing illustrated scene if WebGL is unavailable.
        host.dataset.renderer='fallback';
      }
    },{rootMargin:'300px'});
    observer.observe(host);
    return()=>{disposed=true;observer.disconnect();cleanup?.();};
  },[kind,control]);
  return <div ref={root} className={`scene-webgl ${ready?'is-ready':''}`} data-renderer={ready?'webgl':'loading'} aria-hidden="true"
    onPointerMove={event=>{
      if(event.pointerType!=='mouse')return;
      const rect=event.currentTarget.getBoundingClientRect();
      control.pointerX=(event.clientX-rect.left)/rect.width*2-1;
      control.pointerY=(event.clientY-rect.top)/rect.height*2-1;
      control.pointerActive=true;
    }} onPointerLeave={()=>{control.pointerX=0;control.pointerY=0;control.pointerActive=false;}} />;
}
