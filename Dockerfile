# 基础镜像使用 Node.js 18
FROM node:18-alpine

# 创建应用目录
WORKDIR /app

# 安装构建工具
RUN apk add --no-cache python3 make g++

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有文件
COPY . .

# 设置环境变量
ENV PORT=3000
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 容器启动命令 - 生产环境使用 node server.js
# 开发环境可以在 docker-compose.dev.yml 中覆盖此命令
CMD ["node", "server.js"] 