'use client';

import { motion } from 'framer-motion';
import { Shield, Smartphone, TrendingUp, Target, CreditCard, Layout } from 'lucide-react';
import styles from './IntegrationRow.module.css';

const integrations = [
    {
        name: 'RevenueCat',
        icon: TrendingUp,
        description: 'In-App Subscriptions'
    },
    {
        name: 'Adjust',
        icon: Target,
        description: 'Attribution'
    },
    {
        name: 'BetterAuth',
        icon: Shield,
        description: 'Authentication'
    },
    {
        name: 'Onboarding',
        icon: Smartphone,
        description: 'Flows'
    },
    {
        name: 'Stripe',
        icon: CreditCard,
        description: 'Payments'
    }
];

export function IntegrationRow() {
    return (
        <div className={styles.container}>
            <div className={styles.row}>
                {/* Connection Line Background */}
                <div className={styles.connectionLine} />

                {integrations.map((item, index) => (
                    <motion.div
                        key={item.name}
                        className={styles.item}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className={styles.iconWrapper}>
                            <item.icon className={styles.icon} strokeWidth={1.5} />
                        </div>
                        <span className={styles.label}>{item.name}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
