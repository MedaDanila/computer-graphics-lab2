import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.ELECTRON ? './' : '/',
  plugins: [vue(), tailwindcss(), viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: 100000000, // Инлайнит все ресурсы
  },
});
