'use client';

import { useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import styles from './PhoneAppPreview.module.css';
import { PhoneIcon } from './Icons';
import { useGenerationAnimation } from './useGenerationAnimation';

// Calculate ring number for a dot based on distance from center
function getRing(row: number, col: number, centerRow: number, centerCol: number): number {
  return Math.max(Math.abs(row - centerRow), Math.abs(col - centerCol));
}

// Pulse Grid Loader Component
function LoadingPhase({ progress }: { progress: number }) {
  const rows = 5;
  const cols = 7;
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  const maxRing = Math.max(centerRow, centerCol);

  // Calculate which rings should be active based on progress
  const activeRings = Math.ceil((progress / 100) * (maxRing + 1));

  const dots = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ring = getRing(row, col, centerRow, centerCol);
        result.push({ row, col, ring });
      }
    }
    return result;
  }, []);

  return (
    <div className={styles.loadingPhase}>
      <div className={styles.pulseGlow} />
      <div className={styles.pulseGrid}>
        {dots.map(({ row, col, ring }) => (
          <div
            key={`${row}-${col}`}
            className={`${styles.gridDot} ${ring < activeRings ? styles.active : ''}`}
            style={{
              animationDelay: `${ring * 0.15}s`,
            }}
          />
        ))}
      </div>
      <div className={styles.loadingInfo}>
        <span className={styles.loadingPercent}>{Math.round(progress)}%</span>
        <span className={styles.loadingText}>
          Generating<span className={styles.cursor} />
        </span>
      </div>
    </div>
  );
}

// Blueprint App Preview Component
function AppPreview() {
  return (
    <div className={styles.appPreview}>
      {/* Status Bar */}
      <motion.div
        className={styles.statusBar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className={styles.statusTime}>9:41</span>
        <div className={styles.statusIcons}>
          <div className={styles.statusIcon}>
            <svg viewBox="0 0 18 12">
              <path d="M1 8h2v3H1zM5 5h2v6H5zM9 3h2v8H9zM13 1h2v10h-2z" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.statusIcon}>
            <svg viewBox="0 0 16 12">
              <path d="M8 2C4.5 2 1.5 4 0 7c1.5 3 4.5 5 8 5s6.5-2 8-5c-1.5-3-4.5-5-8-5z" />
              <circle cx="8" cy="7" r="2" />
            </svg>
          </div>
          <div className={styles.statusIcon}>
            <svg viewBox="0 0 20 10">
              <rect x="0" y="0" width="18" height="10" rx="2" />
              <rect x="18" y="3" width="2" height="4" rx="1" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
      >
        <div className={styles.headerLogo} />
        <div className={styles.headerTitle} />
      </motion.div>

      {/* Blueprint Card with Graph */}
      <motion.div
        className={styles.blueprintCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.2 }}
      >
        <div className={`${styles.cornerBracket} ${styles.topLeft}`} />
        <div className={`${styles.cornerBracket} ${styles.topRight}`} />
        <div className={`${styles.cornerBracket} ${styles.bottomLeft}`} />
        <div className={`${styles.cornerBracket} ${styles.bottomRight}`} />

        <div className={styles.cardContent}>
          <div className={styles.graphContainer}>
            <svg className={styles.graph} viewBox="0 0 200 50" preserveAspectRatio="none">
              <path
                className={styles.graphLine}
                d="M 0 40 L 40 35 L 80 20 L 120 30 L 160 10 L 200 25"
              />
              <circle className={styles.graphDot} cx="0" cy="40" r="3" />
              <circle className={styles.graphDot} cx="40" cy="35" r="3" />
              <circle className={styles.graphDot} cx="80" cy="20" r="3" />
              <circle className={styles.graphDot} cx="120" cy="30" r="3" />
              <circle className={styles.graphDot} cx="160" cy="10" r="3" />
              <circle className={styles.graphDot} cx="200" cy="25" r="3" />
            </svg>
          </div>
          <div className={styles.textLines}>
            <div className={styles.textLine} />
            <div className={styles.textLine} />
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <motion.div
          className={styles.statBox}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.3 }}
        >
          <span className={styles.statValue}>247</span>
          <div className={styles.statLabel} />
        </motion.div>
        <motion.div
          className={styles.statBox}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.35 }}
        >
          <span className={styles.statValue}>98%</span>
          <div className={styles.statLabel} />
        </motion.div>
      </div>

      {/* List Items */}
      <div className={styles.listSection}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={styles.listItem}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              delay: 0.4 + index * 0.06,
            }}
          >
            <div className={styles.listAvatar} />
            <div className={styles.listContent}>
              <div className={styles.listTitle} />
              <div className={styles.listSubtitle} />
            </div>
            <div className={styles.listChevron} />
          </motion.div>
        ))}
      </div>

      {/* Tab Bar */}
      <motion.div
        className={styles.tabBar}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.6 }}
      >
        <div className={`${styles.tabDot} ${styles.active}`} />
        <div className={styles.tabDot} />
        <div className={styles.tabDot}>
          <span className={styles.notificationDot} />
        </div>
        <div className={styles.tabDot} />
      </motion.div>
    </div>
  );
}

// Idle State Component
function IdleState() {
  return (
    <div className={styles.idleState}>
      <div className={styles.idlePulse} />
      <PhoneIcon size={32} className={styles.idleIcon} />
    </div>
  );
}

export function PhoneAppPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const state = useGenerationAnimation(isInView);

  const showAppPreview = state.isPhoneRevealed;
  const showLoading = !showAppPreview && state.phase !== 'idle' && state.phase !== 'fading';

  return (
    <div ref={containerRef} className={styles.container}>
      <AnimatePresence mode="wait">
        {state.phase === 'fading' ? (
          <motion.div
            key="fading"
            className={styles.fadeOut}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        ) : showLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.fullHeight}
          >
            <LoadingPhase progress={state.progress} />
          </motion.div>
        ) : showAppPreview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={styles.fullHeight}
          >
            <AppPreview />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.fullHeight}
          >
            <IdleState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
