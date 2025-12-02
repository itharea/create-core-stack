'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function Section({ children, className = '', delay = 0 }: SectionProps) {
    return (
        <motion.section
            className={`${styles.section} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            <div className="container">
                {children}
            </div>
        </motion.section>
    );
}
