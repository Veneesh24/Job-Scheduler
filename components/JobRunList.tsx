import React from 'react';
import { Job, JobRun } from '../types';
import { JobRunItem } from './JobRunItem';

interface JobRunListProps {
  jobs: Job[];
  jobRuns: JobRun[];
  onViewLog: (run: JobRun) => void;
}

export const JobRunList: React.FC<JobRunListProps> = ({ jobs, jobRuns, onViewLog }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">Execution Dashboard</h2>
      {jobRuns.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No jobs have been executed yet.</p>
          <p className="text-gray-500 text-sm">Create a job and run it to see its history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobRuns.map(run => {
            const job = jobs.find(j => j.id === run.jobId);
            return <JobRunItem key={run.id} run={run} job={job} onViewLog={onViewLog} />;
          })}
        </div>
      )}
    </div>
  );
};