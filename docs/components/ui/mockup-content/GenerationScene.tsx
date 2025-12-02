'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import styles from './GenerationScene.module.css';
import { TerminalAnimation } from './TerminalAnimation';
import { FileTree } from './FileTree';
import { useGenerationAnimation } from './useGenerationAnimation';

export function GenerationScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const state = useGenerationAnimation(isInView);

  return (
    <div ref={containerRef} className={styles.scene}>
      <div className={styles.terminalPanel}>
        <TerminalAnimation state={state} />
      </div>
      <div className={styles.divider} />
      <div className={styles.fileTreePanel}>
        <FileTree state={state} />
      </div>
    </div>
  );
}
