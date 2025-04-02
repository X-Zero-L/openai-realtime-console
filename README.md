# OpenAI 实时控制台

这是一个示例应用程序，展示如何使用 [OpenAI 实时 API](https://platform.openai.com/docs/guides/realtime) 和 [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc)。

## 安装和使用

在开始之前，您需要一个 OpenAI API 密钥 - [在仪表板创建一个](https://platform.openai.com/settings/api-keys)。从示例文件创建一个 `.env` 文件，并在其中设置您的 API 密钥：

```bash
cp .env.example .env
```

本地运行此应用程序需要安装 [Node.js](https://nodejs.org/)。安装应用程序依赖项：

```bash
npm install
```

启动应用程序服务器：

```bash
npm run dev
```

应用程序应该在 [http://localhost:3000](http://localhost:3000) 上运行。

## Docker 部署

### 使用 Docker Compose

1. 确保已安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

2. 从示例文件创建一个 `.env` 文件：
   ```bash
   cp .env.example .env
   ```

3. 编辑 `.env` 文件，设置您的 API 密钥：
   ```
   OPENAI_API_KEY=您的OpenAI密钥
   CLIENT_API_KEY=您的客户端API密钥
   ```

4. 使用 Docker Compose 构建和运行应用：
   ```bash
   docker-compose up -d
   ```

应用程序将在 [http://localhost:3000](http://localhost:3000) 上可用。

### 开发环境

对于开发环境，您可以使用开发配置：

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

更多关于 Docker 部署的详细信息，请参阅 [DOCKER.md](./DOCKER.md)。

## 应用说明

这个应用程序是一个最小模板，使用 [express](https://expressjs.com/) 来服务包含在 [`/client`](./client) 文件夹中的 React 前端。服务器配置使用 [vite](https://vitejs.dev/) 构建 React 前端。

该应用程序展示了如何通过 WebRTC 数据通道发送和接收实时 API 事件，以及配置客户端函数调用。您还可以使用 UI 中的日志面板查看客户端和服务器事件的 JSON 负载。

对于更全面的示例，请参阅使用 Next.js 构建的 [OpenAI 实时代理](https://github.com/openai/openai-realtime-agents) 演示，其使用的代理架构灵感来自 [OpenAI Swarm](https://github.com/openai/swarm)。

## 主要功能

- 实时与 OpenAI 模型通信
- WebRTC 数据通道通信
- 客户端 API 密钥验证
- 响应式用户界面与动画效果
- Docker 容器化部署支持

## 先前的 WebSockets 版本

在浏览器中不推荐使用 WebSockets 的此应用程序的先前版本 [可以在此找到](https://github.com/openai/openai-realtime-console/tree/websockets)。

## 许可证

MIT
