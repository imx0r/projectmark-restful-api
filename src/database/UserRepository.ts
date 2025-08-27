import { IUserRepository } from '../interfaces/IUser';
import { User } from '../models/User';
import { InMemoryDatabase } from './InMemoryDatabase';

/**
 * Repository implementation for User entity
 */
export class UserRepository implements IUserRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  /**
   * Saves a user to the database
   */
  async save(user: User): Promise<User> {
    // Validate user before saving
    const isValid = await user.validate();
    if (!isValid) {
      const errors = user.getValidationErrors();
      throw new Error(`User validation failed: ${errors.join(', ')}`);
    }

    // Check for email uniqueness (excluding the current user if updating)
    const existingUser = await this.findByEmail(user.email);
    if (existingUser && existingUser.id !== user.id) {
      throw new Error(`User with email ${user.email} already exists`);
    }

    return this.database.saveUser(user);
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.database.findUserById(id);
  }

  /**
   * Finds a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.database.findUserByEmail(email);
  }

  /**
   * Finds all users
   */
  async findAll(): Promise<User[]> {
    return this.database.findAllUsers();
  }

  /**
   * Deletes a user
   */
  async delete(id: string): Promise<boolean> {
    return this.database.deleteUser(id);
  }

  /**
   * Checks if a user exists
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  /**
   * Checks if an email is already taken
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }
    return excludeUserId ? user.id !== excludeUserId : true;
  }

  /**
   * Finds users by role
   */
  async findByRole(role: string): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter(user => user.role === role);
  }

  /**
   * Finds users by name (case-insensitive search)
   */
  async findByName(name: string): Promise<User[]> {
    const allUsers = await this.findAll();
    const searchName = name.toLowerCase();
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(searchName)
    );
  }

  /**
   * Gets statistics about users
   */
  async getStatistics(): Promise<Record<string, number>> {
    const allUsers = await this.findAll();
    const roleCount: Record<string, number> = {};

    for (const user of allUsers) {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    }

    return {
      totalUsers: allUsers.length,
      ...roleCount
    };
  }

  /**
   * Gets all admin users
   */
  async findAdmins(): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter(user => user.isAdmin());
  }

  /**
   * Gets all users who can edit (admins and editors)
   */
  async findEditorsAndAdmins(): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter(user => user.canEdit());
  }

  /**
   * Validates all users and returns invalid ones
   */
  async findInvalidUsers(): Promise<{ user: User; errors: string[] }[]> {
    const allUsers = await this.findAll();
    const invalidUsers: { user: User; errors: string[] }[] = [];

    for (const user of allUsers) {
      const isValid = await user.validate();
      if (!isValid) {
        const errors = user.getValidationErrors();
        invalidUsers.push({ user, errors });
      }
    }

    return invalidUsers;
  }

  /**
   * Updates user role
   */
  async updateRole(id: string, newRole: string): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    user.update({ role: newRole as any });
    return await this.save(user);
  }

  /**
   * Gets users created within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    const allUsers = await this.findAll();
    return allUsers.filter(user => 
      user.createdAt >= startDate && user.createdAt <= endDate
    );
  }

  /**
   * Gets recently created users
   */
  async findRecentUsers(days: number = 7): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.findByDateRange(cutoffDate, new Date());
  }

  /**
   * Counts users by role
   */
  async countByRole(): Promise<Record<string, number>> {
    const stats = await this.getStatistics();
    const { totalUsers: _, ...roleCounts } = stats;
    return roleCounts;
  }
}