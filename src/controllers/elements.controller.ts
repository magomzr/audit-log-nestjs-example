// Usually, the READ operations are not audited unless compliance requires it
// explicitly. Normally, it's just for operations that update states.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ElementsService } from '../services/elements.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Perm } from 'src/config/roles.config';
import { RequirePerms } from 'src/decorators/permissions.decorator';
import { CreateElementDto, UpdateElementDto } from 'src/entities/element';
import { AuditAction } from 'src/decorators/audit-action.decorator';

@Controller('elements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ElementsController {
  constructor(private readonly service: ElementsService) {}

  @Get()
  @RequirePerms(Perm.READ)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePerms(Perm.READ)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePerms(Perm.INSERT)
  @AuditAction('insert', 'element')
  create(@Body() dto: CreateElementDto, @Request() req: any) {
    return this.service.create(dto, req.user.sub);
  }

  @Patch(':id')
  @RequirePerms(Perm.UPDATE)
  @AuditAction('update', 'element')
  update(@Param('id') id: string, @Body() dto: UpdateElementDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/publish')
  @RequirePerms(Perm.UPDATE, Perm.INSERT)
  @AuditAction('publish', 'element')
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Delete(':id')
  @RequirePerms(Perm.DELETE)
  @AuditAction('delete', 'element')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
