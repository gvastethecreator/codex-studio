# User-experience review

Date: 2026-08-09.

- Provider variants are additional card images, labeled in an `aria-live` region while users cycle them.
- Previous/next controls remain available on hover and keyboard focus and are now visible on hoverless or coarse-pointer devices, closing the touch discovery gap.
- The canonical default card remains first unless it is stale; generated results remain higher priority than defaults and variants.
- Disabled selection consistently explains the five-style limit and blocks both image and compact actions.
- Browser verification covers the built Styles route at desktop and mobile sizes. Other browsers, a real screen reader, and physical touch remain release checks rather than inferred proof.
