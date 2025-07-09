# FROM oven/bun:alpine
FROM oven/bun:debian
WORKDIR /app
RUN apt-get update; apt-get install curl gpg -y; \
mkdir -p /etc/apt/keyrings; \
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list; \
 apt-get update && apt-get install -y nodejs;
COPY . .
RUN bun install
WORKDIR /app/apps/backend
RUN bunx prisma generate
EXPOSE 1234
# ENTRYPOINT ["bunx", "prisma", "generate", "&&", "bun", "run", "./src/index.ts"]
ENTRYPOINT ["bun", "run", "run:and_migrate"]
