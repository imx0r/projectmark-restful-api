import { IUser, UserRole } from '../interfaces/IUser';
import { IPermissionService } from '../interfaces/IUser';

/**
 * Abstract strategy for permission checking
 */
export abstract class PermissionStrategy {
  abstract canRead(user: IUser, resourceType: string): boolean;
  abstract canWrite(user: IUser, resourceType: string): boolean;
  abstract canDelete(user: IUser, resourceType: string): boolean;
  abstract canManageUsers(user: IUser): boolean;
}

/**
 * Admin permission strategy - can do everything
 */
export class AdminPermissionStrategy extends PermissionStrategy {
  canRead(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canWrite(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canDelete(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canManageUsers(_user: IUser): boolean {
    return true;
  }
}

/**
 * Editor permission strategy - can read and write, but not delete or manage users
 */
export class EditorPermissionStrategy extends PermissionStrategy {
  canRead(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canWrite(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canDelete(_user: IUser, resourceType: string): boolean {
    // Editors can only delete resources they created (would need additional logic)
    return resourceType === 'resource';
  }

  canManageUsers(_user: IUser): boolean {
    return false;
  }
}

/**
 * Viewer permission strategy - can only read
 */
export class ViewerPermissionStrategy extends PermissionStrategy {
  canRead(_user: IUser, _resourceType: string): boolean {
    return true;
  }

  canWrite(_user: IUser, _resourceType: string): boolean {
    return false;
  }

  canDelete(_user: IUser, _resourceType: string): boolean {
    return false;
  }

  canManageUsers(_user: IUser): boolean {
    return false;
  }
}

/**
 * Permission service that uses strategy pattern
 */
export class PermissionService implements IPermissionService {
  private strategies: Map<UserRole, PermissionStrategy>;

  constructor() {
    this.strategies = new Map([
      [UserRole.ADMIN, new AdminPermissionStrategy()],
      [UserRole.EDITOR, new EditorPermissionStrategy()],
      [UserRole.VIEWER, new ViewerPermissionStrategy()]
    ]);
  }

  /**
   * Gets the appropriate strategy for a user's role
   */
  private getStrategy(user: IUser): PermissionStrategy {
    const strategy = this.strategies.get(user.role);
    if (!strategy) {
      throw new Error(`No permission strategy found for role: ${user.role}`);
    }
    return strategy;
  }

  /**
   * Checks if user can read a resource type
   */
  canRead(user: IUser, resourceType: string): boolean {
    return this.getStrategy(user).canRead(user, resourceType);
  }

  /**
   * Checks if user can write to a resource type
   */
  canWrite(user: IUser, resourceType: string): boolean {
    return this.getStrategy(user).canWrite(user, resourceType);
  }

  /**
   * Checks if user can delete a resource type
   */
  canDelete(user: IUser, resourceType: string): boolean {
    return this.getStrategy(user).canDelete(user, resourceType);
  }

  /**
   * Checks if user can manage other users
   */
  canManageUsers(user: IUser): boolean {
    return this.getStrategy(user).canManageUsers(user);
  }

  /**
   * Registers a new permission strategy for a role
   */
  registerStrategy(role: UserRole, strategy: PermissionStrategy): void {
    this.strategies.set(role, strategy);
  }

  /**
   * Gets all permissions for a user
   */
  getUserPermissions(user: IUser): Record<string, boolean> {
    return {
      canReadTopics: this.canRead(user, 'topic'),
      canWriteTopics: this.canWrite(user, 'topic'),
      canDeleteTopics: this.canDelete(user, 'topic'),
      canReadResources: this.canRead(user, 'resource'),
      canWriteResources: this.canWrite(user, 'resource'),
      canDeleteResources: this.canDelete(user, 'resource'),
      canReadUsers: this.canRead(user, 'user'),
      canWriteUsers: this.canWrite(user, 'user'),
      canDeleteUsers: this.canDelete(user, 'user'),
      canManageUsers: this.canManageUsers(user)
    };
  }
}