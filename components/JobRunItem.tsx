import React from 'react';
import { Job, JobRun, JobStatus } from '../types';
import { StatusIcon, ClockIcon, LogIcon } from './icons';

interface JobRunItemProps {
  run: JobRun;
  job?: Job;
  onViewLog: (run: JobRun) => void;
}

const statusStyles: Record<JobStatus, { bg: string; text: string; icon: React.ReactElement }> = {
  [JobStatus.SCHEDULED]: { bg: 'bg-gray-700/50', text: 'text-gray-300', icon: <StatusIcon status={JobStatus.SCHEDULED} /> },
  [JobStatus.PENDING]: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', icon: <StatusIcon status={JobStatus.PENDING} /> },
  [JobStatus.RUNNING]: { bg: 'bg-blue-900/50', text: 'text-blue-400', icon: <StatusIcon status={JobStatus.RUNNING} /> },
  [JobStatus.SUCCESS]: { bg: 'bg-green-900/50', text: 'text-green-400', icon: <StatusIcon status={JobStatus.SUCCESS} /> },
  [JobStatus.FAILED]: { bg: 'bg-red-900/50', text: 'text-red-400', icon: <StatusIcon status={JobStatus.FAILED} /> },
  [JobStatus.TIMEOUT]: { bg: 'bg-purple-900/50', text: 'text-purple-400', icon: <StatusIcon status={JobStatus.TIMEOUT} /> },
  [JobStatus.KILLED]: { bg: 'bg-gray-800', text: 'text-gray-500', icon: <StatusIcon status={JobStatus.KILLED} /> },
};

const truncate = (str: string | null, length: number) => {
    if (!str) return null;
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

export const JobRunItem: React.FC<JobRunItemProps> = ({ run, job, onViewLog }) => {
  const { bg, text, icon } = statusStyles[run.status];
  const isScheduled = run.status === JobStatus.SCHEDULED;
  const isFinished = [JobStatus.SUCCESS, JobStatus.FAILED, JobStatus.TIMEOUT, JobStatus.KILLED].includes(run.status);

  const duration = run.endTime && run.startTime ? `${((run.endTime.getTime() - run.startTime.getTime()) / 1000).toFixed(2)}s` : '...';

  const hasLogs = run.stdout || run.stderr;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 transition-shadow hover:shadow-lg hover:border-gray-600">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">{job?.name || 'Unknown Job'}</h3>
          <p className="text-xs text-gray-500 font-mono">Run ID: {run.id}</p>
          <p className="text-sm text-gray-400 font-mono mt-1">{job ? `${job.command} ${job.args}` : '...'}</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} self-start`}>
          {icon}
          <span>{run.status}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-500 space-x-4 flex-wrap">
        <div className="flex items-center space-x-1">
          <ClockIcon />
          <span>
            {isScheduled 
              ? `Scheduled for ${run.startTime.toLocaleString()}` 
              : `Started at ${run.startTime.toLocaleString()}`}
          </span>
        </div>
        {isFinished && (
          <>
            <span className="text-gray-600">|</span>
            <span>Duration: <span className="font-semibold text-gray-400">{duration}</span></span>
            <span className="text-gray-600">|</span>
            <span>Exit Code: <span className="font-semibold text-gray-400">{run.exitCode ?? 'N/A'}</span></span>
          </>
        )}
      </div>

      {(run.stdout || run.stderr) && (
        <div className="mt-4 space-y-2">
          {run.stdout && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400">STDOUT</h4>
              <pre className="bg-black/50 p-3 rounded-md text-xs text-gray-300 whitespace-pre-wrap font-mono">{truncate(run.stdout, 150)}</pre>
            </div>
          )}
          {run.stderr && (
            <div>
              <h4 className="text-sm font-semibold text-red-400">STDERR</h4>
              <pre className="bg-red-900/20 p-3 rounded-md text-xs text-red-300 whitespace-pre-wrap font-mono">{truncate(run.stderr, 150)}</pre>
            </div>
          )}
        </div>
      )}
      
      {hasLogs && (
        <div className="mt-4 text-right">
            <button
                onClick={() => onViewLog(run)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
            >
                <LogIcon />
                <span className="ml-2">View Full Log</span>
            </button>
        </div>
      )}
    </div>
  );
};