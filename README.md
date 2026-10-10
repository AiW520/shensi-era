# 神思纪

东方神话智能文明叙事网站，基于 Next.js 15、React 19 与 Three.js。

## 本次改造

第二轮打磨：首页直接进入山海探索，层叠自然山体、云带、廊桥、翘檐楼阁与细水纹替换重复锥体与密集亮斑。增加三维/地图分段模式、节点/角色搜索、探索状态筛选、可重置空结果，以及默认允许手机页面滚动的触屏镜头开关。移动端额外覆盖 360x800。

路线 B：保留首页、世界观、AI 文明、数字角色、未来展望与原有文案；将世界观星图升级为山海探索层。程序化地形、水面、昆仑山台、蓬莱浮岛、天问观星塔、归墟遗迹与飞舟构成可环绕的三维场景。节点选择联动已有章节与具体角色，支持 DOM 列表点选、触屏点选/环绕/双指缩放、镜头按钮、巡游暂停、画质与音效开关。

音效默认关闭，开启后由 Web Audio 合成短音。减少动效默认静止；节能档使用按需渲染、较少地形网格及单倍像素比。离开场景、页面隐藏时停止渲染。WebGL2 不可用、Canvas 创建失败或上下文丢失时保留 DOM 地图与所有章节/角色入口。服务端静态 HTML 保留文案、角色和图谱内容；无 JavaScript 时可阅读和滚动浏览。

## 开发

```powershell
pnpm install --frozen-lockfile
pnpm dev --port 4315
pnpm typecheck
```

## GitHub Pages 生产预览

`next.config.mjs` 原有的 `output: "export"`、`trailingSlash`、`basePath` 和 `assetPrefix` 配置保持有效。在 GitHub Actions 中，项目名自动成为子路径。

```powershell
$env:GITHUB_ACTIONS = 'true'
$env:GITHUB_REPOSITORY = 'AiW520/shensi-era'
pnpm build
pnpm preview
```

预览地址：`http://127.0.0.1:4315/shensi-era/`。预览服务器仅监听本机，将子路径映射到 `out/`；不存在的资源返回 404，不以首页掩盖缺失。根路径导出可将 `PREVIEW_BASE_PATH` 设为空字符串。静态导出不能使用 `next start`，请使用预览脚本或静态服务器。

## 浏览器验证

先构建并运行静态预览，再执行 `pnpm test`。测试使用 `@playwright/test`，包含 1440x900、390x844、真实触屏、Canvas 非空像素、场景节点选择、镜头按钮/拖动、章节/角色联动、画质、无 WebGL、上下文丢失、减少动效、静态 HTML 与子路径资源验证。

Windows 默认使用 `C:/Program Files/Google/Chrome/Application/chrome.exe`。可通过 `CHROME_PATH` 指定浏览器，或在其他平台安装 Playwright Chromium。`TEST_URL` 可覆盖目标地址。软件 WebGL 用于可重复验证，不代表真实移动设备帧率。

## 源码与素材

克隆自 https://github.com/AiW520/shensi-era 的 `main`，起始版本 `2b991169d060a09a41bc4504e5518c512130ba59`。上游未包含 README、AGENTS.md、LICENSE 或素材目录。素材与许可说明见 `ASSET-NOTES.md`；本版本通过 `main` 分支的 GitHub Actions workflow 发布到 GitHub Pages。
