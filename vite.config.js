import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // If 3000 is occupied, auto-fallback to 3001, 3002...
    host: true, // Exposes server on localhost and local network IP
  },
  preview: {
    port: 3000,
    host: true,
  },
});
