import {
  ArrowUpRight,
  Radio,
  Terminal,
  Network,
  Fingerprint,
  Code2,
  Smartphone,
} from "lucide-react";
const icons = {
  response: Radio,
  bytecode: Terminal,
  protocol: Network,
  forensics: Fingerprint,
  web: Code2,
  android: Smartphone,
};
export default function ProjectVisual({ project }) {
  const Icon = icons[project.visual] || Code2;
  return (
    <div className={`project-visual ${project.visual}`} aria-hidden="true">
      <div className="visual-top">
        <span>{project.category}</span>
        <ArrowUpRight size={18} />
      </div>
      <div className="visual-center">
        <Icon strokeWidth={0.8} />
        <span className="visual-orbit" />
        <span className="visual-orbit second" />
      </div>
      <div className="visual-bottom">
        <span>
          {project.visual === "bytecode"
            ? "QPUSH → QPOP → STASH"
            : project.visual === "protocol"
              ? "CLIENT ⇄ DNS ⇄ SERVER"
              : project.visual === "response"
                ? "DETECT → ANALYZE → RESPOND"
                : project.tags.slice(0, 3).join(" / ")}
        </span>
        <span>0{(project.visual.length % 6) + 1}</span>
      </div>
    </div>
  );
}
