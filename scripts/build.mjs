import { existsSync, rmSync } from "fs";
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
  });
}

async function buildCss() {
  await esbuild.build({
    ...COMMON_CONFIG,
    entryPoints: ["src/VoicemailPlayer.css"],
  });
}

await Promise.all([buildJs("esm"), buildJs("cjs"), buildCss()]);
