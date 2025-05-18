# 使用 Node.js 官方映像作為基礎
FROM node:22-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製其餘的程式碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["node", "dist/index.js"]
