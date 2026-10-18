"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import collection from "@/data/pokemon.json";

export default function HeroPokemon({compact = false}) {
  // A stable initial image keeps the static page and client hydration identical.
  const [id, setId] = useState(25);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const current = useRef(25);
  const button = useRef(null);
  const visible = useRef(true);
  const changePokemon = useCallback(() => {
    const candidate = 1 + Math.floor(Math.random() * (collection.count - 1));
    const next = candidate >= current.current ? candidate + 1 : candidate;
    current.current = next;
    setLoaded(false);
    setUnavailable(false);
    setId(next);
  }, []);
  useEffect(() => {
    changePokemon();
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; });
    observer.observe(button.current);
    const timer = setInterval(() => {
      if (visible.current && document.visibilityState === "visible") changePokemon();
    }, 10000);
    return () => { clearInterval(timer); observer.disconnect(); };
  }, [changePokemon]);
  const name = collection.pokemon[id - 1].name;
  const src = unavailable ? "/images/portfolio/hero-seal.png" : `/images/pokemon/${id}.png`;
  return (
    <button ref={button} type="button" className={`${compact ? 'header-pokemon' : 'character-float'} pokemon-switch`} onClick={changePokemon}
      aria-label={`다른 포켓몬 보기. 현재 ${name}, 전국도감 ${id}번`} data-pokemon-id={id}>
      <Image key={src} src={src} alt={`${name} · 전국도감 ${id}번 포켓몬`} width={225} height={225}
        sizes={compact ? '36px' : '(max-width: 700px) 160px, 190px'} loading="eager"
        className={loaded ? "pokemon-image ready" : "pokemon-image"}
        onLoad={() => setLoaded(true)} onError={() => setUnavailable(true)} />
    </button>
  );
}
