# Performance review

Date: 2026-08-09.

- The production build keeps the main entry at 345.28 KB, Styles at 78.27 KB, Camera at 24.31 KB, Three at 707.23 KB, and JSZip at 93.58 KB; every declared chunk budget passes.
- Style thumbnail URLs remain pack-scoped and demand-loaded. The current catalog covers 3,955 logical thumbnails without adding them to the main entry.
- Style cards use `content-visibility: auto`. Their intrinsic fallback was corrected from landscape 280×210 to portrait 210×280, matching the actual 3:4 card ratio and reducing avoidable scroll-geometry correction before offscreen cards render.
- Build duration is diagnostic only. No speedup claim is made from one host sample.
