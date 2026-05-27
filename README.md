# Personal Website Page 1 Animation Plan

This repository currently contains the first-page visual prototype for the personal website. The page is intended to become one section/page of the final site, not the full site by itself.

## Current State

The current homepage is a full-screen `LetterGlitch` background:

- black background
- purple monospace random characters
- canvas-based responsive rendering
- character size and density should remain close to the current version

The project also stores three React Bits animation source components in `react-bits-animations/`:

- `DecryptedText.jsx`
- `FuzzyText.jsx`
- `TrueFocus.jsx`

These are source references for the later React implementation.

## Target Animation

The page should keep the current full-screen random-code / glitch background as its base layer.

On top of that background, a short Python-style greeting should repeatedly appear from the noise:

```python
print("Hi, I'm ma zhichao")
```

The animation loop should work like this:

1. The full-screen `LetterGlitch` background keeps running.
2. Near the left edge of the screen, vertically centered, a small text area activates.
3. That area uses the `DecryptedText` animation to transform random-looking characters into `print("Hi, I'm ma zhichao")`.
4. During this reveal, the same text should continuously carry the `FuzzyText` blinking / fuzzy / glitch effect.
5. After the text is fully readable, a focus effect appears around it:
   - the greeting becomes the visual focus
   - the surrounding area becomes visually softer / less prominent
   - the greeting scales up to roughly 3x its original size
6. The focused, enlarged greeting holds for about 3 seconds.
7. The greeting scales back down to its original size.
8. The focus effect disappears.
9. The text dissolves back into the live `LetterGlitch` background.
10. The same sequence repeats near the right edge of the screen, vertically centered.
11. The page loops forever: left side, right side, left side, right side.

Important visual constraint:

- The greeting should initially appear at the same approximate font size as the existing background characters.
- It should feel like the text is emerging from the existing glitch field, not like a separate large title dropped on top.

## Animation Responsibilities

Use the existing React Bits sources as directly as practical:

- `LetterGlitch`
  - Base full-screen animated background.
  - Continues running throughout the whole page.

- `DecryptedText`
  - Handles the reveal from scrambled characters into the final Python greeting.
  - This is responsible for steps 2 and 3 of the reveal sequence.

- `FuzzyText`
  - Adds the persistent blinking / fuzzy / glitch texture to the greeting while it appears.
  - It should run at the same time as the `DecryptedText` reveal, not as a separate later phase.

- `TrueFocus`
  - Provides the focus-frame / blur idea for the enlarged greeting phase.
  - The original component may need adaptation because the desired effect focuses the whole greeting, not individual words.

## Recommended Technical Path

The current repository is not yet a full React app. It has `index.html`, `App.jsx`, and the component source, but no package manifest or build setup.

Because the React Bits animation sources are React components, the recommended implementation path is:

```txt
Vite + React + JavaScript + CSS
```

Recommended future structure:

```txt
package.json
index.html
src/
  main.jsx
  App.jsx
  styles.css
  components/
    LetterGlitch.jsx
    DecryptedText.jsx
    FuzzyText.jsx
    TrueFocus.jsx
```

Reasons:

- The existing animation sources are JSX components.
- Vite gives a small, fast React setup without unnecessary framework complexity.
- JavaScript is enough for this prototype and matches the provided source files.
- Plain CSS is better suited than Tailwind for this page because the work is mostly canvas, blur, transform, glow, and timing choreography.

## Layering Model

The page should be built as layered visuals:

```txt
Layer 1: LetterGlitch full-screen canvas background
Layer 2: optional focus / blur overlay
Layer 3: positioned greeting animation
```

The greeting layer should be absolutely positioned at either the left or right side of the viewport. It should be vertically centered and aligned to the existing character-grid feeling.

## Sequence Controller

The page needs a small animation controller in `App.jsx` or a dedicated hook/component. It should track:

- active side: `left` or `right`
- phase: `idle`, `reveal`, `focus`, `hold`, `exit`
- timing for each phase
- whether the greeting component should be mounted
- whether the focus overlay should be visible

Suggested timing:

```txt
reveal: 800ms - 1400ms
focus scale in: 300ms - 500ms
hold: 3000ms
scale out: 300ms - 500ms
return to background: 400ms - 800ms
```

These values are starting points and should be tuned visually.

## Dependency Notes

The copied React Bits source files imply these future dependencies:

```txt
react
react-dom
vite
motion
```

`DecryptedText.jsx` and `TrueFocus.jsx` import `motion/react`, so `motion` is required.

`TrueFocus.jsx` imports `./TrueFocus.css`, but the provided source folder did not include that CSS file. Before using `TrueFocus`, either:

- add the missing CSS from the original source, or
- rewrite the required focus-frame styles in the page stylesheet.

## Current Limitation

No implementation has been changed yet. This README documents the intended behavior and technical path for the first-page animation.
