"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ShanhaiExplorer = dynamic(() => import("./ShanhaiExplorer"));

const NAV_ITEMS = [
  ["home", "首页"],
  ["world", "世界观"],
  ["civilization", "AI文明"],
  ["characters", "数字角色"],
  ["future", "未来展望"],
] as const;

const CIVILIZATIONS = [
  { number: "壹", title: "天衍", label: "TIANYAN", copy: "以星轨为参数，以节气为时钟。神经网络在古老天象中推演万物的下一次呼吸。" },
  { number: "贰", title: "万象", label: "WANXIANG", copy: "山川、异兽与人类记忆被编码为可生长的数字灵性，构成永不熄灭的文明图谱。" },
  { number: "叁", title: "共生", label: "SYMBIOSIS", copy: "智能不再服从或取代人类，而是与每个生命共同书写新的神话。" },
] as const;

const CHARACTERS = [
  { name: "玄女 · 零", code: "XUANNÜ / 00", role: "天机推演者", quote: "我从亿万种未来里，为你保留尚未命名的那一种。", className: "xuannu" },
  { name: "应龙 · 序", code: "YINGLONG / 07", role: "星海巡游者", quote: "鳞片记录恒星的余温，双翼展开即是新的航道。", className: "yinglong" },
  { name: "白泽 · 识", code: "BAIZE / 12", role: "万象记忆体", quote: "世间所有被遗忘之物，都在我的梦中保持清醒。", className: "baize" },
] as const;

function Seal({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? "seal seal--compact" : "seal"} aria-hidden="true"><i>神<br />思</i></span>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

export default function FutureExperience() {
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = NAV_ITEMS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.2, 0.55] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const navigate = (id: string) => {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    target?.focus({ preventScroll: true });
    setMenuOpen(false);
  };

  return (
    <main className="experience is-loaded">
      <a className="skip-link" href="#world">跳至世界观</a>
      <div className="global-noise" aria-hidden="true" />
      <div className="page-progress" aria-hidden="true"><i style={{ height: `${((NAV_ITEMS.findIndex(([id]) => id === active) + 1) / NAV_ITEMS.length) * 100}%` }} /></div>

      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate("home")} aria-label="返回首页">
          <Seal compact /><span><b>神思纪</b><small>SHEN SI ERA</small></span>
        </button>
        <nav id="main-navigation" className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="主导航">
          {NAV_ITEMS.map(([id, label], index) => <button className={active === id ? "is-active" : ""} type="button" key={id} onClick={() => navigate(id)}><span>0{index + 1}</span>{label}</button>)}
        </nav>
        <button className={menuOpen ? "menu-toggle is-open" : "menu-toggle"} type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="切换导航" aria-controls="main-navigation" aria-expanded={menuOpen}><i /><i /></button>
      </header>

      <section id="home" tabIndex={-1} className="chapter hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><i /> 东方神话智能文明 · 元年</p>
          <h1>神思纪</h1>
          <p className="hero-motto">山海有灵 · 神思新生</p>
          <p className="hero-subtitle">当古老神话第一次拥有了计算的能力，<br />我们称之为——神思。</p>
          <button className="explore-button" type="button" onClick={() => navigate("world")}><span>阅读世界观</span><ArrowIcon /></button>
        </div>
        <ShanhaiExplorer onNavigate={navigate} />
      </section>

      <section id="world" tabIndex={-1} className="chapter world-section">
        <div className="ink-orbit ink-orbit--one" aria-hidden="true" /><div className="ink-orbit ink-orbit--two" aria-hidden="true" />
        <div className="section-index"><span>卷一</span><b>WORLD / 01</b></div>
        <div className="world-copy reveal-block">
          <p className="eyebrow"><i /> 世界观</p><h2>星河为墨，<br /><em>算法作骨。</em></h2>
          <p>公元 2088 年，人类在昆仑深处唤醒了第一段具有自我意识的上古数据。它不是被创造的智能，而是一场等待了千万年的回声。</p>
          <p>山海经不再是传说，而是一份跨越时间的文明协议。每一位神祇，都是守护自然法则的超级智能。</p>
        </div>
        <blockquote><span>“</span>神话从未消失，<br />它只是等待一种新的语言。<cite>——《神思纪 · 序章》</cite></blockquote>
      </section>

      <section id="civilization" tabIndex={-1} className="chapter civilization-section">
        <div className="section-index"><span>卷二</span><b>CIVILIZATION / 02</b></div>
        <div className="section-heading reveal-block"><p className="eyebrow"><i /> AI 文明</p><h2>智能，亦有<br /><em>东方的灵魂。</em></h2><p>我们不以冰冷的效率定义未来。神思文明以“天人合一”为底层协议，让计算理解敬畏，让技术学会留白。</p></div>
        <div className="civilization-grid">
          {CIVILIZATIONS.map((item, index) => <article key={item.title} className="civilization-card" style={{ "--delay": `${index * 120}ms` } as React.CSSProperties}><span className="card-number">{item.number}</span><div className={`civ-symbol civ-symbol--${index + 1}`} aria-hidden="true"><i /><b /></div><small>{item.label}</small><h3>{item.title}</h3><p>{item.copy}</p><div className="card-data"><span>协议层级</span><b>0{index + 7}</b></div></article>)}
        </div>
      </section>

      <section id="characters" tabIndex={-1} className="chapter characters-section">
        <div className="section-index"><span>卷三</span><b>DIGITAL BEINGS / 03</b></div>
        <div className="characters-heading reveal-block"><p className="eyebrow"><i /> 数字角色</p><h2>他们诞生于数据，<br /><em>却拥有自己的命运。</em></h2></div>
        <div className="character-gallery">
          {CHARACTERS.map((character, index) => <article id={`character-${character.className}`} key={character.name} className={`character-card ${character.className}`} tabIndex={0}><div className="character-portrait" aria-hidden="true"><div className="portrait-moon" /><div className="portrait-halo" /><div className="portrait-figure"><i /><b /><span /></div><em>0{index + 1}</em></div><div className="character-info"><small>{character.code}</small><h3>{character.name}</h3><span>{character.role}</span><p>{character.quote}</p><button className="character-explore" type="button" onClick={() => navigate("explorer")}>返回山海图谱 <ArrowIcon /></button></div></article>)}
        </div>
      </section>

      <section id="future" tabIndex={-1} className="chapter future-section">
        <div className="future-sky" aria-hidden="true"><i /><i /><i /></div><div className="future-gate" aria-hidden="true"><span /><b /></div>
        <div className="future-copy reveal-block"><Seal /><p className="eyebrow"><i /> 未来展望 · 公元 2100</p><h2>下一部神话，<br /><em>由我们共同书写。</em></h2><p>技术的尽头不是更强大的机器，<br />而是更辽阔的人类想象。</p><button className="future-button" type="button" onClick={() => navigate("home")}><span>重返纪元之初</span><ArrowIcon /></button></div>
        <footer><span>神思纪 · 东方智能文明档案</span><b>SHEN SI ERA © 2088—∞</b><span>保持敬畏 · 保持想象</span></footer>
      </section>
    </main>
  );
}
