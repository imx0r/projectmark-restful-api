import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';

const router = Router();
const resourceController = new ResourceController();

// Resource CRUD

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *               - url
 *               - description
 *               - type
 *             properties:
 *               topicId:
 *                 type: string
 *                 example: "topic_123"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
 *               description:
 *                 type: string
 *                 example: "MDN JavaScript Documentation"
 *               type:
 *                 type: string
 *                 enum: [video, article, pdf, website, book]
 *                 example: "article"
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', resourceController.createResource.bind(resourceController));

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
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
 *         description: Number of resources per page
 *     responses:
 *       200:
 *         description: List of resources retrieved successfully
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
 *                         $ref: '#/components/schemas/Resource'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', resourceController.getAllResources.bind(resourceController));

/**
 * @swagger
 * /api/resources/statistics:
 *   get:
 *     summary: Get resource statistics
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Resource statistics retrieved successfully
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
 *                         totalResources:
 *                           type: number
 *                         byType:
 *                           type: object
 *                           additionalProperties:
 *                             type: number
 *                         averageResourcesPerTopic:
 *                           type: number
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', resourceController.getResourceStatistics.bind(resourceController));

/**
 * @swagger
 * /api/resources/grouped:
 *   get:
 *     summary: Get resources grouped by type
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Resources grouped by type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Resource'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/grouped', resourceController.getResourcesByTypeGrouped.bind(resourceController));

/**
 * @swagger
 * /api/resources/validate:
 *   get:
 *     summary: Validate all resources (check URL accessibility)
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Resource validation completed
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
 *                         validResources:
 *                           type: number
 *                         invalidResources:
 *                           type: number
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               resourceId:
 *                                 type: string
 *                               url:
 *                                 type: string
 *                               error:
 *                                 type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/validate', resourceController.validateAllResources.bind(resourceController));

/**
 * @swagger
 * /api/resources/search:
 *   get:
 *     summary: Search resources by URL pattern
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: URL pattern to search for
 *         example: "github.com"
 *     responses:
 *       200:
 *         description: Resources matching pattern retrieved successfully
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
 *                         $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/search', resourceController.searchByUrlPattern.bind(resourceController));

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *         example: "resource_123"
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Resource'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', resourceController.getResourceById.bind(resourceController));

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *         example: "resource_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topicId:
 *                 type: string
 *                 example: "topic_456"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://updated-url.com"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               type:
 *                 type: string
 *                 enum: [video, article, pdf, website, book]
 *                 example: "video"
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', resourceController.updateResource.bind(resourceController));

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *         example: "resource_123"
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', resourceController.deleteResource.bind(resourceController));

// Resource operations by topic

/**
 * @swagger
 * /api/resources/topic/{topicId}:
 *   get:
 *     summary: Get all resources for a specific topic
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "topic_123"
 *     responses:
 *       200:
 *         description: Resources for topic retrieved successfully
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
 *                         $ref: '#/components/schemas/Resource'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/topic/:topicId', resourceController.getResourcesByTopic.bind(resourceController));

// Resource operations by type

/**
 * @swagger
 * /api/resources/type/{type}:
 *   get:
 *     summary: Get all resources of a specific type
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [video, article, pdf, website, book]
 *         description: Resource type
 *         example: "article"
 *     responses:
 *       200:
 *         description: Resources of specified type retrieved successfully
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
 *                         $ref: '#/components/schemas/Resource'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/type/:type', resourceController.getResourcesByType.bind(resourceController));

// Resource validation

/**
 * @swagger
 * /api/resources/validate-url:
 *   post:
 *     summary: Validate a URL for accessibility
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: URL validation completed
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
 *                         statusCode:
 *                           type: number
 *                         responseTime:
 *                           type: number
 *                         error:
 *                           type: string
 *                           nullable: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/validate-url', resourceController.validateUrl.bind(resourceController));

/**
 * @swagger
 * /api/resources/{id}/accessibility:
 *   get:
 *     summary: Check accessibility of a resource URL
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *         example: "resource_123"
 *     responses:
 *       200:
 *         description: Accessibility check completed
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
 *                         isAccessible:
 *                           type: boolean
 *                         statusCode:
 *                           type: number
 *                         responseTime:
 *                           type: number
 *                         lastChecked:
 *                           type: string
 *                           format: date-time
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/accessibility', resourceController.checkAccessibility.bind(resourceController));

// Bulk operations

/**
 * @swagger
 * /api/resources/bulk:
 *   post:
 *     summary: Create multiple resources in bulk
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resources
 *             properties:
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - topicId
 *                     - url
 *                     - description
 *                     - type
 *                   properties:
 *                     topicId:
 *                       type: string
 *                     url:
 *                       type: string
 *                       format: uri
 *                     description:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [video, article, pdf, website, book]
 *     responses:
 *       201:
 *         description: Resources created successfully
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
 *                         created:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Resource'
 *                         failed:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               index:
 *                                 type: number
 *                               error:
 *                                 type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/bulk', resourceController.bulkCreateResources.bind(resourceController));

/**
 * @swagger
 * /api/resources/export:
 *   get:
 *     summary: Export all resources
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Resources exported successfully
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
 *                         format:
 *                           type: string
 *                         exportedAt:
 *                           type: string
 *                           format: date-time
 *                         resources:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Resource'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/export', resourceController.exportResources.bind(resourceController));

/**
 * @swagger
 * /api/resources/import:
 *   post:
 *     summary: Import resources from file or data
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resources
 *             properties:
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - topicId
 *                     - url
 *                     - description
 *                     - type
 *                   properties:
 *                     topicId:
 *                       type: string
 *                     url:
 *                       type: string
 *                       format: uri
 *                     description:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [video, article, pdf, website, book]
 *               overwrite:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to overwrite existing resources
 *     responses:
 *       201:
 *         description: Resources imported successfully
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
 *                         imported:
 *                           type: number
 *                         skipped:
 *                           type: number
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               index:
 *                                 type: number
 *                               error:
 *                                 type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/import', resourceController.importResources.bind(resourceController));

export default router;