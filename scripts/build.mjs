import { existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import * as esbuild from "esbuild";

if (existsSync("dist")) {
  rmSync("dist", { recursive: true });
}

const COMMON_CONFIG = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: [
    "chrome84",
    "firefox63",
    "safari14.1",
    "edge84",
    "ios14.5",
    "opera70",
  ],
  outdir: "dist",
  entryNames: "react-voicemail-player",
};

async function buildJs(format) {
  await esbuild.build({
    ...COMMON_CONFIG,
    entryPoints: ["src/VoicemailPlayer.tsx"],
    external: ["react"],
    format,
    outExtension: { ".js": `.${format}.js` },
    globalName: format === "iife" ? "ReactVoicemailPlayer" : undefined,
  });
}

async function buildCss() {
  await esbuild.build({
    ...COMMON_CONFIG,
    entryPoints: ["src/VoicemailPlayer.css"],
  });
}

function buildTypes() {
  return new Promise((resolve, reject) => {
    const child = spawn("tsc", ["--project", "tsconfig.prod.json"], {
      stdio: "inherit",
    });

    child.on("error", (err) => {
      console.error("Child process could not be spawned", err);
      reject(err);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("typescript compilation failed"));
      }
    });
  });
}

await Promise.all([
  buildJs("esm"),
  buildJs("cjs"),
  buildJs("iife"),
  buildCss(),
  buildTypes(),
]);
