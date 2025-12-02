'use client';

import styles from './Marquee.module.css';
import { ReactNode } from 'react';

interface MarqueeProps {
    children: ReactNode;
    direction?: 'left' | 'right';
    speed?: number;
}

export function Marquee({ children, direction = 'left', speed = 20 }: MarqueeProps) {
    return (
        <div className={styles.marquee} style={{ '--duration': `${speed}s` } as any}>
            <div className={`${styles.content} ${direction === 'right' ? styles.reverse : ''}`}>
                {children}
                {children}
            </div>
            <div className={styles.fade} />
        </div>
    );
}
