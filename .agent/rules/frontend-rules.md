
Rule: MUI v7 Grid Usage
When using Material UI (MUI) Grid, adhere to the v7 default Grid v2 API:
1.  Do NOT use the `item` prop. It is deprecated and removed in v2.
2.  Do NOT use separate `xs`, `sm`, `md`, `lg`, `xl` props for sizing.
3.  Use the `size` prop instead.
    -   For a single breakpoint: `size={12}`
    -   For multiple breakpoints: `size={{ xs: 12, md: 6 }}`
    -   Example: `<Grid size={{ xs: 12, md: 6 }}>` instead of `<Grid item xs={12} md={6}>`.
4.  Container usage remains similar: `<Grid container spacing={2}>`.

Rule: MUI Imports
Always import components from `@mui/material` and icons from `@mui/icons-material`.
Do not import from legacy or experimental paths unless explicitly necessary.
