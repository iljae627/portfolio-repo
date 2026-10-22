"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="shell nav">
        <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
          정일재<span>.</span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="navigation"
          aria-label="주 메뉴"
          className={open ? "nav-links open" : "nav-links"}
        >
          {[
            ["/", "홈"],
            ["/projects", "프로젝트"],
            ["/archive", "아카이브"],
            ["/about", "소개"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href || (href === "/projects" && path.startsWith("/work/")) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <a className="nav-contact" href="mailto:iljae627@gmail.com">
          연락하기 <ArrowUpRight size={16} />
        </a>
      </div>
    </header>
  );
}
