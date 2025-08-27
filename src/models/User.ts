import { BaseEntity } from './BaseEntity';
import { IUser, UserRole } from '../interfaces/IUser';

/**
 * User entity with role-based permissions
 */
export class User extends BaseEntity implements IUser {
  public name: string;
  public email: string;
  public role: UserRole;

  constructor(
    name: string,
    email: string,
    role: UserRole = UserRole.VIEWER,
    id?: string
  ) {
    super(id);
    this.name = name;
    this.email = email;
    this.role = role;
  }

  /**
   * Validates the user
   */
  async validate(): Promise<boolean> {
    const errors = this.getValidationErrors();
    return errors.length === 0;
  }

  /**
   * Gets validation errors
   */
  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Email must be a valid email format');
    }

    if (!Object.values(UserRole).includes(this.role)) {
      errors.push('Invalid user role');
    }

    return errors;
  }

  /**
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Updates user properties
   */
  update(updateData: Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>>): void {
    if (updateData.name !== undefined) this.name = updateData.name;
    if (updateData.email !== undefined) this.email = updateData.email;
    if (updateData.role !== undefined) this.role = updateData.role;
    
    this.touch();
  }

  /**
   * Checks if user is an admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Checks if user is an editor or admin
   */
  canEdit(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.EDITOR;
  }

  /**
   * Checks if user can read (all roles can read)
   */
  canRead(): boolean {
    return true;
  }

  /**
   * Checks if user can delete (only admins)
   */
  canDelete(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Checks if user can manage other users (only admins)
   */
  canManageUsers(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Gets user permissions as an object
   */
  getPermissions(): Record<string, boolean> {
    return {
      canRead: this.canRead(),
      canEdit: this.canEdit(),
      canDelete: this.canDelete(),
      canManageUsers: this.canManageUsers(),
      isAdmin: this.isAdmin()
    };
  }

  /**
   * Converts user to JSON representation (excludes sensitive data)
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      name: this.name,
      email: this.email,
      role: this.role,
      permissions: this.getPermissions()
    };
  }

  /**
   * Converts user to safe JSON (for public APIs)
   */
  toSafeJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}