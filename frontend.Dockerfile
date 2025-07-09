FROM oven/bun:alpine
WORKDIR /app
RUN apk add nodejs npm
COPY . .
RUN bun install
WORKDIR /app/apps/frontend
RUN bun run build
EXPOSE 3000
ENTRYPOINT bun run start --port 3000
