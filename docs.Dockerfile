FROM oven/bun:1.1.17
WORKDIR /app
COPY . .
RUN apt-get -y update
RUN apt-get -y install git
RUN cd apps/docs
RUN bun install
RUN bun run build --filter permafrost-docs
EXPOSE 4000
ENTRYPOINT bun run serve --filter permafrost-docs -- --host 0.0.0.0