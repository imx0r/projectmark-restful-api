import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();
const topicController = new TopicController();

// Topic CRUD

/**
 * @swagger
 * /api/topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *                 example: "JavaScript Fundamentals"
 *               content:
 *                 type: string
 *                 example: "Introduction to JavaScript programming language"
 *               parentTopicId:
 *                 type: string
 *                 nullable: true
 *                 example: "topic_123"
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Topic'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', topicController.createTopic.bind(topicController));

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of topics per page
 *     responses:
 *       200:
 *         description: List of topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Topic'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', topicController.getAllTopics.bind(topicController));

/**
 * @swagger
 * /api/topics/root:
 *   get:
 *     summary: Get all root topics (topics without parent)
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: Root topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Topic'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/root', topicController.getRootTopics.bind(topicController));

/**
 * @swagger
 * /api/topics/statistics:
 *   get:
 *     summary: Get topic statistics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: Topic statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalTopics:
 *                           type: number
 *                         rootTopics:
 *                           type: number
 *                         maxDepth:
 *                           type: number
 *                         averageChildrenPerTopic:
 *                           type: number
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', topicController.getTopicStatistics.bind(topicController));

/**
 * @swagger
 * /api/topics/validate:
 *   get:
 *     summary: Validate topic hierarchy integrity
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: Hierarchy validation completed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         isValid:
 *                           type: boolean
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/validate', topicController.validateHierarchy.bind(topicController));

// Topic algorithms

/**
 * @swagger
 * /api/topics/path:
 *   get:
 *     summary: Find shortest path between two topics
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Source topic ID
 *         example: "topic_123"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Target topic ID
 *         example: "topic_456"
 *     responses:
 *       200:
 *         description: Shortest path found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ShortestPath'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/path', topicController.findShortestPath.bind(topicController));

// Topic versioning

/**
 * @swagger
 * /api/topics/{id}/versions:
 *   get:
 *     summary: Get all versions of a topic
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     responses:
 *       200:
 *         description: Topic versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Topic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/versions', topicController.getTopicVersions.bind(topicController));

/**
 * @swagger
 * /api/topics/{id}/versions/{version}:
 *   get:
 *     summary: Get a specific version of a topic
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Version number
 *         example: 2
 *     responses:
 *       200:
 *         description: Topic version retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Topic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/versions/:version', topicController.getTopicVersion.bind(topicController));

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: Get a topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     responses:
 *       200:
 *         description: Topic retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Topic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', topicController.getTopicById.bind(topicController));

/**
 * @swagger
 * /api/topics/{id}:
 *   put:
 *     summary: Update a topic (creates new version)
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Advanced JavaScript"
 *               content:
 *                 type: string
 *                 example: "Advanced concepts in JavaScript programming"
 *               parentTopicId:
 *                 type: string
 *                 nullable: true
 *                 example: "topic_456"
 *     responses:
 *       200:
 *         description: Topic updated successfully (new version created)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Topic'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', topicController.updateTopic.bind(topicController));

/**
 * @swagger
 * /api/topics/{id}:
 *   delete:
 *     summary: Delete a topic and all its versions
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', topicController.deleteTopic.bind(topicController));

// Topic hierarchy and relationships

/**
 * @swagger
 * /api/topics/{id}/tree:
 *   get:
 *     summary: Get topic tree (topic with all its subtopics recursively)
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     responses:
 *       200:
 *         description: Topic tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TopicHierarchy'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/tree', topicController.getTopicTree.bind(topicController));

/**
 * @swagger
 * /api/topics/{id}/move:
 *   post:
 *     summary: Move a topic to a different parent
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID to move
 *         example: "topic_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newParentId:
 *                 type: string
 *                 nullable: true
 *                 description: New parent topic ID (null for root level)
 *                 example: "topic_456"
 *     responses:
 *       200:
 *         description: Topic moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Topic'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/move', topicController.moveTopic.bind(topicController));

export default router;