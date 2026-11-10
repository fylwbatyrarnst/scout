import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_JSONBIN_BIN_ID": JSON.stringify(
        env.VITE_JSONBIN_BIN_ID || process.env.VITE_JSONBIN_BIN_ID || "",
      ),
      "import.meta.env.VITE_JSONBIN_ACCESS_KEY": JSON.stringify(
        env.VITE_JSONBIN_ACCESS_KEY ||
          process.env.VITE_JSONBIN_ACCESS_KEY ||
          "",
      ),
      "import.meta.env.VITE_ADMIN_PASSWORD": JSON.stringify(
        env.VITE_ADMIN_PASSWORD ||
          process.env.VITE_ADMIN_PASSWORD ||
          "rover2026",
      ),
    },
  };
});
