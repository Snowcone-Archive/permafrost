<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/header-darkmode.png">
    <source media="(prefers-color-scheme: light)" srcset="./.github/assets/header-lightmode.png">
    <img src="./.github/assets/header-lightmode.png">
  </picture>
</p>

---

## What is Permafrost

Permafrost is an identity provider that aims to be simple. It has many integrations, ranging from NginX to Discord.

## Installation

Visit the docs

## Screenshots

![Home screen](./.github/assets/screenshots/home.png)

<details>
 <summary>Click to see more screenshots!</summary>
  <img src="./.github/assets/screenshots/connections.png" alt="viewing a user's connection"/>
  <img src="./.github/assets/screenshots/authorize.png" alt="authroizing an application"/>
  <img src="./.github/assets/screenshots/manage-user.png" alt="managing a user"/>
  <img src="./.github/assets/screenshots/audit-log.png" alt="audit log"/>
</details>

## Deploying

```bash
cp docker-compose.example.yml docker-compose.yml
docker compose up -d
```
