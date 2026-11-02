import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ghostMiddleware } from "./server/ghost";

function grokgeist(apiKey: string): Plugin {
  const attach = (server: { middlewares: { use: (fn: ReturnType<typeof ghostMiddleware>) => void } }) => {
    server.middlewares.use(ghostMiddleware(apiKey));
  };
  return {
    name: "grokgeist",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const apiKey = process.env.XAI_API_KEY || fileEnv.XAI_API_KEY || "";
  return {
    plugins: [react(), grokgeist(apiKey)],
    server: {
      host: "127.0.0.1",
      port: 5173,
    },
    preview: {
      host: "127.0.0.1",
      port: 5173,
    },
  };
});
