# Setup

## Installation

## Configuration

## Generating keys

```bash
openssl genpkey -algorithm RSA -out applications_private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in applications_private.pem -out applications_public.pem
bun run cli keygen -f
```

## Deploying

The recommended way to deploy Permafrost is with Docker.

Download the Git repo and build:

```bash
docker compose build
```

Start postgres detached and migrate db, make sure env has correct credentials otherwise this won't work:

```bash
bun i
docker compose up db -d
# bun may not work sometimes, npx is fine to use
bun x prisma migrate deploy
docker compose down db
```

Start permafrost (do port forwarding too)

```bash
docker compose up
```

Congrats! Permafrost is now working, hopefully.

### Upgrading

### Docs

To build the image you can use the following command:

```bash
docker build . -t permafrost-docs -f ./Dockerfile.docs
```

To run:

```bash
docker run --network host permafrost-docs
```

## Maintainance
