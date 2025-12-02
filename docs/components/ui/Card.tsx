'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
    href?: string;
}

export function Card({ title, description, icon, children, className = '', href }: CardProps) {
    const Content = (
        <motion.div
            className={`${styles.card} ${className}`}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className={styles.glow} />
            <div className={styles.content}>
                {icon && <div className={styles.icon}>{icon}</div>}
                {title && <h3 className={styles.title}>{title}</h3>}
                {description && <p className={styles.description}>{description}</p>}
                {children}
            </div>
        </motion.div>
    );

    if (href) {
        return (
            <a href={href} className={styles.link}>
                {Content}
            </a>
        );
    }

    return Content;
}
