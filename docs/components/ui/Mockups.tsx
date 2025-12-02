'use client';

import styles from './Mockups.module.css';
import { ReactNode } from 'react';

export function PhoneMockup({ children }: { children?: ReactNode }) {
    return (
        <div className={styles.phone}>
            <div className={styles.notch} />
            <div className={styles.screen}>
                {children}
            </div>
        </div>
    );
}

export function BrowserMockup({ children, url = 'localhost:3000' }: { children?: ReactNode, url?: string }) {
    return (
        <div className={styles.browser}>
            <div className={styles.browserHeader}>
                <div className={styles.dots}>
                    <span />
                    <span />
                    <span />
                </div>
                <div className={styles.urlBar}>{url}</div>
            </div>
            <div className={styles.browserContent}>
                {children}
            </div>
        </div>
    );
}
