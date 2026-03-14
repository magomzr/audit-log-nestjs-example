import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';

@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  // Corre todos los días a medianoche
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRetention() {
    const retentionDays = this.config.get<number>('AUDIT_RETENTION_DAYS', 90);
    this.logger.log({ msg: 'audit_retention_start', retentionDays });
    const deleted = await this.auditService.purge(retentionDays);
    this.logger.log({ msg: 'audit_retention_done', deleted });
  }
}
