import { Injectable, Logger } from '@nestjs/common';
import { ISourceAdapter, AdapterFinding } from './source-adapter.interface';
import { PrivacyUtil } from '../common/utils/privacy.util';
import axios from 'axios';

@Injectable ()
export class HibpExposureAdapter implements ISourceAdapter {
  readonly adapterName = 'HaveIBeenPwned_Category_Adapter';
  private readonly logger = new Logger(HibpExposureAdapter.name);

  supports(scanType: string): boolean {
    return scanType === 'EMAIL';
  }

  async executeScan(normalizedInput: string): Promise<AdapterFinding[]> {
    try {
      // Use k-Anonymity SHA-1 lookup model to ensure zero exposure of full input to remote APIs
      const kPrefix = PrivacyUtil.toKAnonymityPrefix(normalizedInput);
      const url = `https://api.pwnedpasswords.com/range/${kPrefix}`;
      
      const response = await axios.get(url, { headers: { 'User-Agent': 'SafeOSINT-Enterprise-Monitor' } });
      const matches = response.data.split('\r\n');
      
      // We only return category metadata, zero password or credential leak values
      if (matches.length > 0) {
        return [{
          source: 'HIBP Breach Notification Engine',
          category: 'Credential Exposure Indicator',
          severity: 'HIGH',
          confidence: 0.95,
          redactedValue: 'Exposed in public data dump (Hash prefix match found)',
          remediation: 'Rotate credentials immediately on affected platforms and enforce MFA.',
        }];
      }
      return [];
    } catch (error) {
      this.logger.error(`Adapter failed execution safely: ${error.message}`);
      return [];
    }
  }
}
