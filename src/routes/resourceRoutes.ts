import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';

const router = Router();
const resourceController = new ResourceController();

// Resource CRUD operations
router.post('/', resourceController.createResource.bind(resourceController));
router.get('/', resourceController.getAllResources.bind(resourceController));
router.get('/statistics', resourceController.getResourceStatistics.bind(resourceController));
router.get('/grouped', resourceController.getResourcesByTypeGrouped.bind(resourceController));
router.get('/validate', resourceController.validateAllResources.bind(resourceController));
router.get('/search', resourceController.searchByUrlPattern.bind(resourceController));
router.get('/:id', resourceController.getResourceById.bind(resourceController));
router.put('/:id', resourceController.updateResource.bind(resourceController));
router.delete('/:id', resourceController.deleteResource.bind(resourceController));

// Resource operations by topic
router.get('/topic/:topicId', resourceController.getResourcesByTopic.bind(resourceController));

// Resource operations by type
router.get('/type/:type', resourceController.getResourcesByType.bind(resourceController));

// Resource validation
router.post('/validate-url', resourceController.validateUrl.bind(resourceController));
router.get('/:id/accessibility', resourceController.checkAccessibility.bind(resourceController));

// Bulk operations
router.post('/bulk', resourceController.bulkCreateResources.bind(resourceController));
router.get('/export', resourceController.exportResources.bind(resourceController));
router.post('/import', resourceController.importResources.bind(resourceController));

export default router;