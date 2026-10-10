import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const prefix = process.env.PREVIEW_BASE_PATH ?? "/shensi-era";
const port = Number(process.env.PORT ?? 4315);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon" };

createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end(); return; }
  if (prefix && (pathname === "/" || pathname === prefix)) { response.writeHead(302, { Location: `${prefix}/` }).end(); return; }
  if (prefix && !pathname.startsWith(`${prefix}/`)) { response.writeHead(404).end(); return; }
  let file = resolve(root, `.${pathname.slice(prefix.length)}`);
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  if (!existsSync(file) || !statSync(file).isFile()) { response.writeHead(404).end(); return; }
  response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Static preview: http://127.0.0.1:${port}${prefix}/`));
