import React from 'react';

import type { GsapDropdownProps } from './GsapDropdown';
import { shouldMountDemandDropdown } from './demandMountedGsapDropdownPolicy';

const LazyGsapDropdown = React.lazy(() =>
  import('./GsapDropdown').then((module) => ({ default: module.GsapDropdown })),
);

export const DemandMountedGsapDropdown = React.forwardRef<HTMLDivElement, GsapDropdownProps>(
  ({ open, ...props }, forwardedRef) => {
    const [hasOpened, setHasOpened] = React.useState(open);

    React.useEffect(() => {
      if (open) setHasOpened(true);
    }, [open]);

    if (!shouldMountDemandDropdown(open, hasOpened)) return null;

    return (
      <React.Suspense fallback={null}>
        <LazyGsapDropdown ref={forwardedRef} open={open} {...props} />
      </React.Suspense>
    );
  },
);

DemandMountedGsapDropdown.displayName = 'DemandMountedGsapDropdown';
