import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PrivacyUtil } from '../common/utils/privacy.util';
import { RiskScoringEngine } from '../engine/risk-scoring.engine';
import { HibpExposureAdapter } from '../adapters/hibp-exposure.adapter';

export class InitiateEmailScanDto {
  @IsEmail()
  @IsNotEmpty()
  rawEmail: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}

@Controller('api/scans')
export class ScansController {
  constructor(
    private readonly riskEngine: RiskScoringEngine,
    private readonly hibpAdapter: HibpExposureAdapter,
  ) {}

  @Post('email')
  @HttpCode(HttpStatus.OK)
  async initiateEmailScan(@Body() dto: InitiateEmailScanDto, @Req() req: any) {
    // 1. Instantly derive hash and masked formats in memory
    const normalizedInput = PrivacyUtil.normalizeInput(dto.rawEmail);
    const inputHash = PrivacyUtil.hashInput(normalizedInput);
    const maskedInput = PrivacyUtil.maskEmail(dto.rawEmail);

    // 2. Perform zero-knowledge adapter lookup
    const findings = await this.hibpAdapter.executeScan(normalizedInput);

    // 3. Perform transparent deterministic scoring
    const riskEvaluation = this.riskEngine.evaluateRisk(findings, true);

    // 4. Return sanitized payload to client (Zero storage of rawEmail)
    return {
      status: 'COMPLETED',
      inputHash,
      maskedInput,
      riskScore: riskEvaluation.score,
      overallSeverity: riskEvaluation.overallSeverity,
      reasons: riskEvaluation.reasons,
      findings,
      timestamp: new Date().toISOString(),
    };
  }
}
