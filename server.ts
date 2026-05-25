import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fetchDriveAssets } from "./src/server/gdrive.js";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/drive/assets", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing GOOGLE_API_KEY" });
      }
      const data = await fetchDriveAssets(apiKey);
      res.json(data);
    } catch (error) {
      console.error("Error fetching drive assets:", error);
      res.status(500).json({ error: "Failed to fetch drive assets" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
