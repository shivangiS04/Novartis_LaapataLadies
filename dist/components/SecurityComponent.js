"use strict";
/**
 * Security and Access Control Component
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityComponent = void 0;
const crypto = __importStar(require("crypto"));
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const uuid_1 = require("uuid");
class SecurityComponent {
    constructor(encryptionKey) {
        this.users = new Map();
        this.auditLogs = [];
        this.rolePermissions = new Map();
        this.logger = (0, logger_1.createLogger)('SecurityComponent');
        this.initializeRolePermissions();
    }
    async authenticateUser(credentials) {
        const user = Array.from(this.users.values()).find((u) => u.username === credentials.username);
        if (!user) {
            this.logAuditEvent({
                action: 'authentication_failed',
                resource: 'user',
                resourceId: credentials.username,
            }, 'system', new Date());
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('User account is inactive');
        }
        // In real implementation, verify password hash
        const token = this.generateToken(user.userId);
        user.lastLogin = new Date();
        this.logAuditEvent({
            action: 'authentication_success',
            resource: 'user',
            resourceId: user.userId,
        }, user.userId, new Date());
        return { token, userId: user.userId };
    }
    async authorizeAccess(userId, resource, action) {
        const user = this.users.get(userId);
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        const hasPermission = user.permissions.some((p) => p.resource === resource && p.action === action && p.granted);
        if (!hasPermission) {
            this.logAuditEvent({
                action: 'access_denied',
                resource,
                resourceId: resource,
            }, userId, new Date());
            throw new errors_1.ForbiddenError(`Access denied to ${resource}:${action}`);
        }
        this.logAuditEvent({
            action: 'access_granted',
            resource,
            resourceId: resource,
        }, userId, new Date());
        return true;
    }
    async encryptData(data, encryptionKey) {
        try {
            const jsonString = JSON.stringify(data);
            const iv = crypto.randomBytes(16);
            const key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encrypted = cipher.update(jsonString, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return iv.toString('hex') + ':' + encrypted;
        }
        catch (error) {
            throw new errors_1.EncryptionError(`Encryption failed: ${error.message}`);
        }
    }
    async logAuditEvent(event, user, timestamp) {
        const auditLog = {
            logId: (0, uuid_1.v4)(),
            userId: user,
            action: event.action,
            resource: event.resource,
            resourceId: event.resourceId,
            timestamp,
            changes: event.changes,
        };
        this.auditLogs.push(auditLog);
        this.logger.info(`Audit event logged`, { logId: auditLog.logId, action: auditLog.action });
    }
    async maskSensitiveData(data, userRole) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const obj = data;
        const masked = { ...obj };
        // Define sensitive fields
        const sensitiveFields = ['ssn', 'dateOfBirth', 'medicalRecordNumber', 'email', 'phone'];
        for (const field of sensitiveFields) {
            if (field in masked) {
                if (userRole === 'admin' || userRole === 'ctt') {
                    // Admins and CTT can see full data
                    continue;
                }
                else if (userRole === 'cra') {
                    // CRAs see partial data
                    masked[field] = this.partialMask(String(masked[field]));
                }
                else {
                    // Others see masked data
                    masked[field] = '***MASKED***';
                }
            }
        }
        return masked;
    }
    registerUser(user) {
        this.users.set(user.userId, user);
        this.logger.info(`User registered`, { userId: user.userId, role: user.role });
    }
    getAuditLogs() {
        return [...this.auditLogs];
    }
    generateToken(userId) {
        const payload = {
            userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
    partialMask(value) {
        if (value.length <= 4) {
            return '*'.repeat(value.length);
        }
        return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
    initializeRolePermissions() {
        this.rolePermissions.set('admin', new Set(['read', 'write', 'delete', 'manage_users']));
        this.rolePermissions.set('ctt', new Set(['read', 'write', 'generate_reports']));
        this.rolePermissions.set('cra', new Set(['read', 'write']));
        this.rolePermissions.set('site_coordinator', new Set(['read', 'write']));
        this.rolePermissions.set('viewer', new Set(['read']));
    }
}
exports.SecurityComponent = SecurityComponent;
//# sourceMappingURL=SecurityComponent.js.map