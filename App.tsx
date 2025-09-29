
import React, { useState, useCallback, useEffect } from 'react';
import { Job, JobRun, JobStatus } from './types';
import { JobForm } from './components/JobForm';
import { JobRunList } from './components/JobRunList';
import { LogModal } from './components/LogModal';
import { Alert } from './components/Alert';
import { simulateCommandExecution } from './services/geminiService';
import { JOB_EXECUTION_TIMEOUT_MS, MAX_CONCURRENT_JOBS } from './constants';

// Helper to revive date strings from JSON
const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
};

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const savedJobs = localStorage.getItem('jobs');
      return savedJobs ? JSON.parse(savedJobs, dateReviver) : [];
    } catch (e) {
      console.error("Failed to parse jobs from localStorage", e);
      return [];
    }
  });

  const [jobRuns, setJobRuns] = useState<JobRun[]>(() => {
    try {
      const savedJobRuns = localStorage.getItem('jobRuns');
      return savedJobRuns ? JSON.parse(savedJobRuns, dateReviver) : [];
    } catch(e) {
      console.error("Failed to parse job runs from localStorage", e);
      return [];
    }
  });
  
  const [selectedRun, setSelectedRun] = useState<JobRun | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showAlert = (message: string, type: 'error' | 'success' = 'error') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 5000); // Auto-dismiss after 5s
  };

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('jobRuns', JSON.stringify(jobRuns));
  }, [jobs, jobRuns]);


  const executeJob = useCallback(async (job: Job, runId: string) => {
    // Set status to RUNNING. For scheduled jobs, this officially marks their start.
    setJobRuns(prev => prev.map(run => run.id === runId ? { ...run, status: JobStatus.RUNNING } : run));

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), JOB_EXECUTION_TIMEOUT_MS)
      );

      const executionPromise = simulateCommandExecution(job.command, job.args);

      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      setJobRuns(prev => prev.map(run =>
        run.id === runId
          ? {
              ...run,
              status: result.exitCode === 0 ? JobStatus.SUCCESS : JobStatus.FAILED,
              stdout: result.stdout,
              stderr: result.stderr,
              endTime: new Date(),
              exitCode: result.exitCode,
            }
          : run
      ));
    } catch (error) {
      const isTimeout = (error as Error).message === 'Execution timed out';
      setJobRuns(prev => prev.map(run =>
        run.id === runId
          ? {
              ...run,
              status: isTimeout ? JobStatus.TIMEOUT : JobStatus.FAILED,
              stderr: (error as Error).message,
              endTime: new Date(),
              exitCode: isTimeout ? -1 : 1,
            }
          : run
      ));
    }
  }, []);

  // Job dispatcher: Manages the queue and respects concurrency limits
  useEffect(() => {
    const runningJobCount = jobRuns.filter(r => r.status === JobStatus.RUNNING).length;
    const availableSlots = MAX_CONCURRENT_JOBS - runningJobCount;

    if (availableSlots > 0) {
      // Find the oldest jobs that are ready to run
      const readyToRun = [...jobRuns]
        .reverse()
        .filter(run => {
          const isPending = run.status === JobStatus.PENDING;
          const isDueScheduled = run.status === JobStatus.SCHEDULED && new Date(run.startTime).getTime() <= Date.now();
          return isPending || isDueScheduled;
        });

      const jobsToStart = readyToRun.slice(0, availableSlots);

      if (jobsToStart.length > 0) {
        jobsToStart.forEach(runToStart => {
          const job = jobs.find(j => j.id === runToStart.jobId);
          if (job) {
            executeJob(job, runToStart.id);
          }
        });
      }
    }
  }, [jobRuns, jobs, executeJob]);
  
  // Startup logic: Reschedule jobs and mark interrupted ones
  useEffect(() => {
    const now = Date.now();
    const runsToUpdate = jobRuns.map(run => {
      // Mark unfinished runs as KILLED
      if (run.status === JobStatus.RUNNING || run.status === JobStatus.PENDING) {
        return { ...run, status: JobStatus.KILLED, stderr: 'Job was terminated due to application restart.', exitCode: -1 };
      }

      // Mark past-due scheduled jobs that were missed as FAILED
      if (run.status === JobStatus.SCHEDULED && run.startTime.getTime() < now) {
          return { ...run, status: JobStatus.FAILED, stderr: 'Scheduled execution time was missed while the application was offline.', exitCode: 1 };
      }
      return run;
    });

    // Only update state if there are actual changes to prevent re-renders
    if (JSON.stringify(runsToUpdate) !== JSON.stringify(jobRuns)) {
        setJobRuns(runsToUpdate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on startup


  const handleRunJob = useCallback((details: {
    jobName: string;
    command: string;
    args: string;
    executionType: 'IMMEDIATE' | 'SCHEDULED';
    scheduledTime: Date | null;
  }) => {
    const { jobName, command, args, executionType, scheduledTime } = details;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      name: jobName,
      command,
      args,
      executionType,
      scheduledTime,
    };
    setJobs(prev => [...prev, newJob]);

    const newJobRun: JobRun = {
      id: `run-${Date.now()}`,
      jobId: newJob.id,
      // If scheduled in the future, set to SCHEDULED. Otherwise, set to PENDING to be picked by the queue.
      status: executionType === 'SCHEDULED' && scheduledTime && scheduledTime.getTime() > Date.now()
        ? JobStatus.SCHEDULED
        : JobStatus.PENDING,
      startTime: scheduledTime || new Date(),
      endTime: null,
      stdout: null,
      stderr: null,
      exitCode: null,
    };
    setJobRuns(prev => [newJobRun, ...prev]);

  }, []);

  const handleViewLogs = (run: JobRun) => {
    setSelectedRun(run);
  };

  const handleCloseLogs = () => {
    setSelectedRun(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 lg:p-8">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">Core Execution Engine</h1>
        <p className="text-gray-400 mt-2">A robust job scheduler with concurrency control and persistent state.</p>
      </header>
      
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <JobForm onRunJob={handleRunJob} onShowAlert={showAlert} />
        </div>
        <div className="lg:col-span-2">
          <JobRunList jobs={jobs} jobRuns={jobRuns} onViewLog={handleViewLogs} />
        </div>
      </main>

      {selectedRun && (
        <LogModal 
          run={selectedRun} 
          job={jobs.find(j => j.id === selectedRun.jobId)}
          onClose={handleCloseLogs} 
        />
      )}
    </div>
  );
};

export default App;
