import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Permafrost",
  description:
    "The offical documentation for the Permafrost Authentication Gateway",
  srcDir: "./src",
  cleanUrls: true,
  lang: "en-US",
  lastUpdated: true,
  themeConfig: {
    logo: "/assets/Icon.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Integrations", link: "/integrations/" },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Snowcone-Labs/permafrost",
      },
    ],

    footer: {
      copyright: "Snowflake-Software © 2023-2025",
      message: "All rights reserved",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern:
        "https://github.com/Snowcone-Labs/permafrost/edit/main/apps/docs/src/:path",
    },

    sidebar: {
      "integrations/": [
        {
          text: "<-- Back",
          link: "/introduction",
        },
        {
          text: "Generic",
          items: [
            { text: "OpenID Connect", link: "/integrations/generic/oidc" },
            { text: "Nginx", link: "/integrations/nginx" },
          ],
        },
        {
          text: "Protects",
          items: [
            { text: "Vikunja", link: "/integrations/vikunja" },
            { text: "Grafana", link: "/integrations/grafana" },
            { text: "Memos", link: "/integrations/memos" },
            { text: "Jenkins", link: "/integrations/jenkins" },
            { text: "Portainer", link: "/integrations/portainer" },
            { text: "Mealie", link: "/integrations/mealie" },
          ],
        },
        {
          text: "Social Login & Federation",
          items: [
            { text: "GitHub", link: "/integrations/socialLogin/github" },
            { text: "Discord", link: "/integrations/socialLogin/discord" },
          ],
        },
      ],
      "/": [
        {
          text: "Home",
          items: [
            { text: "Introduction", link: "/introduction" },
            { text: "Getting started", link: "/setup" },
            { text: "Configuration", link: "/config" },
            { text: "Deployment", link: "/deployment" },
            { text: "Integrations ->", link: "/integrations/" },
          ],
        },
        {
          text: "API",
          items: [
            {
              text: "Basic Endpoints",
              collapsed: true,
              items: [{ text: "Meta", link: "/api/meta" }],
            },
            {
              text: "Applications",
              collapsed: true,
              items: [
                {
                  text: "Collaborators",
                  collapsed: true,
                  items: [
                    {
                      text: "Add",
                      link: "/api/applications/collaborators/put",
                    },
                    {
                      text: "Remove",
                      link: "/api/applications/collaborators/delete",
                    },
                  ],
                },
                {
                  text: "Redirect URIs",
                  collapsed: true,
                  items: [
                    {
                      text: "Add",
                      link: "/api/applications/redirects/put",
                    },
                    {
                      text: "Remove",
                      link: "/api/applications/redirects/delete",
                    },
                  ],
                },
                {
                  text: "Icon",
                  collapsed: true,
                  items: [
                    {
                      text: "Get",
                      link: "/api/applications/icon/get",
                    },
                    {
                      text: "Set",
                      link: "/api/applications/icon/post",
                    },
                    {
                      text: "Remove",
                      link: "/api/applications/icon/delete",
                    },
                  ],
                },
                {
                  text: "Create",
                  link: "/api/applications/post",
                },
                {
                  text: "Get",
                  link: "/api/applications/get",
                },
                {
                  text: "Update",
                  link: "/api/applications/patch",
                },
                {
                  text: "List",
                  link: "/api/applications/list",
                },
                {
                  text: "Remove",
                  link: "/api/applications/delete",
                },
              ],
            },
            {
              text: "Users",
              collapsed: true,
              items: [
                {
                  text: "Authorization",
                  collapsed: true,
                  items: [
                    {
                      text: "Password",
                      link: "/api/users/authorization/password",
                    },
                    {
                      text: "Token",
                      link: "/api/users/authorization/token",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          text: "Contributing",
          items: [
            { text: "Commits", link: "/contributing/commits" },
            {
              text: "Technical details",
              link: "/contributing/technical_details",
            },
            {
              text: "Backend routing",
              link: "/contributing/routing",
            },
            {
              text: "Style guide",
              link: "/contributing/style_guide",
            },
            {
              text: "Maintainers",
              link: "/contributing/maintainers",
            },
          ],
        },
      ],
    },
  },
  vite: {
    clearScreen: false,
    server: {
      port: 4000,
      strictPort: true,
      host: "0.0.0.0",
    },
    preview: {
      port: 4000,
      strictPort: true,
      host: "0.0.0.0",
    },
  },
});
