import { codeToHtml } from 'shiki';
import styles from './CodeBlock.module.css';
import { Copy } from 'lucide-react';
import CopyButton from './CopyButton'; // We'll need to create this client component

export default async function CodeBlock({
    code,
    language = 'typescript',
    filename,
}: {
    code: string;
    language?: string;
    filename?: string;
}) {
    const html = await codeToHtml(code, {
        lang: language,
        themes: {
            light: 'github-light',
            dark: 'github-dark',
        },
    });

    return (
        <div className={styles.container}>
            {filename && (
                <div className={styles.header}>
                    <div className={styles.dots}>
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                    </div>
                    <span className={styles.filename}>{filename}</span>
                </div>
            )}
            <div className={styles.content}>
                <div
                    className={styles.code}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
                <CopyButton code={code} />
            </div>
        </div>
    );
}
