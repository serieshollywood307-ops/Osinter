export interface AdapterFinding {
  source: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  redactedValue: string;
  remediation: string;
}

export interface ISourceAdapter {
  readonly adapterName: string;
  supports(scanType: string): boolean;
  executeScan(normalizedInput: string): Promise<AdapterFinding[]>;
}

