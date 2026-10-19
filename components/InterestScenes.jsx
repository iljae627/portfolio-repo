"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SequenceScene from "./SequenceScene";
import CyberScene from "./CyberScene";

const scenes = [
  {id: "forensics", label: "DIGITAL FORENSICS", title: "디지털 포렌식", href: "/work/digital-forensics"},
  {id: "android", label: "ANDROID SECURITY", title: "Android 앱 분석", href: "/work/android-security"},
  {id: "reversing", label: "REVERSE ENGINEERING", title: "리버스 엔지니어링", href: "/projects"},
  {id: "web", label: "WEB HACKING", title: "웹 해킹", href: "/archive"},
  {id: "fuzzing", label: "FUZZING", title: "퍼징 실습", href: "https://iljae627.github.io/posts/fuzzing101-three-exercises/"},
];
const clamp = value => Math.min(1, Math.max(0, value));

export default function InterestScenes() {
  const root = useRef(null);
  const [active, setActive] = useState(null);
  const controls = useRef(null);
  if (!controls.current) controls.current = Object.fromEntries(scenes.map(scene => [scene.id, {progress: 0, visible: false, pointerX: 0, pointerY: 0, pointerActive: false}]));
  useEffect(() => {
    const sections = [...root.current.querySelectorAll(".interest-scene")];
    let frame = 0, current = null;
    function update() {
      frame = 0;
      const height = window.innerHeight;
      const header = document.querySelector("header")?.offsetHeight || 76;
      let next = null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        controls.current[section.id].visible = rect.bottom > 0 && rect.top < height;
        if (rect.bottom < 0 || rect.top > height * 1.5) continue;
        const reveal = clamp((height - rect.top) / (height * .8));
        const progress = clamp((header - rect.top) / Math.max(1, rect.height - height + header));
        controls.current[section.id].progress = progress;
        section.style.setProperty("--scene-reveal", reveal.toFixed(4));
        section.style.setProperty("--scene-progress", progress.toFixed(4));
        if (rect.top <= height * .5 && rect.bottom > height * .5) next = section.id;
      }
      if (next !== current) { current = next; setActive(next); }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div id="interests" className="interest-scenes" ref={root}>
      <nav className={`interest-progress ${active ? "is-visible" : ""}`} aria-label="관심 분야" aria-hidden={!active}>
        {scenes.map((scene, index) => <a key={scene.id} href={`#${scene.id}`} tabIndex={active ? 0 : -1}
          aria-label={`${index + 1}. ${scene.label}`} aria-current={active === scene.id ? "step" : undefined}><span /></a>)}
      </nav>
      {scenes.map(scene => <section className={`interest-scene scene-${scene.id}`} id={scene.id} key={scene.id} aria-labelledby={`${scene.id}-title`}>
        <div className="interest-stage">
          <div className="interest-art">{["reversing","web"].includes(scene.id) ? <CyberScene kind={scene.id} control={controls.current[scene.id]}/> : <SequenceScene kind={scene.id} control={controls.current[scene.id]}/>}</div>
          <div className="interest-copy"><span>{scene.label}</span>{scene.id === 'forensics' ? <h1 id={`${scene.id}-title`}>{scene.title}</h1> : <h2 id={`${scene.id}-title`}>{scene.title}</h2>}</div>
          <Link className="interest-visit" href={scene.href}>기록 보기 <ArrowUpRight size={15} /></Link>
        </div>
      </section>)}
    </div>
  );
}
