# Copilot Instructions

The frontend is on Next.js 16.1.x and Material UI v7. Keep generated or suggested code on the installed Material UI API.

## Material UI v7 Grid

Use:

```tsx
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>...</Grid>
</Grid>
```

Never suggest:

- `<Grid item xs={12} md={6}>`
- `Grid2` or `Unstable_Grid2`
- imports from `@mui/system`
- dependency downgrades to Material UI v5/v6 or Next.js 15

For styling helpers, use `@mui/material/styles`.
