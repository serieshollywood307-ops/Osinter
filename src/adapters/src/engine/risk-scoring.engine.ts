import { Injectable } from '@nestjs/common';

export interface ScanFindingInput {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
}

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  overallSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
}

@Injectable()
export class RiskScoringEngine {
  /**
   * Transparent, deterministic evaluation matrix without black-box machine learning.
   */
  evaluateRisk(findings: ScanFindingInput[], domainDmarcValid = true): RiskEvaluationResult {
    let baseScore = 0;
    const reasons: string[] = [];

    for (const finding of findings) {
      const weight = this.getSeverityWeight(finding.severity);
      const adjustedImpact = weight * finding.confidence;
      baseScore += adjustedImpact;

      reasons.push(
        `Finding in category '${finding.category}' yielded severity [${finding.severity}] with confidence ${(finding.confidence * 100).toFixed(0)}%.`
      );
    }

    if (!domainDmarcValid) {
      baseScore += 20;
      reasons.push('Domain missing strict DMARC enforcement policy (+20 Risk Score).');
    }

    const finalScore = Math.min(Math.round(baseScore), 100);
    const overallSeverity = this.mapScoreToSeverity(finalScore);

    return {
      score: finalScore,
      overallSeverity,
      reasons,
    };
  }

  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'CRITICAL': return 40;
      case 'HIGH': return 25;
      case 'MEDIUM': return 15;
      case 'LOW': return 5;
      default: return 0;
    }
  }

  private mapScoreToSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}
