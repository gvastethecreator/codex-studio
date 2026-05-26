# ADR 0003: Extract Reference Manager

## Status

Proposed.

## Context

Reference image handling was embedded in the job creation route. The route mixed HTTP concerns with filesystem I/O, base64 decoding, filename sanitization, and prompt augmentation.

## Decision

Create a `referenceManager.ts` module with a single interface for processing job references, persisting them safely, and returning the augmented prompt plus persisted reference metadata.

## Consequences

- reference handling gains locality;
- route handlers stay focused on HTTP and job creation;
- reference naming, storage, and prompt policy can be tested directly;
- future reference formats can be added behind the same seam.
