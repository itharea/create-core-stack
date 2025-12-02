'use client';

import { useState, useEffect, useCallback } from 'react';

export type AnimationPhase =
  | 'idle'
  | 'typing'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'complete'
  | 'fading';

export interface GenerationState {
  phase: AnimationPhase;
  progress: number; // 0-100
  typingProgress: number; // 0-1 for command typing
  currentStage: number; // 0-4
  isPhoneRevealed: boolean;
}

const LOOP_DURATION = 11000; // 10 seconds total loop

// Timing configuration (in ms from start)
const TIMING = {
  typingStart: 500,
  typingEnd: 2500,
  stage1Start: 2500,
  stage1End: 3500,
  stage2Start: 3500,
  stage2End: 5000,
  stage3Start: 5000,
  stage3End: 5500,
  stage4Start: 5500,
  stage4End: 7000,
  completeAt: 7000,
  phoneRevealStart: 7000,
  fadeStart: 10500,
  loopReset: 11000,
};

export function useGenerationAnimation(isInView: boolean = true) {
  const [state, setState] = useState<GenerationState>({
    phase: 'idle',
    progress: 0,
    typingProgress: 0,
    currentStage: 0,
    isPhoneRevealed: false,
  });

  const calculateState = useCallback((elapsed: number): GenerationState => {
    const t = elapsed % LOOP_DURATION;

    // Determine phase based on timing
    let phase: AnimationPhase = 'idle';
    let currentStage = 0;
    let typingProgress = 0;
    let progress = 0;
    let isPhoneRevealed = false;

    if (t < TIMING.typingStart) {
      phase = 'idle';
    } else if (t < TIMING.typingEnd) {
      phase = 'typing';
      typingProgress = (t - TIMING.typingStart) / (TIMING.typingEnd - TIMING.typingStart);
    } else if (t < TIMING.stage1End) {
      phase = 'stage1';
      currentStage = 1;
      typingProgress = 1;
      progress = ((t - TIMING.stage1Start) / (TIMING.stage1End - TIMING.stage1Start)) * 25;
    } else if (t < TIMING.stage2End) {
      phase = 'stage2';
      currentStage = 2;
      typingProgress = 1;
      progress = 25 + ((t - TIMING.stage2Start) / (TIMING.stage2End - TIMING.stage2Start)) * 25;
    } else if (t < TIMING.stage3End) {
      phase = 'stage3';
      currentStage = 3;
      typingProgress = 1;
      progress = 50 + ((t - TIMING.stage3Start) / (TIMING.stage3End - TIMING.stage3Start)) * 25;
    } else if (t < TIMING.stage4End) {
      phase = 'stage4';
      currentStage = 4;
      typingProgress = 1;
      progress = 75 + ((t - TIMING.stage4Start) / (TIMING.stage4End - TIMING.stage4Start)) * 25;
    } else if (t < TIMING.fadeStart) {
      phase = 'complete';
      currentStage = 4;
      typingProgress = 1;
      progress = 100;
    } else {
      phase = 'fading';
      currentStage = 4;
      typingProgress = 1;
      progress = 100;
    }

    // Phone reveals after stage 2 starts
    isPhoneRevealed = t >= TIMING.phoneRevealStart && t < TIMING.fadeStart;

    return {
      phase,
      progress: Math.min(100, Math.max(0, progress)),
      typingProgress: Math.min(1, Math.max(0, typingProgress)),
      currentStage,
      isPhoneRevealed,
    };
  }, []);

  useEffect(() => {
    if (!isInView) {
      setState({
        phase: 'idle',
        progress: 0,
        typingProgress: 0,
        currentStage: 0,
        isPhoneRevealed: false,
      });
      return;
    }

    let animationFrame: number;

    const tick = () => {
      const elapsed = Date.now(); // Use global clock for sync across components
      setState(calculateState(elapsed));
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isInView, calculateState]);

  return state;
}
