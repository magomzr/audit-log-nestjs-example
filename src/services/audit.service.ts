import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Db } from 'src/db';
import { auditEvents } from 'src/db/schema';

export interface AuditEventDto {
  who: string;
  action: string;
  resource: string;
  resourceId: string | null;
  before: unknown;
  after: unknown;
  ip: string;
  userAgent: string | null;
  statusCode: number;
  durationMs: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(@Inject('DB') private readonly db: Db) {}

  async record(event: AuditEventDto): Promise<void> {
    // the try-catch is mandatory because it is just observability, not business
    // logic.
    try {
      await this.db.insert(auditEvents).values(event);
      this.logger.log({
        msg: 'audit_event',
        ...event,
      });
    } catch (err) {
      // Audit never has to break the app. Just logg the error
      this.logger.error({ msg: 'audit_event_failed', error: err, event });
    }
  }
}
