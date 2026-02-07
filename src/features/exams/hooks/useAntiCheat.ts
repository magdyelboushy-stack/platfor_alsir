// ============================================================
// useAntiCheat - Custom Hook for Exam Proctoring
// ============================================================

import { useEffect, useCallback, useRef, useState } from 'react';
import type { AntiCheatEvent, ProctorState } from '../types';

interface UseAntiCheatOptions {
    enabled: boolean;
    maxWarnings?: number;
    onViolation?: (event: AntiCheatEvent) => void;
    onLockout?: () => void;
}

export function useAntiCheat({
    enabled,
    maxWarnings = 3,
    onViolation,
    onLockout,
}: UseAntiCheatOptions) {
    const [state, setState] = useState<ProctorState>({
        isFullscreen: false,
        violations: [],
        warningsCount: 0,
        isLocked: false,
    });

    const violationsRef = useRef<AntiCheatEvent[]>([]);

    // --------------------------------------------------------
    // Record Violation
    // --------------------------------------------------------
    const recordViolation = useCallback((type: AntiCheatEvent['type'], metadata?: Record<string, unknown>) => {
        const event: AntiCheatEvent = {
            type,
            timestamp: new Date().toISOString(),
            metadata,
        };

        violationsRef.current.push(event);

        setState((prev) => {
            const newWarnings = prev.warningsCount + 1;
            const isLocked = newWarnings >= maxWarnings;

            if (isLocked) {
                onLockout?.();
            }

            return {
                ...prev,
                violations: [...prev.violations, event],
                warningsCount: newWarnings,
                isLocked,
            };
        });

        onViolation?.(event);
    }, [maxWarnings, onViolation, onLockout]);

    // --------------------------------------------------------
    // Fullscreen Management
    // --------------------------------------------------------
    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: true }));
        } catch (err) {
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            setState((prev) => ({ ...prev, isFullscreen: false }));
        } catch (err) {
        }
    }, []);

    // --------------------------------------------------------
    // Event Listeners
    // --------------------------------------------------------
    useEffect(() => {
        if (!enabled) return;

        // Tab visibility change
        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordViolation('tab_switch');
            }
        };

        // Fullscreen change
        const handleFullscreenChange = () => {
            const isFullscreen = !!document.fullscreenElement;
            setState((prev) => ({ ...prev, isFullscreen }));

            if (!isFullscreen && state.isFullscreen) {
                recordViolation('fullscreen_exit');
            }
        };

        // Copy/Paste prevention
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            recordViolation('copy_paste');
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            recordViolation('copy_paste');
        };

        // Right-click prevention
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            recordViolation('right_click');
        };

        // DevTools detection (basic)
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12 or Ctrl+Shift+I
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                recordViolation('devtools');
            }

            // Ctrl+C, Ctrl+V, Ctrl+U
            if (e.ctrlKey && ['c', 'v', 'u'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                recordViolation('copy_paste');
            }
        };

        // Window blur (switching apps)
        const handleBlur = () => {
            recordViolation('tab_switch');
        };

        // Add listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);

        // Request fullscreen on mount
        enterFullscreen();

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
        };
    }, [enabled, recordViolation, enterFullscreen, state.isFullscreen]);

    return {
        state,
        enterFullscreen,
        exitFullscreen,
        violations: violationsRef.current,
        isLocked: state.isLocked,
        warningsRemaining: maxWarnings - state.warningsCount,
    };
}
