import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditInterceptor } from 'src/interceptors/audit.interceptor';
import { AuditService } from 'src/services/audit.service';
import { AuditRetentionService } from 'src/services/audit-retention.service';
import { AuditController } from 'src/controllers/audit.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRetentionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
