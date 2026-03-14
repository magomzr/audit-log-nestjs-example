import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { ElementsModule } from './modules/elements.module';
import { AuditModule } from './modules/audit.module';
import { HealthController } from './controllers/health.controller';
import { DbModule } from './modules/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const lokiUrl = config.get<string>('LOKI_URL');
        return {
          pinoHttp: {
            level: 'info',
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie'],
              censor: '[REDACTED]',
            },
            transport: lokiUrl
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
            ...(lokiUrl && {
              transport: {
                targets: [
                  {
                    target: 'pino-loki',
                    level: 'info',
                    options: {
                      host: lokiUrl,
                      labels: { app: 'audit-log-api' },
                      batching: true,
                      interval: 5,
                    },
                  },
                  {
                    target: 'pino-pretty',
                    level: 'info',
                    options: { singleLine: true },
                  },
                ],
              },
            }),
          },
        };
      },
    }),
    DbModule,
    AuthModule,
    ElementsModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
