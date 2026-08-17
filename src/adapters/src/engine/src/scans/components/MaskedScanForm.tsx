import React, { useState } from 'react';

interface ScanFormProps {
  scanType: 'EMAIL' | 'PHONE' | 'DOMAIN' | 'USERNAME';
  onExecuteScan: (input: string, purpose: string, authorized: boolean) => void;
  isLoading: boolean;
}

export const MaskedScanForm: React.FC<ScanFormProps> = ({ scanType, onExecuteScan, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized || !inputValue || !purpose) return;
    onExecuteScan(inputValue, purpose, isAuthorized);
    setInputValue(''); // Clear raw memory state instantly upon trigger
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400">Authorized {scanType} Exposure Check</h3>
        <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Privacy Preserved
        </span>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">Target Identifier ({scanType})</label>
        <input
          type={scanType === 'EMAIL' ? 'email' : 'text'}
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={scanType === 'EMAIL' ? 'user@organization.com' : 'Target string...'}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">Investigation Purpose / Case Reference</label>
        <input
          type="text"
          required
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., Authorized Security Audit - Case #8942"
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="mb-6 flex items-start space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
        <input
          type="checkbox"
          id="authCheck"
          required
          checked={isAuthorized}
          onChange={(e) => setIsAuthorized(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
        />
        <label htmlFor="authCheck" className="text-xs text-slate-400 leading-relaxed">
          I declare under penalty of authorization breach that I own this asset or have explicit written consent from the owner. Unconsented scanning is explicitly logged and subject to immediate account revocation.
        </label>
      </div>

      <button
        type="submit"
        disabled={!isAuthorized || isLoading}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <span>Processing Scan Pipeline...</span>
        ) : (
          <span>Execute Authorized Pipeline</span>
        )}
      </button>
    </form>
  );
};
