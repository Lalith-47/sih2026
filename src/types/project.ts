export type ProjectStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';

export interface TimelinePoint {
  date: string;
  plannedProgress: number;
  actualProgress: number;
  milestone?: string;
}

export type InputChannel = 'EXCEL' | 'TEXT' | 'VOICE';

export interface ActivityUpdate {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  channel: InputChannel;
  notes: string;
  progressDelta: number;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  wbsCode: string;
  department: string;
  category: string;
  location: string;
  description: string;
  baselineStartDate: string;
  baselineEndDate: string;
  currentProgress: number;
  plannedProgress: number;
  status: ProjectStatus;
  budget: string;
  spent: string;
  supervisor: string;
  contractor: string;
  timelineData: TimelinePoint[];
  recentUpdates: ActivityUpdate[];
}

export interface ProjectFilters {
  searchQuery: string;
  status: string;
  department: string;
}

