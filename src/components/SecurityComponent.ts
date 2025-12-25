/**
 * Security and Access Control Component
 */

import * as crypto from 'crypto';
import { ISecurityComponent, ILogger } from '../interfaces/components';
import { User, UserRole, AuditLog } from '../types/index';
import { createLogger } from '../utils/logger';
import { UnauthorizedError, ForbiddenError, EncryptionError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class SecurityComponent implements ISecurityComponent {
  private logger: ILogger;
  private users: Map<string, User> = new Map();
  private auditLogs: AuditLog[] = [];
  private rolePermissions: Map<UserRole, Set<string>> = new Map();

  constructor(encryptionKey: string) {
    this.logger = createLogger('SecurityComponent');
    this.initializeRolePermissions();
  }

  async authenticateUser(credentials: { username: string; password: string }): Promise<{ token: string; userId: string }> {
    const user = Array.from(this.users.values()).find((u) => u.username === credentials.username);

    if (!user) {
      this.logAuditEvent(
        {
          action: 'authentication_failed',
          resource: 'user',
          resourceId: credentials.username,
        },
        'system',
        new Date()
      );
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // In real implementation, verify password hash
    const token = this.generateToken(user.userId);

    user.lastLogin = new Date();

    this.logAuditEvent(
      {
        action: 'authentication_success',
        resource: 'user',
        resourceId: user.userId,
      },
      user.userId,
      new Date()
    );

    return { token, userId: user.userId };
  }

  async authorizeAccess(userId: string, resource: string, action: string): Promise<boolean> {
    const user = this.users.get(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const hasPermission = user.permissions.some((p) => p.resource === resource && p.action === action && p.granted);

    if (!hasPermission) {
      this.logAuditEvent(
        {
          action: 'access_denied',
          resource,
          resourceId: resource,
        },
        userId,
        new Date()
      );
      throw new ForbiddenError(`Access denied to ${resource}:${action}`);
    }

    this.logAuditEvent(
      {
        action: 'access_granted',
        resource,
        resourceId: resource,
      },
      userId,
      new Date()
    );

    return true;
  }

  async encryptData(data: unknown, encryptionKey: string): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const iv = crypto.randomBytes(16);
      const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new EncryptionError(`Encryption failed: ${(error as Error).message}`);
    }
  }

  async logAuditEvent(event: Record<string, unknown>, user: string, timestamp: Date): Promise<void> {
    const auditLog: AuditLog = {
      logId: uuidv4(),
      userId: user,
      action: event.action as string,
      resource: event.resource as string,
      resourceId: event.resourceId as string,
      timestamp,
      changes: event.changes as Record<string, unknown> | undefined,
    };

    this.auditLogs.push(auditLog);
    this.logger.info(`Audit event logged`, { logId: auditLog.logId, action: auditLog.action });
  }

  async maskSensitiveData(data: unknown, userRole: string): Promise<unknown> {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const obj = data as Record<string, unknown>;
    const masked: Record<string, unknown> = { ...obj };

    // Define sensitive fields
    const sensitiveFields = ['ssn', 'dateOfBirth', 'medicalRecordNumber', 'email', 'phone'];

    for (const field of sensitiveFields) {
      if (field in masked) {
        if (userRole === 'admin' || userRole === 'ctt') {
          // Admins and CTT can see full data
          continue;
        } else if (userRole === 'cra') {
          // CRAs see partial data
          masked[field] = this.partialMask(String(masked[field]));
        } else {
          // Others see masked data
          masked[field] = '***MASKED***';
        }
      }
    }

    return masked;
  }

  registerUser(user: User): void {
    this.users.set(user.userId, user);
    this.logger.info(`User registered`, { userId: user.userId, role: user.role });
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private generateToken(userId: string): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private partialMask(value: string): string {
    if (value.length <= 4) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }

  private initializeRolePermissions(): void {
    this.rolePermissions.set('admin', new Set(['read', 'write', 'delete', 'manage_users']));
    this.rolePermissions.set('ctt', new Set(['read', 'write', 'generate_reports']));
    this.rolePermissions.set('cra', new Set(['read', 'write']));
    this.rolePermissions.set('site_coordinator', new Set(['read', 'write']));
    this.rolePermissions.set('viewer', new Set(['read']));
  }
}
