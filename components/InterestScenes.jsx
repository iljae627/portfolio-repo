"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const scenes = [
  {id: "forensics", label: "DIGITAL FORENSICS", title: "흔적을 잇다.", image: "/images/interests/forensics.png", alt: "저장장치와 확대 렌즈로 디지털 포렌식을 표현한 컨셉 이미지", href: "/work/digital-forensics"},
  {id: "android", label: "ANDROID SECURITY", title: "앱의 경계를 보다.", image: "/images/interests/android.png", alt: "스마트폰과 안드로이드 로봇으로 모바일 보안을 표현한 컨셉 이미지", href: "/work/android-security"},
  {id: "reversing", label: "REVERSE ENGINEERING", title: "안쪽의 원리를 읽다.", image: "/images/interests/reversing.png", alt: "층으로 분리된 프로세서와 회로로 리버스 엔지니어링을 표현한 컨셉 이미지", href: "/work/defcon-bbbq"},
];
const clamp = value => Math.min(1, Math.max(0, value));

export default function InterestScenes() {
  const root = useRef(null);
  const [active, setActive] = useState(null);
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
        if (rect.bottom < 0 || rect.top > height * 1.5) continue;
        const reveal = clamp((height - rect.top) / (height * .8));
        const progress = clamp((header - rect.top) / Math.max(1, rect.height - height + header));
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
          <div className="interest-art"><Image src={scene.image} alt={scene.alt} fill sizes="(max-width: 700px) 165vw, 100vw" /></div>
          <div className="interest-copy"><span>{scene.label}</span><h2 id={`${scene.id}-title`}>{scene.title}</h2></div>
          <Link className="interest-visit" href={scene.href}>기록 보기 <ArrowUpRight size={15} /></Link>
        </div>
      </section>)}
    </div>
  );
}
