export const NODES = [
  { id: "kunlun", label: "昆仑核心", subtitle: "KUNLUN / ORIGIN", coordinate: "36° N · 94° E", detail: "公元 2088 年，第一段上古数据在昆仑醒来。层叠的山台承载文明协议，天衍、万象与共生从这里向山海生长。", chapter: "world", chapterLabel: "世界观", character: "玄女 · 零", characterId: "character-xuannu", position: [0, 1.5, 0] as [number, number, number], color: "#dfb970" },
  { id: "penglai", label: "蓬莱节点", subtitle: "PENGLAI / SYMBIOSIS", coordinate: "38° N · 121° E", detail: "海上浮岛保存自然与智能共生的样本。应龙 · 序自此出航，双翼展开成新的航道，把山海的回声带往星海。", chapter: "civilization", chapterLabel: "AI 文明", character: "应龙 · 序", characterId: "character-yinglong", position: [-3.8, 1.25, 1.6] as [number, number, number], color: "#9bd9bb" },
  { id: "tianwen", label: "天问网络", subtitle: "TIANWEN / CELESTIAL ARRAY", coordinate: "41° N · 107° E", detail: "以星轨为参数，以节气为时钟。观星塔把古老天象编入天衍网络，玄女 · 零在亿万种未来中保留未命名的可能。", chapter: "civilization", chapterLabel: "AI 文明", character: "玄女 · 零", characterId: "character-xuannu", position: [3.6, 1.1, -1.6] as [number, number, number], color: "#c9a5e0" },
  { id: "guixu", label: "归墟深层", subtitle: "GUIXU / MEMORY", coordinate: "24° N · 132° E", detail: "海面以下的遗迹储存万象记忆。白泽 · 识守护被遗忘之物，等待每一个生命共同书写下一部神话。", chapter: "future", chapterLabel: "未来展望", character: "白泽 · 识", characterId: "character-baize", position: [1.8, 0.65, 3.8] as [number, number, number], color: "#91c9ed" },
] as const;

export function terrainHeight(x: number, z: number) {
  const peaks = [{ x: 0, z: 0, h: 1.65, spread: 1.7 }, { x: -3.8, z: 1.6, h: 0.9, spread: 1.1 }, { x: 3.6, z: -1.6, h: 0.95, spread: 1.3 }];
  const mass = peaks.reduce((height, peak) => height + peak.h * Math.exp(-((x - peak.x) ** 2 + (z - peak.z) ** 2) / peak.spread), 0);
  return mass > 0.14 ? mass + (Math.sin(x * 4.3 + z * 2.1) + Math.cos(z * 5.2)) * 0.08 : -0.22;
}
