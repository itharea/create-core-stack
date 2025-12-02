'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {navigation.map((section) => (
                    <div key={section.title} className={styles.section}>
                        <h4 className={styles.title}>{section.title}</h4>
                        <ul className={styles.list}>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={clsx(styles.link, {
                                                [styles.active]: isActive,
                                                [styles.disabled]: item.disabled,
                                            })}
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
