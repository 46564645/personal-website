# Personal Website Page 1 Animation Plan

This repository contains the first-page visual prototype for the personal website. The page is intended to become one section/page of the final site, not the full site by itself.

## Current State

The current homepage is a Vite + React implementation with a full-screen `LetterGlitch` character background:

- black background
- purple monospace random characters
- DOM-based responsive character rendering, so the glitch field can be measured and focused
- alternating embedded Python-style greetings
- white corner focus frame with light outside blur
- character size and density remain close to the original visual prototype

The project also stores three React Bits animation source components in `react-bits-animations/` as references:

- `DecryptedText.jsx`
- `FuzzyText.jsx`
- `TrueFocus.jsx`

## Target Animation

The page should keep the current full-screen random-code / glitch background as its base layer.

On top of that background, two short Python-style greetings should repeatedly appear from the noise:

```python
print("Hi, I'm ma zhichao")
print("Welcome to my website")
```

The animation loop should work like this:

1. The full-screen `LetterGlitch` background keeps running.
2. The white corner focus frame first scans a short random run of existing乱码.
3. The focus frame then scans a longer random run of existing乱码.
4. A third focus target moves closer to the greeting location.
5. Near the left edge of the screen, vertically centered, the matching row of real DOM characters activates.
6. Those existing character slots are taken over inside `LetterGlitch` and decrypt from random characters into `print("Hi, I'm ma zhichao")`.
7. During reveal, the focus frame moves into place so the decrypt finish and focus arrival line up visually.
8. After the text is fully readable, the focus frame locks onto it:
   - the greeting remains inside the same character field
   - the focused text enlarges into a three-row cleared window
   - the enlarged text is centered inside that cleared window
   - characters outside the focus window are lightly blurred using `backdrop-filter`
9. The greeting exits back into the live `LetterGlitch` background.
10. The same sequence repeats near the right edge of the screen, vertically centered, using `print("Welcome to my website")`.
11. The page loops forever: left side, right side, left side, right side.

Important visual constraint:

- The greeting initially appears at the same approximate font size as the existing background characters.
- It should feel like the text is emerging from the existing glitch field, not like a separate large title dropped on top.

## Animation Responsibilities

Use the existing React Bits sources as directly as practical:

- `LetterGlitch`
  - Base full-screen animated background.
  - Continues running throughout the whole page.
  - Owns the embedded greeting slots so the text appears inside the乱码 grid.

- `DecryptedText`
  - Kept as a source reference for the reveal style.
  - The current page mirrors the decrypt behavior directly inside `LetterGlitch` so the text is not an overlay.

- `FuzzyText`
  - Kept as a source reference for glitch texture.
  - The current page uses DOM character scrambling/flicker in `LetterGlitch` to avoid a separate overlay.

- `TrueFocus`
  - Provides the white corner focus frame and outside-blur idea.
  - The current page applies that idea to measured character positions rather than duplicating a separate focus-text overlay.

## Technical Path

The project uses:

```txt
Vite + React + JavaScript + CSS
```

Current structure:

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
- Plain CSS is better suited than Tailwind for this page because the work is mostly character layout, blur, transform, glow, and timing choreography.

## Layering Model

The page should be built as layered visuals:

```txt
Layer 1: LetterGlitch full-screen DOM character background
Layer 2: embedded greeting characters / enlarged focused text
Layer 3: focus outside-blur panels
Layer 4: white corner focus frame
```

The greeting is positioned on the left or right side of the viewport and aligned to the same character grid as the background.

## Sequence Controller

The page needs a small animation controller in `App.jsx` or a dedicated hook/component. It should track:

- active side: `left` or `right`
- phase: `scan-short`, `scan-long`, `scan-near`, `reveal`, `focus`, `hold`, `exit`
- timing for each phase
- whether the greeting component should be mounted
- whether the focus overlay should be visible

Suggested timing:

```txt
scan-short: 1050ms
scan-long: 1050ms
scan-near: 750ms
reveal: 1400ms
focus scale in: 420ms
hold: 3000ms
exit: 650ms
```

These values are tuned visually for the current prototype.

## Dependency Notes

The copied React Bits source files imply these future dependencies:

```txt
react
react-dom
vite
motion
```

`DecryptedText.jsx` and `TrueFocus.jsx` import `motion/react`, so `motion` is required.

`motion` is required for the moving focus frame and blur panels.

## Development

Install dependencies:

```sh
pnpm install
```

Run locally:

```sh
pnpm dev
```

Build:

```sh
pnpm build
```
