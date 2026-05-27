# React Bits animation sources

This folder stores the three React Bits animation components we plan to reuse for the homepage animation.

Original shadcn commands:

```sh
pnpm dlx shadcn@latest add @react-bits/TrueFocus-JS-CSS
pnpm dlx shadcn@latest add @react-bits/FuzzyText-JS-CSS
pnpm dlx shadcn@latest add @react-bits/DecryptedText-JS-CSS
```

Files:

- `DecryptedText.jsx`: hacker-style text decryption / reveal effect.
- `TrueFocus.jsx`: focus frame and blur effect for text.
- `FuzzyText.jsx`: canvas-based fuzzy / glitch text rendering.

Notes:

- `DecryptedText.jsx` and `TrueFocus.jsx` import `motion/react`, so the future React app needs the `motion` package.
- `TrueFocus.jsx` imports `./TrueFocus.css`; the source folder provided only included the component file, so its CSS still needs to be added or recreated before use.
- These files are staged here as source references. We can either copy them into `src/components` later or adapt them directly when converting the homepage to a Vite + React app.
