import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, between, eq, gte, lt, lte, SQL } from 'drizzle-orm';
import type { Db } from 'src/db';
import { auditEvents } from 'src/db/schema';
import { AuditQueryDto } from 'src/entities/audit-event';

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

  async query(filters: AuditQueryDto) {
    const conditions: SQL[] = [];

    if (filters.who) {
      conditions.push(eq(auditEvents.who, filters.who));
    }
    if (filters.action) {
      conditions.push(eq(auditEvents.action, filters.action));
    }
    if (filters.resource) {
      conditions.push(eq(auditEvents.resource, filters.resource));
    }
    if (filters.resourceId) {
      conditions.push(eq(auditEvents.resourceId, filters.resourceId));
    }
    if (filters.from && filters.to) {
      conditions.push(
        between(
          auditEvents.createdAt,
          new Date(filters.from),
          new Date(filters.to),
        ),
      );
    } else if (filters.from) {
      conditions.push(gte(auditEvents.createdAt, new Date(filters.from)));
    } else if (filters.to) {
      conditions.push(lte(auditEvents.createdAt, new Date(filters.to)));
    }

    return this.db
      .select()
      .from(auditEvents)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(auditEvents.createdAt);
  }

  async purge(retentionDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const deleted = await this.db
      .delete(auditEvents)
      .where(lt(auditEvents.createdAt, cutoff))
      .returning({ id: auditEvents.id });

    this.logger.log({
      msg: 'audit_purge',
      deletedCount: deleted.length,
      cutoff: cutoff.toISOString(),
      retentionDays,
    });

    return deleted.length;
  }
}
