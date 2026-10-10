"use client";

import { Component, useEffect, useState, type RefObject, type ReactNode } from "react";

export function useSceneEnvironment(ref: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ ready: false, visible: false, webgl: false, reducedMotion: false, lowPower: false });
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      webgl = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { /* The DOM atlas remains available when WebGL is blocked. */ }
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    let intersects = false;
    const update = () => setState({ ready: true, visible: intersects && !document.hidden, webgl, reducedMotion: query.matches, lowPower });
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); }, { rootMargin: "150px" });
    if (ref.current) observer.observe(ref.current);
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer.disconnect(); query.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, [ref]);
  return state;
}

export class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
