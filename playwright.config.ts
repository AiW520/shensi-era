import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 180000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.TEST_URL ?? "http://127.0.0.1:4315/shensi-era/",
    launchOptions: {
      executablePath: process.env.CHROME_PATH ?? (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined),
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
});
