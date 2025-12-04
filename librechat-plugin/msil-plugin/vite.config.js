import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/plugin.jsx",
      name: "LibreChatWidget",
      fileName: "librechat-plugin",
      formats: ["iife"], // IIFE = standalone
    },
  },
});