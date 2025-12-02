'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
    href?: string;
}

export function Button({ children, variant = 'primary', className = '', onClick, href }: ButtonProps) {
    const Component = href ? motion.a : motion.button;

    return (
        <Component
            className={`${styles.button} ${styles[variant]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            href={href}
        >
            {children}
            {variant === 'primary' && (
                <div className={styles.shimmerWrapper}>
                    <div className={styles.shimmer} />
                </div>
            )}
        </Component>
    );
}
