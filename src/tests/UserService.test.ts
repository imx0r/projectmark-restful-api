import { UserService } from '../services/UserService';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { UserRole } from '../interfaces/IUser';

describe('UserService', () => {
  let userService: UserService;
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = InMemoryDatabase.getInstance();
    database.clear();
    userService = new UserService();
  });

  afterEach(() => {
    database.clear();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      };

      const user = await userService.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.role).toBe(UserRole.VIEWER);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for invalid email', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        role: UserRole.VIEWER
      };

      await expect(userService.create(invalidData))
        .rejects.toThrow('User validation failed: Email must be a valid email format');
    });

    it('should throw ValidationError for empty name', async () => {
      const invalidData = {
        name: '',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      };

      await expect(userService.create(invalidData))
        .rejects.toThrow('User name and email are required');
    });

    it('should throw ValidationError for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      };

      await userService.create(userData);

      const duplicateData = {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        role: UserRole.EDITOR
      };

      await expect(userService.create(duplicateData))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const user = await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      const originalUpdatedAt = user.updatedAt.getTime();
      
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedUser = await userService.update(user.id, {
        role: UserRole.EDITOR
      });

      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.name).toBe('John Doe');
      expect(updatedUser.role).toBe(UserRole.EDITOR);
      expect(updatedUser.email).toBe('john.doe@example.com'); // Should remain unchanged
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.update('non-existent-id', { name: 'New Name' }))
        .rejects.toThrow('User with id non-existent-id not found');
    });

    it('should validate email when updating', async () => {
      const user = await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      await expect(userService.update(user.id, { email: 'invalid-email' }))
        .rejects.toThrow('User validation failed');
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const user = await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      const foundUser = await userService.findById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.name).toBe('John Doe');
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await userService.findById('non-existent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      const foundUser = await userService.findByEmail('john.doe@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe('john.doe@example.com');
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await userService.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      await userService.create({
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      await userService.create({
        name: 'Editor User',
        email: 'editor@example.com',
        role: UserRole.EDITOR
      });

      await userService.create({
        name: 'Viewer User',
        email: 'viewer@example.com',
        role: UserRole.VIEWER
      });

      const adminUsers = await userService.findByRole(UserRole.ADMIN);
      const editorUsers = await userService.findByRole(UserRole.EDITOR);
      const viewerUsers = await userService.findByRole(UserRole.VIEWER);

      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0].role).toBe(UserRole.ADMIN);
      expect(editorUsers).toHaveLength(1);
      expect(editorUsers[0].role).toBe(UserRole.EDITOR);
      expect(viewerUsers).toHaveLength(1);
      expect(viewerUsers[0].role).toBe(UserRole.VIEWER);
    });

    it('should return empty array for role with no users', async () => {
      const adminUsers = await userService.findByRole(UserRole.ADMIN);
      expect(adminUsers).toHaveLength(0);
    });
  });

  describe('searchByName', () => {
    it('should find users by name query', async () => {
      await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      await userService.create({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: UserRole.EDITOR
      });

      await userService.create({
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: UserRole.ADMIN
      });

      const johnUsers = await userService.searchByName('John');
      const smithUsers = await userService.searchByName('Smith');

      expect(johnUsers).toHaveLength(2);
      expect(johnUsers.every(u => u.name.includes('John'))).toBe(true);
      expect(smithUsers).toHaveLength(2);
      expect(smithUsers.every(u => u.name.includes('Smith'))).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const users = await userService.searchByName('NonExistent');
      expect(users).toHaveLength(0);
    });
  });

  describe('changeRole', () => {
    it('should change user role successfully', async () => {
      const adminUser = await userService.create({
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      const user = await userService.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.VIEWER
      });

      const updatedUser = await userService.changeRole(user.id, UserRole.EDITOR, adminUser.id);

      expect(updatedUser.role).toBe(UserRole.EDITOR);
      expect(updatedUser.name).toBe('John Doe'); // Other fields unchanged
      expect(updatedUser.email).toBe('john.doe@example.com');
    });

    it('should throw error for non-existent user', async () => {
      const adminUser = await userService.create({
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      await expect(userService.changeRole('non-existent-id', UserRole.ADMIN, adminUser.id))
        .rejects.toThrow('User with id non-existent-id not found');
    });
  });

  describe('getStatistics', () => {
    it('should return user statistics', async () => {
      await userService.create({
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      });

      await userService.create({
        name: 'Editor User 1',
        email: 'editor1@example.com',
        role: UserRole.EDITOR
      });

      await userService.create({
        name: 'Editor User 2',
        email: 'editor2@example.com',
        role: UserRole.EDITOR
      });

      await userService.create({
        name: 'Viewer User',
        email: 'viewer@example.com',
        role: UserRole.VIEWER
      });

      const stats = await userService.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
      expect(stats.totalUsers).toBe(4);
      expect(stats[UserRole.ADMIN]).toBe(1);
      expect(stats[UserRole.EDITOR]).toBe(2);
      expect(stats[UserRole.VIEWER]).toBe(1);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple users', async () => {
      const usersData = [
        {
          name: 'User 1',
          email: 'user1@example.com',
          role: UserRole.VIEWER
        },
        {
          name: 'User 2',
          email: 'user2@example.com',
          role: UserRole.EDITOR
        }
      ];

      const createdUsers = await userService.bulkCreate(usersData);

      expect(createdUsers).toHaveLength(2);
      expect(createdUsers[0].name).toBe('User 1');
      expect(createdUsers[1].name).toBe('User 2');
    });

    it('should handle partial failures in bulk creation', async () => {
      const usersData = [
        {
          name: 'Valid User',
          email: 'valid@example.com',
          role: UserRole.VIEWER
        },
        {
          name: 'Invalid User',
          email: 'invalid-email',
          role: UserRole.EDITOR
        }
      ];

      const createdUsers = await userService.bulkCreate(usersData);

      // Should create only the valid user
      expect(createdUsers).toHaveLength(1);
      expect(createdUsers[0].name).toBe('Valid User');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const user = await userService.create({
        name: 'User to Delete',
        email: 'delete@example.com',
        role: UserRole.VIEWER
      });

      const deleted = await userService.delete(user.id);
      expect(deleted).toBe(true);

      const foundUser = await userService.findById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const deleted = await userService.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('should authenticate user by email', async () => {
      const user = await userService.create({
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.VIEWER
      });

      const authenticatedUser = await userService.authenticate('test@example.com');
      
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser?.id).toBe(user.id);
      expect(authenticatedUser?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const authenticatedUser = await userService.authenticate('nonexistent@example.com');
      expect(authenticatedUser).toBeNull();
    });
  });
});