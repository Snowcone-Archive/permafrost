# Committing to Permafrost

Permafrost follows [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
When commiting, please make multiple commits for each area of the project.
If the area is self-explainatory, i.e adding a documentation page, you do not **need** to specify it. See [examples](#examples).

Commit titles should always start with a lowercase letter. They can be constructed with the following recipe:

```txt
${type}(${area}): commit title
```

## Area Names

- type(backend)
- type(docs)
- type(frontend)
- type(sdk/js)

If a commit is made where two sub-projects share similar changes (e.g. an adjustment to a backend route being reflected on a SDK),
then the commit areas may be merged into one, concatenated with a +.

For project-wide changes (changes in the root package.json), no area is required.

For changes to the `docs` app, an area is not required as long as the type is `docs`.

## Types

- feat(area)
- fix(area)
- refactor(area)
- docs(area)
- docs
- chore(area)
- ci(area)
- test(area)

## Examples

- `refactor(backend): remove axios dependency`
- `docs: document ideal commit titles`
- `docs(frontend): document build step in README`
- `feat(backend+sdk/js): add user count to application get`
- `chore: update bun`
