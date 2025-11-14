import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";
import logseqDevPlugin from "vite-plugin-logseq";

export default defineConfig({
  plugins: [
    reactPlugin(),
    logseqDevPlugin()
  ],
  build: {
    target: "esnext",
    minify: "esbuild",
  }
})
