'use client';

import { useEffect, useState } from 'react';

interface BFCacheHandlerProps {
    children: React.ReactNode;
}

/**
 * Handles Safari's aggressive bfcache (Back-Forward Cache) behavior.
 *
 * When Safari restores a page from bfcache on back/forward navigation,
 * React's virtual DOM can become out of sync with the actual DOM,
 * causing the entire page to appear blank.
 *
 * This component detects bfcache restoration via the 'pageshow' event
 * and forces a React re-render by changing its key prop.
 */
export function BFCacheHandler({ children }: BFCacheHandlerProps) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            // event.persisted is true when page is restored from bfcache
            if (event.persisted) {
                // Force re-render by changing key
                setKey(prev => prev + 1);
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    return <div key={key}>{children}</div>;
}
