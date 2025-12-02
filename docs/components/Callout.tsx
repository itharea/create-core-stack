import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import styles from './Callout.module.css';
import clsx from 'clsx';

type CalloutType = 'info' | 'warning' | 'error' | 'success';

const icons = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
};

export default function Callout({
    children,
    type = 'info',
    title,
}: {
    children: React.ReactNode;
    type?: CalloutType;
    title?: string;
}) {
    const Icon = icons[type];

    return (
        <div className={clsx(styles.callout, styles[type])}>
            <div className={styles.icon}>
                <Icon size={20} />
            </div>
            <div className={styles.content}>
                {title && <h5 className={styles.title}>{title}</h5>}
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}
