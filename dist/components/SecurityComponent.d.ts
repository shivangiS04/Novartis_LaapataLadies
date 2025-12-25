/**
 * Security and Access Control Component
 */
import { ISecurityComponent } from '../interfaces/components';
import { User, AuditLog } from '../types/index';
export declare class SecurityComponent implements ISecurityComponent {
    private logger;
    private users;
    private auditLogs;
    private rolePermissions;
    constructor(encryptionKey: string);
    authenticateUser(credentials: {
        username: string;
        password: string;
    }): Promise<{
        token: string;
        userId: string;
    }>;
    authorizeAccess(userId: string, resource: string, action: string): Promise<boolean>;
    encryptData(data: unknown, encryptionKey: string): Promise<string>;
    logAuditEvent(event: Record<string, unknown>, user: string, timestamp: Date): Promise<void>;
    maskSensitiveData(data: unknown, userRole: string): Promise<unknown>;
    registerUser(user: User): void;
    getAuditLogs(): AuditLog[];
    private generateToken;
    private partialMask;
    private initializeRolePermissions;
}
//# sourceMappingURL=SecurityComponent.d.ts.map