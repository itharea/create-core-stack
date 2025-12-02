'use client';

import { motion } from 'framer-motion';
import styles from './CodeWindow.module.css';

interface CodeWindowProps {
    code: string;
    language?: string;
    title?: string;
}

export function CodeWindow({ code, language = 'bash', title = 'Terminal' }: CodeWindowProps) {
    return (
        <motion.div
            className={styles.window}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.header}>
                <div className={styles.buttons}>
                    <span className={styles.close} />
                    <span className={styles.minimize} />
                    <span className={styles.maximize} />
                </div>
                <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.content}>
                <pre>
                    <code className={`language-${language}`}>
                        {code}
                    </code>
                </pre>
            </div>
        </motion.div>
    );
}
