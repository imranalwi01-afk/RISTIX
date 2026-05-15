# Agent Guidance

This repository uses Next.js 16.1.x and Material UI v7 in `packages/frontend`. Agents must update code to the current installed APIs and must not downgrade packages to make legacy snippets compile.

## Material UI Rules

- Use `import Grid from '@mui/material/Grid'`.
- Use Grid v7 child sizing with `size={{ xs: 12, md: 6 }}`.
- Do not use legacy `<Grid item xs={...}>` or `item` props on Grid children.
- Do not import `Grid2`, `Unstable_Grid2`, or anything from `@mui/system`.
- Use `@mui/material/styles` for helpers such as `alpha`, `styled`, and `keyframes`.
- Do not add `@mui/system` as a dependency to mask invalid imports.
- Do not downgrade Material UI, Next.js, React, or TypeScript to accept old component APIs.

## Required Check For Frontend UI Changes

Before finishing a frontend change that touches MUI components, run:

```bash
rg -n "<Grid\\s+item|\\bitem\\s+xs=|@mui/system|Unstable_Grid2|Grid2" packages/frontend/src
pnpm --dir packages/frontend run type-check
pnpm --dir packages/frontend run build
```

If the grep finds matches, fix them using the current Material UI v7 API rather than changing package versions.
