
import React, { useState } from 'react';

interface JobFormProps {
  onRunJob: (details: {
    jobName: string;
    command: string;
    args: string;
    executionType: 'IMMEDIATE' | 'SCHEDULED';
    scheduledTime: Date | null;
  }) => void;
  onShowAlert: (message: string) => void;
}

export const JobForm: React.FC<JobFormProps> = ({ onRunJob, onShowAlert }) => {
  const [jobName, setJobName] = useState('My Test Job');
  const [command, setCommand] = useState('echo');
  const [args, setArgs] = useState('hello world from a queued job');
  const [executionType, setExecutionType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  
  // Get current time + 1 minute and format it for the datetime-local input default
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 1); // Adjust for local timezone and set 1 min ahead
  const defaultScheduledTime = now.toISOString().slice(0, 16);

  const [scheduledTime, setScheduledTime] = useState(defaultScheduledTime);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName || !command) return;
    
    if (executionType === 'SCHEDULED') {
        if (!scheduledTime) {
            onShowAlert("Please select a valid scheduled time.");
            return;
        }
        if (new Date(scheduledTime).getTime() < Date.now()) {
            onShowAlert("Scheduled time cannot be in the past.");
            return;
        }
    }


    setIsLoading(true);
    onRunJob({
      jobName,
      command,
      args,
      executionType,
      scheduledTime: executionType === 'SCHEDULED' ? new Date(scheduledTime) : null,
    });
    // Give brief visual feedback for the user
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">Create Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobName" className="block text-sm font-medium text-gray-400">Job Name</label>
          <input
            type="text"
            id="jobName"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-white"
            placeholder="e.g., Daily Backup Script"
            required
          />
        </div>
        <div>
          <label htmlFor="command" className="block text-sm font-medium text-gray-400">Command / Path</label>
          <input
            type="text"
            id="command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-white"
            placeholder="e.g., /bin/sh or cmd.exe"
            required
          />
        </div>
        <div>
          <label htmlFor="args" className="block text-sm font-medium text-gray-400">Arguments</label>
          <input
            type="text"
            id="args"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-white"
            placeholder="e.g., my-script.sh --force"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400">Execution Type</label>
          <div className="mt-2 flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="executionType"
                value="IMMEDIATE"
                checked={executionType === 'IMMEDIATE'}
                onChange={() => setExecutionType('IMMEDIATE')}
                className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-white">Immediate</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="executionType"
                value="SCHEDULED"
                checked={executionType === 'SCHEDULED'}
                onChange={() => setExecutionType('SCHEDULED')}
                className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-white">Scheduled</span>
            </label>
          </div>
        </div>

        {executionType === 'SCHEDULED' && (
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-400">Scheduled Time</label>
            <input
              type="datetime-local"
              id="scheduledTime"
              value={scheduledTime}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 text-white appearance-none"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            executionType === 'SCHEDULED' ? 'Schedule Job' : 'Queue Job'
          )}
        </button>
      </form>
    </div>
  );
};
