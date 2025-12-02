'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './FeatureSection.module.css';

interface FeatureSectionProps {
    title: string;
    description: string;
    visual: ReactNode;
    align?: 'left' | 'right';
    children?: ReactNode;
}

export function FeatureSection({ title, description, visual, align = 'left', children }: FeatureSectionProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={`${styles.grid} ${align === 'right' ? styles.reverse : ''}`}>
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.description}>{description}</p>
                        {children}
                    </motion.div>

                    <motion.div
                        className={styles.visual}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {visual}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
