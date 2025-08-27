import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();
const topicController = new TopicController();

// Topic CRUD
router.post('/', topicController.createTopic.bind(topicController));
router.get('/', topicController.getAllTopics.bind(topicController));

router.get('/root', topicController.getRootTopics.bind(topicController));
router.get('/statistics', topicController.getTopicStatistics.bind(topicController));
router.get('/validate', topicController.validateHierarchy.bind(topicController));

// Topic algorithms
router.get('/path', topicController.findShortestPath.bind(topicController));

// Topic versioning
router.get('/:id/versions', topicController.getTopicVersions.bind(topicController));
router.get('/:id/versions/:version', topicController.getTopicVersion.bind(topicController));

router.get('/:id', topicController.getTopicById.bind(topicController));
router.put('/:id', topicController.updateTopic.bind(topicController));
router.delete('/:id', topicController.deleteTopic.bind(topicController));

// Topic hierarchy and relationships
router.get('/:id/tree', topicController.getTopicTree.bind(topicController));
router.post('/:id/move', topicController.moveTopic.bind(topicController));

export default router;