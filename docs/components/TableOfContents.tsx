'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './TableOfContents.module.css';
import clsx from 'clsx';

export default function TableOfContents() {
    const pathname = usePathname();
    const [activeId, setActiveId] = useState<string>('');
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        // Reset active state on navigation (but keep headings to avoid flicker)
        setActiveId('');

        // Small delay to ensure DOM is updated after navigation
        const timeout = setTimeout(() => {
            const elements = Array.from(document.querySelectorAll('h2, h3'))
                .map((elem) => ({
                    id: elem.id,
                    text: elem.textContent || '',
                    level: Number(elem.tagName.substring(1)),
                }))
                .filter((elem) => elem.id); // Filter out headings without IDs
            setHeadings(elements);

            // Set first heading as active by default
            if (elements.length > 0) {
                setActiveId(elements[0].id);
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [pathname]);

    // Separate effect for intersection observer
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0% 0% -80% 0%' }
        );

        headings.forEach((heading) => {
            const target = document.getElementById(heading.id);
            if (target) observer.observe(target);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <nav className={styles.toc}>
            <h4 className={styles.title}>On This Page</h4>
            <ul className={styles.list}>
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={clsx(styles.item, {
                            [styles.level3]: heading.level === 3,
                        })}
                    >
                        <a
                            href={`#${heading.id}`}
                            className={clsx(styles.link, {
                                [styles.active]: activeId === heading.id,
                            })}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(heading.id)?.scrollIntoView({
                                    behavior: 'smooth',
                                });
                                setActiveId(heading.id);
                            }}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
