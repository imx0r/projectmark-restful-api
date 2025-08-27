import { IUserService } from '../interfaces/IUser';
import { User } from '../models/User';
import { UserRepository } from '../database/UserRepository';
import { StandardEntityFactory } from '../utils/EntityFactory';
import { PermissionService } from './PermissionService';
import { ConflictError } from '../types/errors';

/**
 * Service implementation for User business logic
 */
export class UserService implements IUserService {
  private repository: UserRepository;
  private factory: StandardEntityFactory;
  private permissionService: PermissionService;

  constructor() {
    this.repository = new UserRepository();
    this.factory = new StandardEntityFactory();
    this.permissionService = new PermissionService();
  }

  /**
   * Creates a new user
   */
  async create(data: Partial<User>): Promise<User> {
    // Check for duplicate email
    if (data.email) {
      const existingUser = await this.repository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
    }
    
    const user = this.factory.createUser(data);
    return await this.repository.save(user);
  }

  /**
   * Updates an existing user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    // Update properties
    existingUser.update({
      name: data.name,
      email: data.email,
      role: data.role
    });

    return await this.repository.save(existingUser);
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await this.repository.findById(id);
  }

  /**
   * Finds a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email);
  }

  /**
   * Finds all users
   */
  async findAll(): Promise<User[]> {
    return await this.repository.findAll();
  }

  /**
   * Deletes a user
   */
  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Finds users by role
   */
  async findByRole(role: string): Promise<User[]> {
    return await this.repository.findByRole(role);
  }

  /**
   * Searches users by name
   */
  async searchByName(query: string): Promise<User[]> {
    return await this.repository.findByName(query);
  }

  /**
   * Checks if an email is available
   */
  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const isTaken = await this.repository.isEmailTaken(email, excludeUserId);
    return !isTaken;
  }

  /**
   * Authenticates a user (simplified for demo)
   */
  async authenticate(email: string): Promise<User | null> {
    return await this.repository.findByEmail(email);
  }

  /**
   * Changes user role
   */
  async changeRole(userId: string, newRole: string, requestingUserId: string): Promise<User> {
    const requestingUser = await this.repository.findById(requestingUserId);
    if (!requestingUser) {
      throw new Error('Requesting user not found');
    }

    // Check if requesting user has permission to manage users
    if (!this.permissionService.canManageUsers(requestingUser)) {
      throw new Error('Insufficient permissions to change user roles');
    }

    const updatedUser = await this.repository.updateRole(userId, newRole);
    if (!updatedUser) {
      throw new Error(`User with id ${userId} not found`);
    }

    return updatedUser;
  }

  /**
   * Gets user statistics
   */
  async getStatistics(): Promise<Record<string, number>> {
    return await this.repository.getStatistics();
  }

  /**
   * Gets all admin users
   */
  async getAdmins(): Promise<User[]> {
    return await this.repository.findAdmins();
  }

  /**
   * Gets all users who can edit
   */
  async getEditorsAndAdmins(): Promise<User[]> {
    return await this.repository.findEditorsAndAdmins();
  }

  /**
   * Validates all users
   */
  async validateAllUsers(): Promise<{ user: User; errors: string[] }[]> {
    return await this.repository.findInvalidUsers();
  }

  /**
   * Gets recently created users
   */
  async getRecentUsers(days: number = 7): Promise<User[]> {
    return await this.repository.findRecentUsers(days);
  }

  /**
   * Gets users created within date range
   */
  async getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return await this.repository.findByDateRange(startDate, endDate);
  }

  /**
   * Counts users by role
   */
  async countUsersByRole(): Promise<Record<string, number>> {
    return await this.repository.countByRole();
  }

  /**
   * Checks user permissions
   */
  async checkPermission(userId: string, action: string, resourceId?: string): Promise<boolean> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return false;
    }

    switch (action) {
      case 'read':
        return this.permissionService.canRead(user, resourceId || 'topic');
      case 'create':
      case 'update':
        return this.permissionService.canWrite(user, resourceId || 'topic');
      case 'delete':
        return this.permissionService.canDelete(user, resourceId || 'topic');
      case 'manage_users':
        return this.permissionService.canManageUsers(user);
      default:
        return false;
    }
  }

  /**
   * Gets user profile (safe version without sensitive data)
   */
  async getUserProfile(userId: string): Promise<any | null> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return null;
    }

    return user.toSafeJSON();
  }

  /**
   * Bulk creates users
   */
  async bulkCreate(usersData: Partial<User>[]): Promise<User[]> {
    const createdUsers: User[] = [];

    for (const data of usersData) {
      try {
        const user = await this.create(data);
        createdUsers.push(user);
      } catch (error) {
        console.error(`Failed to create user: ${error}`);
      }
    }

    return createdUsers;
  }

  /**
   * Exports users to JSON
   */
  async exportUsers(): Promise<any[]> {
    const allUsers = await this.repository.findAll();
    return allUsers.map(user => user.toSafeJSON());
  }

  /**
   * Imports users from JSON data
   */
  async importUsers(usersData: any[]): Promise<User[]> {
    const importedUsers: User[] = [];

    for (const data of usersData) {
      try {
        const user = await this.create(data);
        importedUsers.push(user);
      } catch (error) {
        console.error(`Failed to import user: ${error}`);
      }
    }

    return importedUsers;
  }

  /**
   * Deactivates a user (soft delete)
   */
  async deactivateUser(userId: string, requestingUserId: string): Promise<boolean> {
    const requestingUser = await this.repository.findById(requestingUserId);
    if (!requestingUser) {
      throw new Error('Requesting user not found');
    }

    if (!this.permissionService.canManageUsers(requestingUser)) {
      throw new Error('Insufficient permissions to deactivate users');
    }

    // In a real implementation, this would set an 'active' flag to false
    // For now, we'll just delete the user
    return await this.repository.delete(userId);
  }

  /**
   * Gets user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<any> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: {
        canRead: user.canRead(),
        canEdit: user.canEdit(),
        canDelete: user.canDelete(),
        canManageUsers: user.canManageUsers(),
        isAdmin: user.isAdmin()
      }
    };
  }
}