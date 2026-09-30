# GitHub banner art

The GitHub banner and social preview use a textless image made in Cozy Studio: Styles workflow, style "Skateboard Deck Graphic", ChatGPT provider, 21:9, 2K. `banner.html` adds all readable text, so the words never come from the model.

Prompt:

```text
Wide cozy night scene at a small creative desk beside a rain-streaked window. A small black kitten sleeps curled up on the wooden desk. Next to the kitten sits a round, chubby charcoal-gray ceramic mug with a simple cute face painted on it: two small white dot eyes and a tiny white smile. The mug is full of hot honey-orange drink with two soft curls of steam rising. An open laptop on the desk shows a dark app window with a honey-orange button and a grid of small colorful pictures. Finished drawings and small prints in wildly different art styles are pinned above the desk and scattered around it, with pencils, brushes and a potted plant. Through the window, rain streaks and blurred warm city lights at night. Keep the left 40 percent of the frame calm and uncluttered, a quiet dark wall, to leave room for a title. No readable text, no letters, no numbers, no logos.
```

Rebuild `cozy-studio-banner.webp` (2100x900) and `cozy-studio-social.jpg` (1280x640) by rendering `banner.html?art=<art.png>` at those sizes in a browser, then export WebP and JPEG.
