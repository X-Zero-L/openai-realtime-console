# Docker 部署指南

本文档提供了使用 Docker 部署 OpenAI 实时控制台应用程序的指南。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)
- 有效的 OpenAI API 密钥

## 快速开始

### 设置环境变量

1. 复制环境变量示例文件:

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入您的 API 密钥:

```
OPENAI_API_KEY=您的OpenAI密钥
CLIENT_API_KEY=您的客户端API密钥
```

### 使用 Docker Compose 构建和运行

```bash
docker-compose up -d
```

应用程序将在 `http://localhost:3000` 运行。

### 查看日志

```bash
docker-compose logs -f
```

### 停止应用

```bash
docker-compose down
```

## 仅使用 Dockerfile

如果您想不使用 Docker Compose，而是直接使用 Dockerfile:

```bash
# 构建镜像
docker build -t openai-realtime-console .

# 运行容器
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=您的OpenAI密钥 \
  -e CLIENT_API_KEY=您的客户端API密钥 \
  -d openai-realtime-console
```

## 开发模式

对于开发环境，可以挂载本地代码到容器中以便实时修改:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 自定义配置

您可以通过环境变量自定义应用程序配置:

- `PORT`: 应用程序端口 (默认: 3000)
- `NODE_ENV`: 环境模式 (默认: production)
- `OPENAI_API_KEY`: OpenAI API 密钥
- `CLIENT_API_KEY`: 客户端 API 密钥

## 故障排除

### 容器无法启动

检查日志:

```bash
docker-compose logs
```

### API 密钥问题

确保您已正确设置环境变量，可以通过以下命令检查:

```bash
docker-compose exec app printenv | grep API_KEY
``` 