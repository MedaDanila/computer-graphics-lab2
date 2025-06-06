import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  build: {
    target: "es2019",
    assetsInlineLimit: 100000000, // Инлайнит все ресурсы
    outDir: "dist",
    rollupOptions: {
      output: {
        format: "es",
        generatedCode: {
          optionalChaining: false,
        },
      },
    },
  },
});
