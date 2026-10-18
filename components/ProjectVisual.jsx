import {
  ArrowUpRight,
  Radio,
  Terminal,
  Network,
  Fingerprint,
  Code2,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { media } from "@/lib/media";
const icons = {
  response: Radio,
  bytecode: Terminal,
  protocol: Network,
  forensics: Fingerprint,
  web: Code2,
  android: Smartphone,
};
const captions = {
  response: ["17위", "CCE 2026 본선 · 팀 성과"],
  bytecode: ["Bytecode", "커스텀 VM을 이해하는 과정"],
  protocol: ["DS / 3DS", "레거시 통신을 직접 연결하다"],
  android: ["14 / 14", "HexTree Android Track 완료"],
  forensics: ["Follow the trace.", "기록 속 단서를 연결하는 분석"],
  web: ["InfoSec Hub", "배운 지식을 하나의 서비스로"],
};
export default function ProjectVisual({ project }) {
  if (project.visual === "protocol") return (
    <div className="project-visual with-image protocol">
      <div className="project-image protocol-image"><Image src="/images/portfolio/mystery-gift-flow.png" alt="3DS와 DNS·인증·이상한소포 배포 서버 사이 통신 흐름도" fill sizes="(max-width: 700px) calc(100vw - 40px), 540px" /></div>
      <div className="project-image-caption"><span>프로젝트의 출발점 · manatails 분석 글</span><strong>DS / 3DS · 배포 통신의 흐름</strong></div>
    </div>
  );
  if (project.visual === "android") return (
    <div className="project-visual with-image android">
      <div className="project-image">
        <Image src={media.hextree.src} alt={media.hextree.alt} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 45vw, 540px" />
      </div>
      <div className="project-image-caption"><span>실제 학습 기록</span><strong>HexTree Android Track · 14 / 14</strong></div>
    </div>
  );
  const Icon = icons[project.visual] || Code2;
  const [headline, caption] = captions[project.visual] || [project.name, project.category];
  return (
    <div className={`project-visual ${project.visual}`} aria-hidden="true">
      <div className="visual-top">
        <span>{project.category}</span>
        <Icon size={24} strokeWidth={1.7} />
      </div>
      <div className="visual-center">
        <strong>{headline}</strong>
        <span>{caption}</span>
      </div>
      <div className="visual-bottom">
        <span>{project.tags.slice(0, 3).join(" · ")}</span>
        <ArrowUpRight size={17} />
      </div>
    </div>
  );
}
