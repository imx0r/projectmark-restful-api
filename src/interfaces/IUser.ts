import { IEntity, IValidatable } from './IEntity';

/**
 * Enum for user roles
 */
export enum UserRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer'
}

/**
 * Interface for User entity
 */
export interface IUser extends IEntity, IValidatable {
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Interface for User operations
 */
export interface IUserService {
  create(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: string, updateData: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<boolean>;
}

/**
 * Interface for User repository
 */
export interface IUserRepository {
  save(user: IUser): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  delete(id: string): Promise<boolean>;
}

/**
 * Interface for permission checking
 */
export interface IPermissionService {
  canRead(user: IUser, resourceType: string): boolean;
  canWrite(user: IUser, resourceType: string): boolean;
  canDelete(user: IUser, resourceType: string): boolean;
  canManageUsers(user: IUser): boolean;
}