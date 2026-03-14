import { IsOptional, IsString, IsDateString } from 'class-validator';

export interface AuditEvent {
  id: string;
  who: string;
  action: string;
  resource: string;
  resourceId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  statusCode: number | null;
  durationMs: number | null;
  createdAt: Date;
}

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  who?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
