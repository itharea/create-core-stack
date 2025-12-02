'use client';

import { Fragment } from 'react';
import { Check, X } from 'lucide-react';
import styles from './PresetComparison.module.css';

type FeatureStatus = boolean | string;

interface FeatureRow {
    name: string;
    category: 'features' | 'integrations' | 'backend';
    values: [FeatureStatus, FeatureStatus, FeatureStatus];
}

const features: FeatureRow[] = [
    { name: 'Authentication', category: 'features', values: [true, true, true] },
    { name: 'Session Management', category: 'features', values: [true, true, true] },
    { name: 'Onboarding', category: 'features', values: [false, '3 pages', '2 pages'] },
    { name: 'Paywall', category: 'features', values: [false, true, false] },
    { name: 'RevenueCat', category: 'integrations', values: [false, true, false] },
    { name: 'Adjust', category: 'integrations', values: [false, true, true] },
    { name: 'Scate', category: 'integrations', values: [false, true, true] },
    { name: 'ATT', category: 'integrations', values: [false, true, true] },
    { name: 'PostgreSQL', category: 'backend', values: [true, true, true] },
    { name: 'Docker', category: 'backend', values: [true, true, true] },
    { name: 'Event Queue', category: 'backend', values: [false, true, true] },
];

const categoryLabels: Record<string, string> = {
    features: 'Features',
    integrations: 'Integrations',
    backend: 'Backend',
};

function StatusCell({ value }: { value: FeatureStatus }) {
    if (value === true) {
        return (
            <span className={styles.enabled}>
                <Check size={14} strokeWidth={2.5} />
            </span>
        );
    }
    if (value === false) {
        return (
            <span className={styles.disabled}>
                <X size={12} strokeWidth={2} />
            </span>
        );
    }
    return <span className={styles.custom}>{value}</span>;
}

export function PresetComparison() {
    const categories = ['features', 'integrations', 'backend'] as const;

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Minimal</th>
                        <th>Full-Featured</th>
                        <th>Analytics</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <Fragment key={category}>
                            <tr className={styles.categoryRow}>
                                <td colSpan={4}>{categoryLabels[category]}</td>
                            </tr>
                            {features
                                .filter((f) => f.category === category)
                                .map((feature) => (
                                    <tr key={feature.name}>
                                        <td>{feature.name}</td>
                                        {feature.values.map((value, i) => (
                                            <td key={i}>
                                                <StatusCell value={value} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
