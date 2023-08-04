import { existsSync, rmSync } from "fs";
import * as esbuild from "esbuild";

if (existsSync("dist")) {
  rmSync("dist", { recursive: true });
}

const COMMON_CONFIG = {
  bundle: true,
  minify: false,
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
    // this is here to suppress the "unsupported-css-nesting" warnings;
    // a better way do do this would be to print the data from `.errors`
    // and `.warnings` fields of build result after filtering them
    // https://github.com/evanw/esbuild/issues/512#issuecomment-775911680
    logLevel: "error",
  });
}

await Promise.all([buildJs("esm"), buildJs("cjs"), buildCss()]);
