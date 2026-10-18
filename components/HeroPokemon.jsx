"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import collection from "@/data/pokemon.json";

export default function HeroPokemon() {
  // A stable initial image keeps the static page and client hydration identical.
  const [id, setId] = useState(25);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const current = useRef(25);
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
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") changePokemon();
    }, 10000);
    return () => clearInterval(timer);
  }, [changePokemon]);
  const name = collection.pokemon[id - 1].name;
  const src = unavailable ? "/images/portfolio/hero-seal.png" : `/images/pokemon/${id}.png`;
  return (
    <button type="button" className="character-float pokemon-switch" onClick={changePokemon}
      aria-label={`다른 포켓몬 보기. 현재 ${name}, 전국도감 ${id}번`} data-pokemon-id={id}>
      <Image key={src} src={src} alt={`${name} · 전국도감 ${id}번 포켓몬`} width={225} height={225}
        sizes="(max-width: 700px) 160px, 190px" loading="eager"
        className={loaded ? "pokemon-image ready" : "pokemon-image"}
        onLoad={() => setLoaded(true)} onError={() => setUnavailable(true)} />
    </button>
  );
}
