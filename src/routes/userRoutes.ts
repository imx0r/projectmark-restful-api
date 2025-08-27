import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// User CRUD operations
router.post('/', userController.createUser.bind(userController));
router.get('/', userController.getAllUsers.bind(userController));
router.get('/statistics', userController.getUserStatistics.bind(userController));
// Recent users functionality not implemented yet
router.get('/:id', userController.getUserById.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

// User authentication
router.post('/authenticate', userController.authenticateUser.bind(userController));

// User role operations
router.get('/role/:role', userController.getUsersByRole.bind(userController));
router.post('/:id/role', userController.changeUserRole.bind(userController));

// User search and lookup
router.get('/email/:email', userController.getUserByEmail.bind(userController));
// Search by name functionality not implemented yet
router.get('/check-email/:email', userController.checkEmailAvailability.bind(userController));

// User permissions
router.get('/:id/permissions', userController.checkUserPermissions.bind(userController));
router.get('/:id/profile', userController.getUserProfile.bind(userController));
// User activity functionality not implemented yet

// User management operations
router.post('/:id/deactivate', userController.deactivateUser.bind(userController));

// Bulk operations
router.post('/bulk', userController.bulkCreateUsers.bind(userController));
router.get('/export', userController.exportUsers.bind(userController));
router.post('/import', userController.importUsers.bind(userController));

export default router;