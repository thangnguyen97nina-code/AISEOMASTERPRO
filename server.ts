import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { publishToCMS } from "./services/publishService.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Publishing
  app.post("/api/publish-news", async (req, res) => {
    const { article, config } = req.body;
    
    if (!article || !config) {
      return res.status(400).json({ success: false, error: "Missing article or config data" });
    }

    try {
      console.log("Starting publish process for article:", article.title);
      const result = await publishToCMS(article, config);
      res.json(result);
    } catch (error: any) {
      console.error("Publish error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Unknown error during publishing" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
