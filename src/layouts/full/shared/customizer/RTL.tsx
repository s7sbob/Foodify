// src/layouts/full/shared/customizer/RTL.tsx

import React, { useEffect, useMemo } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';

interface RTLProps {
  children: React.ReactNode;
  direction: 'rtl' | 'ltr';
}

// Create caches outside the component to prevent recreation
const rtlCache = createCache({
  key: 'rtl',
  prepend: true,
  stylisPlugins: [rtlPlugin],
});

const ltrCache = createCache({
  key: 'ltr',
  prepend: true,
  // No RTL plugin for LTR direction
});

const RTL: React.FC<RTLProps> = ({ children, direction }) => {
  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  const cache = useMemo(() => (direction === 'rtl' ? rtlCache : ltrCache), [direction]);

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default RTL;
