# Stage 1: Builder
FROM node:18 AS builder
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app/ .

# Stage 2: Production
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "server.js"]
