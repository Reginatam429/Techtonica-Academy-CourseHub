import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API = "https://techtonica-coursehub-api-1dcb105ae03b.herokuapp.com";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: API,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
