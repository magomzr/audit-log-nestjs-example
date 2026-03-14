export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['insert:element', 'update:element', 'delete:element', 'read:element'],
  editor: ['insert:element', 'update:element', 'read:element'],
  viewer: ['read:element'],
};

export enum Perm {
  INSERT = 'insert:element',
  UPDATE = 'update:element',
  DELETE = 'delete:element',
  READ = 'read:element',
}
