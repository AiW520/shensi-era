"use client";

import dynamic from "next/dynamic";
import { Compass, Map, Pause, Play, RotateCcw, Volume2, VolumeX, ZoomIn, ZoomOut, ArrowUpRight, RotateCw, Search, X, Mountain, Hand, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NODES } from "./shanhai-data";
import { SceneBoundary, useSceneEnvironment } from "./SceneEnvironment";

const ShanhaiScene = dynamic(() => import("./ShanhaiScene"), { ssr: false, loading: () => <div className="scene-loading" role="status"><LoaderCircle size={26} /><span>山海图谱载入中</span></div> });

export type CameraCommand = { action: "reset" | "left" | "right" | "in" | "out"; sequence: number };

export default function ShanhaiExplorer({ onNavigate }: { onNavigate: (id: string) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const environment = useSceneEnvironment(stageRef);
  const [selectedId, setSelectedId] = useState("kunlun");
  const [visited, setVisited] = useState<string[]>(["kunlun"]);
  const [quality, setQuality] = useState("auto");
  const [motion, setMotion] = useState(true);
  const [flat, setFlat] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sceneStarted, setSceneStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [touchCamera, setTouchCamera] = useState(false);
  const [command, setCommand] = useState<CameraCommand>({ action: "reset", sequence: 0 });
  const audioRef = useRef<AudioContext | null>(null);
  const selected = NODES.find((node) => node.id === selectedId) ?? NODES[0];
  const lowPower = quality === "eco" || (quality === "auto" && environment.lowPower);
  const playing = motion && !environment.reducedMotion && !lowPower && environment.visible;
  const showScene = environment.webgl && !failed && !flat;
  const failScene = useCallback(() => setFailed(true), []);
  const matches = NODES.filter((node) => (filter === "all" || (filter === "visited" ? visited.includes(node.id) : !visited.includes(node.id))) && `${node.label}${node.character}${node.detail}`.includes(query.trim()));

  useEffect(() => { if (environment.visible) setSceneStarted(true); }, [environment.visible]);
  useEffect(() => () => { void audioRef.current?.close(); }, []);
  useEffect(() => {
    if (!environment.visible) void audioRef.current?.suspend();
  }, [environment.visible]);

  function sound(index: number) {
    if (muted || !audioRef.current) return;
    const context = audioRef.current;
    void context.resume().then(() => {
      if (context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = [261.63, 329.63, 392, 440][index];
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, context.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }).catch(() => setMuted(true));
  }

  function select(id: string) {
    setSelectedId(id);
    setVisited((previous) => previous.includes(id) ? previous : [...previous, id]);
    sound(NODES.findIndex((node) => node.id === id));
  }

  function camera(action: CameraCommand["action"]) {
    setCommand((previous) => ({ action, sequence: previous.sequence + 1 }));
  }

  function toggleAudio() {
    if (!muted) { setMuted(true); void audioRef.current?.suspend(); return; }
    try {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume().then(() => setMuted(false)).catch(() => setMuted(true));
    } catch { setMuted(true); }
  }

  return <div id="explorer" tabIndex={-1} role="region" aria-label="山海图谱" className="shanhai-explorer">
    <div className="shanhai-heading"><div><Mountain size={19} /><h3>山海图谱</h3><small>文明元年 · 2088</small></div><span aria-label={`已探索 ${visited.length} 个节点，共 ${NODES.length} 个`}>{visited.length} / {NODES.length}<small>已探索</small></span></div>
    <div ref={stageRef} className="shanhai-stage" aria-label="山海三维探索场景">
      {showScene && sceneStarted ? <><div className="scene-fallback-layer" aria-hidden="true" inert><DomMap selectedId={selectedId} onSelect={select} /></div><SceneBoundary onFailure={failScene} fallback={<DomMap selectedId={selectedId} onSelect={select} />}>
        <ShanhaiScene selectedId={selectedId} onSelect={select} lowPower={lowPower} playing={playing} visible={environment.visible} reducedMotion={environment.reducedMotion} touchCamera={touchCamera} command={command} onFailure={failScene} />
      </SceneBoundary></> : <DomMap selectedId={selectedId} onSelect={select} />}
      <div className="shanhai-stage-label" aria-hidden="true"><span>昆仑 · 蓬莱 · 天问 · 归墟</span><small>{showScene ? "山海全景" : "节点地图"}</small></div>
      <span className="shanhai-location" aria-hidden="true">{selected.label}<small>{selected.coordinate}</small></span>
    </div>
    <div className="shanhai-toolbar" role="group" aria-label="探索视图控制">
      <div className="scene-modes" role="group" aria-label="场景模式"><button type="button" aria-label="切换三维场景" aria-pressed={!flat} onClick={() => setFlat(false)}><Mountain size={15} />三维</button><button type="button" aria-label="切换平面地图" aria-pressed={flat} onClick={() => setFlat(true)}><Map size={15} />地图</button></div>
      <div className="shanhai-tools">
        <Tool label="镜头向左环绕" disabled={!showScene} onClick={() => camera("left")}><RotateCcw size={18} /></Tool>
        <Tool label="镜头向右环绕" disabled={!showScene} onClick={() => camera("right")}><RotateCw size={18} /></Tool>
        <Tool label="拉近镜头" disabled={!showScene} onClick={() => camera("in")}><ZoomIn size={18} /></Tool>
        <Tool label="拉远镜头" disabled={!showScene} onClick={() => camera("out")}><ZoomOut size={18} /></Tool>
        <Tool label="重置镜头" disabled={!showScene} onClick={() => camera("reset")}><Compass size={18} /></Tool>
        <Tool label={motion ? "暂停巡游" : "开始巡游"} pressed={motion && !environment.reducedMotion && !lowPower} disabled={!showScene || environment.reducedMotion || lowPower} onClick={() => setMotion((value) => !value)}>{motion ? <Pause size={18} /> : <Play size={18} />}</Tool>
        <Tool label={muted ? "开启音效" : "关闭音效"} pressed={!muted} onClick={toggleAudio}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</Tool>
        <span className="touch-camera-tool"><Tool label={touchCamera ? "关闭触屏镜头" : "启用触屏镜头"} pressed={touchCamera} disabled={!showScene} onClick={() => setTouchCamera((value) => !value)}><Hand size={18} /></Tool></span>
      </div>
      <label className="shanhai-quality">画质<select aria-label="画质" value={quality} onChange={(event) => setQuality(event.target.value)}><option value="auto">自动</option><option value="eco">节能</option><option value="high">精细</option></select></label>
    </div>
    <div className="node-browser"><div className="node-filters" role="group" aria-label="探索状态筛选">{[["all", "全部"], ["visited", "已探索"], ["new", "未探索"]].map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div><label className="node-search"><Search size={15} /><input type="search" aria-label="搜索节点或角色" placeholder="节点 / 角色" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" aria-label="清除搜索" onClick={() => setQuery("")}><X size={14} /></button>}</label></div>
    <div className="shanhai-controls" role="group" aria-label="山海节点列表">
      {matches.map((node) => <button key={node.id} type="button" aria-pressed={node.id === selectedId} className={node.id === selectedId ? "is-active" : ""} onClick={() => select(node.id)}><span>0{NODES.findIndex((item) => item.id === node.id) + 1}</span>{node.label}<i className={visited.includes(node.id) ? "is-visited" : ""} aria-label={visited.includes(node.id) ? "已探索" : "未探索"} /></button>)}
      {matches.length === 0 && <div className="node-empty" role="status">没有匹配节点<button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>重置筛选</button></div>}
    </div>
    <article className="shanhai-detail" aria-live="polite" aria-atomic="true">
      <div><small>{selected.coordinate} · {selected.chapterLabel}</small><h4>{selected.label}</h4><p>{selected.detail}</p></div>
      <div className="shanhai-detail-actions"><button type="button" onClick={() => onNavigate(selected.chapter)}>进入{selected.chapterLabel}<ArrowUpRight size={16} /></button>{selected.character && <button type="button" className="is-quiet" onClick={() => onNavigate(selected.characterId!)}>{selected.character}<ArrowUpRight size={16} /></button>}</div>
    </article>
    {(!environment.webgl || failed) && environment.ready && <p className="shanhai-status" role="status">三维场景暂不可用，已切换节点地图。</p>}
    {environment.reducedMotion && <p className="shanhai-status">减少动效已开启</p>}
  </div>;
}

function Tool({ label, pressed, disabled, onClick, children }: { label: string; pressed?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="shanhai-tool" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} title={label}>{children}<span className="tool-tip" role="tooltip">{label}</span></button>;
}

function DomMap({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return <div className="shanhai-dom-map" aria-label="山海节点平面地图">
    <div className="shanhai-dom-mountains" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    {NODES.map((node) => <button key={node.id} aria-pressed={selectedId === node.id} className={`shanhai-dom-node shanhai-dom-node--${node.id} ${selectedId === node.id ? "is-selected" : ""}`} type="button" onClick={() => onSelect(node.id)}><span aria-hidden="true" />{node.label}</button>)}
  </div>;
}
