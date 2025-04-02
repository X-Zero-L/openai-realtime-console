import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const clientApiKey = process.env.CLIENT_API_KEY || "test-api-key";

// API密钥验证中间件
const validateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "未提供有效的API密钥" });
  }
  
  const providedApiKey = authHeader.split(' ')[1];
  
  if (providedApiKey !== clientApiKey) {
    return res.status(403).json({ error: "API密钥无效" });
  }
  
  next();
};

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { 
    middlewareMode: true,
    hmr: false,
  },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.use(express.json()); // 支持解析JSON请求体

app.post("/token", validateApiKey, async (req, res) => {
  try {
    // 从请求体获取会话设置
    const {
      voice = "verse",
      temperature = 0.8,
      instructions = "",
      input_audio_format = "pcm16",
      output_audio_format = "pcm16",
    } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice,
          temperature,
          instructions,
          input_audio_format,
          output_audio_format,
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// 保留原来的GET方法以保持兼容性
app.get("/token", validateApiKey, async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// API route for just verifying the API key
app.get("/verify", validateApiKey, (req, res) => {
  // 如果validateApiKey中间件通过，直接返回成功
  res.json({ success: true, message: "API密钥验证成功" });
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
