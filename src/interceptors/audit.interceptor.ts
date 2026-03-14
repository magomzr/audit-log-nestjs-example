import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import {
  AUDIT_ACTION_KEY,
  AuditActionMetadata,
} from 'src/decorators/audit-action.decorator';
import { AuditService } from 'src/services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditActionMetadata>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    // If the endpoint doesn't have any @AuditAction, skip auditing
    if (!metadata) return next.handle();

    const req = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((response: any) => {
        const durationMs = Date.now() - startTime;

        // fire and forget - no awaits, no blocking
        setImmediate(() => {
          this.auditService.record({
            who: req.user?.email ?? req.user?.sub ?? 'anonymous',
            action: metadata.action,
            resource: metadata.resource,
            resourceId: req.params?.id ?? null,
            before: response?.before ?? null,
            after: response?.after ?? response ?? null,
            ip: req.ip,
            userAgent: req.headers?.['user-agent'] ?? null,
            statusCode: context.switchToHttp().getResponse().statusCode,
            durationMs,
          });
        });
      }),
    );
  }
}
