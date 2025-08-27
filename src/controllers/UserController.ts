import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { User } from '../models/User';
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError } from '../types/errors';
import { UserRole } from '../interfaces/IUser';

/**
 * Controller for User CRUD operations and authentication
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Creates a new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Name, email, and role are required'
        });
        return;
      }

      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role as UserRole
      };

      const user = await this.userService.create(userData);
      
      res.status(201).json({
        success: true,
        data: user.toJSON(),
        message: 'User created successfully'
      });
    } catch (_error) {
      if (_error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: _error.message
        });
      } else if (_error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: 'Conflict Error',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create user'
        });
      }
    }
  }

  /**
   * Gets a user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user'
      });
    }
  }

  /**
   * Gets a user by email
   */
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const user = await this.userService.findByEmail(email);

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user'
      });
    }
  }

  /**
   * Gets all users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, search, recent } = req.query;
      let users: User[];

      if (role) {
        users = await this.userService.findByRole(role as UserRole);
      } else if (search) {
        users = await this.userService.searchByName(search as string);
      } else if (recent === 'true') {
        const limit = parseInt(req.query.limit as string) || 10;
        users = await this.userService.getRecentUsers(limit);
      } else {
        users = await this.userService.findAll();
      }

      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        count: users.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve users'
      });
    }
  }

  /**
   * Updates a user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const updateData: Partial<User> = {};
      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.trim().toLowerCase();

      const updatedUser = await this.userService.update(id, updateData);
      
      res.json({
        success: true,
        data: updatedUser.toJSON(),
        message: 'User updated successfully'
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: _error.message
        });
      } else if (_error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation Error',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to update user'
        });
      }
    }
  }

  /**
   * Deletes a user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userService.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete user'
      });
    }
  }

  /**
   * Changes user role
   */
  async changeUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role, requesterId } = req.body;

      if (!role || !requesterId) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Role and requesterId are required'
        });
        return;
      }

      const updatedUser = await this.userService.changeRole(id, role as UserRole, requesterId);
      
      res.json({
        success: true,
        data: updatedUser.toJSON(),
        message: 'User role updated successfully'
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: error.message
        });
      } else if (error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to change user role'
        });
      }
    }
  }

  /**
   * Authenticates a user
   */
  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Email and password are required'
        });
        return;
      }

      const user = await this.userService.authenticate(email);
      
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }
      
      res.json({
        success: true,
        data: user.toJSON(),
        message: 'Authentication successful'
      });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          error: 'Authentication Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authentication failed'
        });
      }
    }
  }

  /**
   * Checks email availability
   */
  async checkEmailAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const isAvailable = await this.userService.isEmailAvailable(email);
      
      res.json({
        success: true,
        data: {
          email,
          isAvailable
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check email availability'
      });
    }
  }

  /**
   * Gets users by role
   */
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const users = await this.userService.findByRole(role as UserRole);
      
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        count: users.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve users by role'
      });
    }
  }

  /**
   * Gets admin users
   */
  async getAdminUsers(_req: Request, res: Response): Promise<void> {
    try {
      const admins = await this.userService.getAdmins();
      
      res.json({
        success: true,
        data: admins.map(admin => admin.toJSON()),
        count: admins.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve admin users'
      });
    }
  }

  /**
   * Gets editor users
   */
  async getEditorUsers(_req: Request, res: Response): Promise<void> {
    try {
      const editors = await this.userService.getEditorsAndAdmins();
      
      res.json({
        success: true,
        data: editors.map(editor => editor.toJSON()),
        count: editors.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve editor users'
      });
    }
  }

  /**
   * Gets user statistics
   */
  async getUserStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.userService.getStatistics();
      const roleStats = await this.userService.countUsersByRole();
      
      res.json({
        success: true,
        data: {
          ...stats,
          roleDistribution: roleStats
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user statistics'
      });
    }
  }

  /**
   * Gets user profile
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await this.userService.getUserProfile(id);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve user profile'
        });
      }
    }
  }

  /**
   * Checks user permissions
   */
  async checkUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, resourceId } = req.query;

      if (!action) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Action parameter is required'
        });
        return;
      }

      let hasPermission = false;
      const actionStr = action as string;
      const resourceIdStr = resourceId as string;

      switch (actionStr) {
        case 'read':
        case 'create':
        case 'update':
        case 'delete':
        case 'manage_users':
          hasPermission = await this.userService.checkPermission(id, actionStr, resourceIdStr);
          break;
        default:
          res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid action. Supported actions: read, create, update, delete, manage_users'
          });
          return;
      }
      
      res.json({
        success: true,
        data: {
          userId: id,
          action: actionStr,
          resourceId: resourceIdStr,
          hasPermission
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check user permissions'
      });
    }
  }

  /**
   * Bulk creates users
   */
  async bulkCreateUsers(req: Request, res: Response): Promise<void> {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Users array is required and must not be empty'
        });
        return;
      }

      const createdUsers = await this.userService.bulkCreate(users);
      
      res.status(201).json({
        success: true,
        data: createdUsers.map(user => user.toJSON()),
        count: createdUsers.length,
        message: `${createdUsers.length} users created successfully`
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to bulk create users'
      });
    }
  }

  /**
   * Exports users
   */
  async exportUsers(_req: Request, res: Response): Promise<void> {
    try {
      const exportData = await this.userService.exportUsers();
      
      res.json({
        success: true,
        data: exportData,
        count: exportData.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to export users'
      });
    }
  }

  /**
   * Imports users
   */
  async importUsers(req: Request, res: Response): Promise<void> {
    try {
      const { users } = req.body;

      if (!Array.isArray(users)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Users array is required'
        });
        return;
      }

      const importedUsers = await this.userService.importUsers(users);
      
      res.status(201).json({
        success: true,
        data: importedUsers.map(user => user.toJSON()),
        count: importedUsers.length,
        message: `${importedUsers.length} users imported successfully`
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to import users'
      });
    }
  }

  /**
   * Deactivates a user (soft delete)
   */
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { requesterId } = req.body;

      if (!requesterId) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'RequesterId is required'
        });
        return;
      }

      const success = await this.userService.deactivateUser(id, requesterId);
      
      res.json({
        success: true,
        message: success ? 'User deactivated successfully' : 'Failed to deactivate user'
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: _error.message
        });
      } else if (_error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation Error',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to deactivate user'
        });
      }
    }
  }

  /**
   * Gets user activity summary
   */
  async getUserActivitySummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const activitySummary = await this.userService.getUserActivitySummary(id);
      
      res.json({
        success: true,
        data: activitySummary
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not Found',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve user activity summary'
        });
      }
    }
  }

  /**
   * Validates all users
   */
  async validateAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const invalidUsers = await this.userService.validateAllUsers();
      
      res.json({
        success: true,
        data: {
          invalidUsers: invalidUsers.map(item => ({
            user: item.user.toJSON(),
            errors: item.errors
          })),
          count: invalidUsers.length,
          isValid: invalidUsers.length === 0
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate users'
      });
    }
  }
}