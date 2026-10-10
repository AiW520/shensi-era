import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { PerspectiveCamera, Vector3 } from "three";

async function ready(page: Page) {
  await page.goto("./");
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await expect(page.locator(".shanhai-stage canvas")).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".scene-loading")).toHaveCount(0);
  await page.waitForTimeout(600);
}

async function pixels(page: Page) {
  const png = await page.locator(".shanhai-stage canvas").screenshot();
  const decoded = PNG.sync.read(png);
  let lit = 0;
  const colors = new Set<string>();
  for (let index = 0; index < decoded.data.length; index += 4) if (decoded.data[index] + decoded.data[index + 1] + decoded.data[index + 2] > 160) lit++;
  for (let index = 0; index < decoded.data.length; index += 160) colors.add(`${decoded.data[index] >> 4},${decoded.data[index+1] >> 4},${decoded.data[index+2] >> 4}`);
  expect(lit / (decoded.width * decoded.height)).toBeGreaterThan(0.01);
  expect(colors.size).toBeGreaterThan(20);
  return png;
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 800 }]) {
  test(`scene and controls at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = []; const failures: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => { if (response.status() >= 400) failures.push(response.url()); });
    await ready(page);
    await expect(page.getByRole("button", { name: "开启音效", exact: true })).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "开启音效", exact: true }).click();
    await expect(page.getByRole("button", { name: "关闭音效", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "关闭音效", exact: true }).click();
    await page.getByRole("button", { name: "暂停巡游", exact: true }).click();
    const before = await pixels(page);
    await page.getByRole("button", { name: "镜头向右环绕", exact: true }).click();
    expect((await pixels(page)).equals(before)).toBe(false);
    await page.getByRole("button", { name: "拉近镜头", exact: true }).click();
    expect((await pixels(page)).equals(before)).toBe(false);
    await page.getByRole("button", { name: "重置镜头", exact: true }).click();
    await page.waitForTimeout(160);
    await page.locator(".shanhai-stage canvas").scrollIntoViewIfNeeded();
    const canvas = await page.locator(".shanhai-stage canvas").boundingBox();
    const camera = new PerspectiveCamera(45, canvas!.width / canvas!.height, 0.1, 100);
    camera.position.set(viewport.width < 600 ? 9 : 6, viewport.width < 600 ? 7.6 : 5.5, viewport.width < 600 ? 11.5 : 8);
    camera.lookAt(0, 0.9, 0); camera.updateMatrixWorld();
    const point = new Vector3(-3.8, 2.65, 1.6).project(camera);
    await page.mouse.click(canvas!.x + (point.x + 1) / 2 * canvas!.width, canvas!.y + (1 - point.y) / 2 * canvas!.height);
    await expect(page.locator(".shanhai-detail h4")).toHaveText("蓬莱节点");
    if(viewport.width < 600) await page.getByRole("button", {name: "启用触屏镜头", exact: true}).click();
    const dragBefore = await pixels(page);
    await page.mouse.move(canvas!.x + canvas!.width / 2, canvas!.y + canvas!.height * 0.6);
    await page.mouse.down(); await page.mouse.move(canvas!.x + canvas!.width / 2 + 70, canvas!.y + canvas!.height * 0.65, { steps: 8 }); await page.mouse.up();
    expect((await pixels(page)).equals(dragBefore)).toBe(false);
    await page.getByRole("group", { name: "山海节点列表" }).getByRole("button", { name: /蓬莱节点/ }).click();
    await expect(page.locator(".shanhai-detail h4")).toHaveText("蓬莱节点");
    await expect(page.locator(".shanhai-heading > span")).toContainText("2 / 4");
    expect((await pixels(page)).equals(before)).toBe(false);
    await page.getByRole("button", { name: "应龙 · 序", exact: true }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "应龙 · 序", exact: true }).click();
    await expect(page.locator("#character-yinglong")).toBeFocused();
    await page.locator("#character-yinglong").getByRole("button", { name: "返回山海图谱" }).click();
    await expect(page.locator(".shanhai-detail h4")).toHaveText("蓬莱节点");
    await page.getByRole("button", { name: "切换平面地图", exact: true }).click();
    await expect(page.locator(".shanhai-dom-map")).toBeVisible();
    await page.locator(".shanhai-dom-map").getByRole("button", { name: "归墟深层" }).click();
    await expect(page.locator(".shanhai-detail h4")).toHaveText("归墟深层");
    await page.getByRole("button", { name: "切换三维场景", exact: true }).click();
    await expect(page.locator(".shanhai-stage canvas")).toBeVisible();
    await page.getByLabel("画质", { exact: true }).selectOption("eco");
    await expect(page.getByRole("button", { name: "开始巡游", exact: true })).toBeDisabled();
    await pixels(page);
    await page.getByLabel("画质", { exact: true }).selectOption("high");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.width < 600) {
      await page.getByRole("button", {name:"关闭触屏镜头",exact:true}).click();
      await expect(page.locator(".shanhai-stage canvas")).toHaveCSS("touch-action", "pan-y");
      await page.getByRole("button", { name: "切换导航" }).click();
      await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "切换导航" })).toHaveAttribute("aria-expanded", "false");
    }
    expect(errors).toEqual([]); expect(failures).toEqual([]);
  });
}

test("first viewport renders brand and actual 3D terrain without scrolling",async({page})=>{
  await page.goto("./");
  await expect(page.getByRole("heading",{name:"神思纪",exact:true})).toBeVisible();
  await expect(page.locator(".shanhai-stage canvas")).toBeVisible({timeout:30000});
  await page.waitForTimeout(800);
  await pixels(page);
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(80);
});

test("reduced motion keeps the scene static and DOM navigation usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.getByRole("button", { name: "暂停巡游", exact: true })).toBeDisabled();
  await expect(page.locator(".cosmos-canvas canvas")).toHaveCount(0);
  const before = await pixels(page);
  await page.waitForTimeout(450);
  expect((await pixels(page)).equals(before)).toBe(true);
  await page.getByRole("group", { name: "山海节点列表" }).getByRole("button", { name: /天问网络/ }).click();
  await expect(page.locator(".shanhai-detail h4")).toHaveText("天问网络");
});

test("node search, filter and empty state preserve the selected details", async ({page}) => {
  await ready(page);
  await page.getByRole("group", {name:"探索状态筛选"}).getByRole("button", {name:"未探索",exact:true}).click();
  await expect(page.getByRole("group",{name:"山海节点列表"}).getByRole("button",{name:/昆仑核心/})).toHaveCount(0);
  await page.getByRole("searchbox",{name:"搜索节点或角色"}).fill("白泽");
  await page.getByRole("group",{name:"山海节点列表"}).getByRole("button",{name:/归墟深层/}).click();
  await expect(page.locator(".shanhai-detail h4")).toHaveText("归墟深层");
  await expect(page.locator(".node-empty")).toBeVisible();
  await page.getByRole("button",{name:"重置筛选",exact:true}).click();
  await expect(page.getByRole("group",{name:"山海节点列表"}).getByRole("button")).toHaveCount(4);
  await page.getByRole("searchbox",{name:"搜索节点或角色"}).fill("不存在");
  await expect(page.locator(".node-empty")).toContainText("没有匹配节点");
  await page.getByRole("button",{name:"清除搜索",exact:true}).click();
  await expect(page.getByRole("group",{name:"山海节点列表"}).getByRole("button")).toHaveCount(4);
});

test("巡游 changes actual scene pixels and resumes after pausing", async ({ page }) => {
  await ready(page);
  const before = await pixels(page);
  await page.waitForTimeout(700);
  expect((await pixels(page)).equals(before)).toBe(false);
  await page.getByRole("button", { name: "暂停巡游", exact: true }).click();
  await expect(page.getByRole("button", { name: "开始巡游", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "开始巡游", exact: true }).click();
  await expect(page.getByRole("button", { name: "暂停巡游", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("low power devices automatically use demand rendering and single pixel ratio", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 2 });
  });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await expect(page.locator(".shanhai-stage canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: "暂停巡游", exact: true })).toBeDisabled();
  await expect(page.locator(".cosmos-canvas canvas")).toHaveCount(0);
  expect(await page.locator(".shanhai-stage canvas").getAttribute("width")).toBe("390");
  await context.close();
});

test("touch input selects a scene node and operates mobile controls", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await page.locator(".shanhai-stage canvas").waitFor();
  await page.getByRole("button", { name: "暂停巡游", exact: true }).tap();
  await page.getByRole("button", { name: "重置镜头", exact: true }).tap();
  await page.locator(".shanhai-stage canvas").scrollIntoViewIfNeeded();
  const canvas = await page.locator(".shanhai-stage canvas").boundingBox();
  const camera = new PerspectiveCamera(45, canvas!.width / canvas!.height, 0.1, 100);
  camera.position.set(9, 7.6, 11.5); camera.lookAt(0, 0.9, 0); camera.updateMatrixWorld();
  const point = new Vector3(3.6, 2.95, -1.6).project(camera);
  await page.touchscreen.tap(canvas!.x + (point.x + 1) / 2 * canvas!.width, canvas!.y + (1 - point.y) / 2 * canvas!.height);
  await expect(page.locator(".shanhai-detail h4")).toHaveText("天问网络");
  await page.getByRole("button", { name: "切换平面地图", exact: true }).tap();
  await expect(page.locator(".shanhai-dom-map")).toBeVisible();
  await context.close();
});

test("WebGL unavailable uses an operable DOM atlas", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      return /webgl/.test(kind) ? null : original.apply(this, [kind, ...args] as never);
    } as typeof original;
  });
  await page.goto("./");
  await page.locator("#explorer").scrollIntoViewIfNeeded();
  await expect(page.locator(".shanhai-stage canvas")).toHaveCount(0);
  await page.locator(".shanhai-dom-map").getByRole("button", { name: "归墟深层" }).click();
  await page.getByRole("button", { name: "白泽 · 识", exact: true }).click();
  await expect(page.locator("#character-baize")).toBeFocused();
});

test("context loss preserves node selection and chapter links", async ({ page }) => {
  await ready(page);
  await page.locator(".shanhai-stage canvas").evaluate((canvas) => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await expect(page.locator(".shanhai-dom-map")).toBeVisible();
  await page.locator(".shanhai-dom-map").getByRole("button", { name: "天问网络" }).click();
  await page.getByRole("button", { name: "进入AI 文明", exact: true }).click();
  await expect(page.locator("#civilization")).toBeFocused();
});

test("static export contains story, characters, atlas and correct subpath assets without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator("#world")).toContainText("公元 2088 年");
  await expect(page.locator("#characters")).toContainText("玄女 · 零");
  await expect(page.locator(".shanhai-controls")).toContainText("归墟深层");
  expect(await page.locator("link[rel=stylesheet]").first().getAttribute("href")).toMatch(/^\/shensi-era\/_next\//);
  await context.close();
});
