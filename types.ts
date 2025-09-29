export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  KILLED = 'KILLED',
}

export interface Job {
  id: string;
  name: string;
  exec_path?: string; // Kept for schema compatibility, but using command
  command: string;
  args: string;
  executionType: 'IMMEDIATE' | 'SCHEDULED';
  scheduledTime: Date | null;
}

export interface JobRun {
  id: string;
  jobId: string;
  status: JobStatus;
  startTime: Date;
  endTime: Date | null;
  stdout: string | null;
  stderr: string | null;
  exitCode: number | null;
}