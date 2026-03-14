// As the other decorators, here we have a simple one that receives an action
// and a resource as params and then they're joined and stored as metadata on
// the handler or class that is decorated with it. So this will be different for
// each one of them, according to the action and resource that we want to audit.

import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit:action';

export interface AuditActionMetadata {
  action: string;
  resource: string;
}

export const AuditAction = (action: string, resource: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, resource });
