
import type { LogEntry } from '../types';

export const addLogEntry = (message: string): LogEntry => {
    return {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        message,
    };
};
