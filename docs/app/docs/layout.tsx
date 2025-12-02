import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import styles from '@/components/Sidebar.module.css'; // Reusing for container structure if needed, or inline styles

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container" style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    minWidth: 0, // Prevent flex item from overflowing
                    paddingTop: 'var(--space-8)',
                    paddingBottom: 'var(--space-16)',
                }}
            >
                {children}
            </main>
            <TableOfContents />
        </div>
    );
}
