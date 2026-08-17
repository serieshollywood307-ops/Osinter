import React from 'react';

export interface Finding {
  source: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  redactedValue: string;
  remediation: string;
}

interface ReportProps {
  maskedInput: string;
  riskScore: number;
  overallSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  findings: Finding[];
}

export const RedactedReportCard: React.FC<ReportProps> = ({
  maskedInput,
  riskScore,
  overallSeverity,
  reasons,
  findings,
}) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH': return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MEDIUM': return 'bg-amber-950 text-amber-400 border-amber-800';
      default: return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 max-w-4xl mx-auto space-y-6 mt-8">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase">Target Asset</span>
          <h2 className="text-2xl font-mono font-bold text-cyan-400">{maskedInput}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Risk Matrix Score</span>
            <span className="text-2xl font-black">{riskScore} / 100</span>
          </div>
          <span className={`px-3 py-1.5 rounded-md border text-xs font-bold ${getSeverityBadge(overallSeverity)}`}>
            {overallSeverity}
          </span>
        </div>
      </div>

      {/* Score Drivers */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Deterministic Scoring Drivers</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
          {reasons.map((reason, idx) => (
            <li key={idx} className="font-mono text-xs">{reason}</li>
          ))}
        </ul>
      </div>

      {/* Redacted Findings Table */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">Public Findings & Exposure Metrics</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-xs">
                <th className="py-2 px-3">SOURCE</th>
                <th className="py-2 px-3">CATEGORY</th>
                <th className="py-2 px-3">SEVERITY</th>
                <th className="py-2 px-3">REDACTED VALUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {findings.map((item, index) => (
                <tr key={index} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-semibold text-slate-200">{item.source}</td>
                  <td className="py-3 px-3 text-slate-300">{item.category}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">{item.redactedValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

