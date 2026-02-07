// ============================================================
// ExamTimer - Countdown Timer Component
// ============================================================

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface ExamTimerProps {
    initialMinutes: number;
    onTimeUp: () => void;
}

export function ExamTimer({ initialMinutes, onTimeUp }: ExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isWarning = timeLeft <= 300; // 5 minutes warning
    const isCritical = timeLeft <= 60; // 1 minute critical

    return (
        <div className={clsx(
            "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono text-lg font-black transition-all duration-300 border shadow-lg",
            isCritical
                ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse"
                : isWarning
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-500"
                    : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]"
        )}>
            {isCritical ? (
                <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : (
                <Clock className="w-5 h-5" />
            )}
            <span className="min-w-[80px] text-center">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
