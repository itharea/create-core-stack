'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './FileTree.module.css';
import { FolderIcon, FileCodeIcon, PackageIcon } from './Icons';
import type { GenerationState } from './useGenerationAnimation';

interface FileTreeProps {
  state: GenerationState;
}

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  stage: number;
}

const FILE_TREE: TreeNode[] = [
  {
    name: 'my-app',
    type: 'folder',
    stage: 1,
    children: [
      {
        name: 'mobile',
        type: 'folder',
        stage: 1,
        children: [
          {
            name: 'app',
            type: 'folder',
            stage: 2,
            children: [
              { name: '_layout.tsx', type: 'file', stage: 2 },
              { name: 'index.tsx', type: 'file', stage: 2 },
            ],
          },
          {
            name: 'src',
            type: 'folder',
            stage: 3,
            children: [
              { name: 'services', type: 'folder', stage: 3 },
            ],
          },
        ],
      },
      {
        name: 'backend',
        type: 'folder',
        stage: 3,
        children: [
          {
            name: 'src',
            type: 'folder',
            stage: 4,
            children: [
              { name: 'routes', type: 'folder', stage: 4 },
              { name: 'index.ts', type: 'file', stage: 4 },
            ],
          },
          { name: 'prisma', type: 'folder', stage: 4 },
        ],
      },
    ],
  },
];

function TreeNodeItem({
  node,
  currentStage,
  depth = 0,
  index = 0,
  isComplete,
  isLast = false,
}: {
  node: TreeNode;
  currentStage: number;
  depth?: number;
  index?: number;
  isComplete: boolean;
  isLast?: boolean;
}) {
  const isVisible = currentStage >= node.stage || isComplete;
  const isNew = currentStage === node.stage && !isComplete;

  if (!isVisible) return null;

  const isFolder = node.type === 'folder';

  return (
    <motion.div
      className={styles.node}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 0.04
      }}
    >
      <div
        className={`${styles.nodeContent} ${isNew ? styles.nodeNew : ''}`}
        style={{ paddingLeft: `${depth * 18}px` }}
      >
        {depth > 0 && (
          <span className={styles.treeLine}>
            <span className={`${styles.treeLineVertical} ${isLast ? styles.treeLineShort : ''}`} />
            <span className={styles.treeLineHorizontal} />
          </span>
        )}
        <span className={`${styles.icon} ${isFolder ? styles.folderIcon : styles.fileIcon}`}>
          {isFolder ? <FolderIcon size={14} /> : <FileCodeIcon size={14} />}
        </span>
        <span className={styles.nodeName}>{node.name}</span>
        {node.type === 'file' && isNew && (
          <motion.span
            className={styles.newBadge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          />
        )}
      </div>
      {isFolder && node.children && (
        <div className={styles.children}>
          {node.children.map((child, childIndex) => {
            const childIsVisible = currentStage >= child.stage || isComplete;
            if (!childIsVisible) return null;

            const visibleChildren = node.children!.filter(
              c => currentStage >= c.stage || isComplete
            );
            const isLastVisible = childIndex === node.children!.indexOf(visibleChildren[visibleChildren.length - 1]);

            return (
              <TreeNodeItem
                key={child.name}
                node={child}
                currentStage={currentStage}
                depth={depth + 1}
                index={childIndex}
                isComplete={isComplete}
                isLast={isLastVisible}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function Placeholder() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderPulse} />
      <PackageIcon size={28} className={styles.placeholderIcon} />
      <span className={styles.placeholderText}>Waiting for files...</span>
    </div>
  );
}

export function FileTree({ state }: FileTreeProps) {
  const { phase, currentStage } = state;
  const showTree = currentStage > 0 || phase === 'complete' || phase === 'fading';
  const isComplete = phase === 'complete';

  return (
    <AnimatePresence mode="wait">
      {phase !== 'fading' ? (
        <motion.div
          className={styles.fileTree}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {showTree ? (
            <div className={styles.treeContainer}>
              {FILE_TREE.map((node, index) => (
                <TreeNodeItem
                  key={node.name}
                  node={node}
                  currentStage={currentStage}
                  index={index}
                  isComplete={isComplete}
                />
              ))}
            </div>
          ) : (
            <Placeholder />
          )}
        </motion.div>
      ) : (
        <motion.div
          className={styles.fileTree}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </AnimatePresence>
  );
}
