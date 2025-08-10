import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "Drag Game",
        short_name: "DragGame",
        description: "드래그로 숫자의 합을 10으로 만들기",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#594A3C",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  esbuild: {
    // 프로덕션 빌드에서만 console 제거
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
