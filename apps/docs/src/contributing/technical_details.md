# Technical Details

Permafrost has a complex codebase. This page will hopefully try to explain how it works.

## Email while development

While developing Permafrost, you will normally not have an email server connected.
To still get the contents of the email, the templating variables will be printed to the backend logs.
This can be used for getting password reset URLs, among other things.

## Monorepo

The monorepo is powered by turbopack and bun workspaces.
We recommend that you watch [this video](https://www.youtube.com/watch?v=9iU_IE6vnJ8) by Fireship.
