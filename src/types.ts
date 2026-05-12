export type TimerType = 'countdown' | 'stopwatch';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'confirming' | 'completed';

export interface FocusSession {
  id: string;
  type: TimerType;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  status: 'completed' | 'discarded';
}

export interface ActiveSession {
  type: TimerType;
  startTime: number;
  initialTimeSet: number; // for countdown
  status: TimerStatus;
}

export interface UserConfig {
  isOnboarded: boolean;
  userName: string;
  userAvatarUrl: string;
  userSceneUrl: string;
  dailyWaterCount: number;
  lastWaterDate: string; // YYYY-MM-DD
  waterHistory: Record<string, number>; // date string -> count
  activeSession?: ActiveSession;
}
