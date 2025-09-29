import React from 'react';
import { Job, JobRun } from '../types';
import { CloseIcon } from './icons';

interface LogModalProps {
  run: JobRun;
  job?: Job;
  onClose: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({ run, job, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{job?.name || 'Log Details'}</h2>
            <p className="text-xs text-gray-500 font-mono">Run ID: {run.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close log viewer"
          >
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-4">
          {run.stdout ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">STDOUT</h4>
              <pre className="bg-black/50 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap font-mono">{run.stdout}</pre>
            </div>
          ) : (
             <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">STDOUT</h4>
              <div className="bg-black/50 p-4 rounded-md text-sm text-gray-500 italic">No standard output was produced.</div>
            </div>
          )}

          {run.stderr ? (
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2">STDERR</h4>
              <pre className="bg-red-900/20 p-4 rounded-md text-sm text-red-300 whitespace-pre-wrap font-mono">{run.stderr}</pre>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2">STDERR</h4>
              <div className="bg-black/50 p-4 rounded-md text-sm text-gray-500 italic">No standard error was produced.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};