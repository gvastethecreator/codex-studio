# Design QA - Onboarding Welcome

Date: 2026-06-21

## Scope

Redesigned the onboarding welcome surface from Product Design option 3 and updated the preview image to load a random asset from the style recipes gallery on each open.

## Source Visual

- Selected Product Design option 3:
  `C:\Users\cristian\.codex\generated_images\019ee7c2-1e5c-76f0-873c-d4c7bd0984b2\ig_016ff9339af065db016a374a492e6481919c1ce2657b8a5f27.png`

## Implementation Evidence

- Desktop screenshot: `D:\DEV\codex-studio\output\playwright\onboarding-random-style-desktop-final.png`
- Mobile screenshot: `D:\DEV\codex-studio\output\playwright\onboarding-random-style-mobile-final.png`
- Desktop random gallery asset observed: `/assets/recipes/styles/defaults/SP12-056.webp`
- Mobile random gallery asset observed: `/assets/recipes/styles/defaults/SP08-053.webp`

## Viewports Checked

- Desktop: 1440 x 1024
- Mobile: 390 x 844

## Findings

- P0/P1/P2: none.
- The nonfunctional Help action from the source mock was intentionally omitted.
- The preview image is intentionally not fixed to the source mock; it now comes from the local style recipes gallery and can differ per open.
- On mobile, the image is ordered before the prompt card so the dynamic gallery asset is visible in the first viewport.

## Result

Passed.
