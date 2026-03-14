import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from 'src/services/audit.service';
import { AuditQueryDto } from 'src/entities/audit-event';
import { RequirePerms } from 'src/decorators/permissions.decorator';
import { Perm } from 'src/config/roles.config';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePerms(Perm.READ_AUDIT)
  query(@Query() filters: AuditQueryDto) {
    return this.auditService.query(filters);
  }
}
