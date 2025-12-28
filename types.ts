import { Feather } from '@expo/vector-icons';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'TO_READ' | 'READING' | 'DONE';
  rating?: number;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export type GoalType = 'YEAR' | 'MONTH' | 'WEEK';

export interface Goal {
  id: string;
  type: GoalType;
  description: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    focus: string;
    metrics: string; // JSON string for metrics
}

export interface Habit {
  id: string;
  title: string; // name in the hook
  archived: number; // 0 or 1
  createdAt: string;
}

export interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  target: number;
  isVisible: number; // 0 or 1
}

export interface UserSettings {
    id: 'user'; // Primary key
    current_streak: number;
    last_completed_date: string | null;
    freeze_days: number;
    current_theme: string;
}