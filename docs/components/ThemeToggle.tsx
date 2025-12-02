'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './Navigation.module.css';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            className={styles.iconButton}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
