'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import styles from './CodeBlock.module.css';

export default function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            className={styles.copyButton}
            onClick={copy}
            aria-label="Copy code"
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
    );
}
