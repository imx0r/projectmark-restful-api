import { ResourceService } from '../services/ResourceService';
import { TopicService } from '../services/TopicService';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { ResourceType } from '../interfaces/IResource';

describe('ResourceService', () => {
  let resourceService: ResourceService;
  let topicService: TopicService;
  let database: InMemoryDatabase;
  let testTopicId: string;

  beforeEach(async () => {
    database = InMemoryDatabase.getInstance();
    database.clear();
    resourceService = new ResourceService();
    topicService = new TopicService();

    // Create a test topic first
    const topic = await topicService.create({
      name: 'Test Topic',
      content: 'Test topic content'
    });
    testTopicId = topic.id;
  });

  afterEach(() => {
    database.clear();
  });

  describe('create', () => {
    it('should create a new resource successfully', async () => {
      const resourceData = {
        topicId: testTopicId,
        url: 'https://example.com/resource',
        description: 'Test resource description',
        type: ResourceType.ARTICLE
      };

      const resource = await resourceService.create(resourceData);

      expect(resource).toBeDefined();
      expect(resource.id).toBeDefined();
      expect(resource.topicId).toBe(testTopicId);
      expect(resource.url).toBe('https://example.com/resource');
      expect(resource.description).toBe('Test resource description');
      expect(resource.type).toBe(ResourceType.ARTICLE);
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError for invalid URL', async () => {
      const invalidData = {
        topicId: testTopicId,
        url: 'invalid-url',
        description: 'Test description',
        type: ResourceType.ARTICLE
      };

      await expect(resourceService.create(invalidData))
        .rejects.toThrow('Resource validation failed: URL must be a valid URL format');
    });

    it('should throw ValidationError for empty description', async () => {
      const invalidData = {
        topicId: testTopicId,
        url: 'https://example.com',
        description: '',
        type: ResourceType.ARTICLE
      };

      await expect(resourceService.create(invalidData))
        .rejects.toThrow('Resource topicId, url, description, and type are required');
    });
  });

  describe('update', () => {
    it('should update resource successfully', async () => {
      const resource = await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/original',
        description: 'Original description',
        type: ResourceType.ARTICLE
      });

      const originalUpdatedAt = resource.updatedAt.getTime();
      
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedResource = await resourceService.update(resource.id, {
        description: 'Updated description',
        type: ResourceType.VIDEO
      });

      expect(updatedResource.id).toBe(resource.id);
      expect(updatedResource.description).toBe('Updated description');
      expect(updatedResource.type).toBe(ResourceType.VIDEO);
      expect(updatedResource.url).toBe('https://example.com/original'); // Should remain unchanged
      expect(updatedResource.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('should throw error for non-existent resource', async () => {
      await expect(resourceService.update('non-existent-id', { description: 'New description' }))
        .rejects.toThrow('Resource with id non-existent-id not found');
    });
  });

  describe('findByTopicId', () => {
    it('should return resources for a specific topic', async () => {
      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/resource1',
        description: 'Resource 1',
        type: ResourceType.ARTICLE
      });

      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/resource2',
        description: 'Resource 2',
        type: ResourceType.VIDEO
      });

      const resources = await resourceService.findByTopicId(testTopicId);

      expect(resources).toHaveLength(2);
      expect(resources.every(r => r.topicId === testTopicId)).toBe(true);
    });

    it('should return empty array for topic with no resources', async () => {
      const resources = await resourceService.findByTopicId('non-existent-topic');
      expect(resources).toHaveLength(0);
    });
  });

  describe('findByType', () => {
    it('should return resources of specific type', async () => {
      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/article',
        description: 'Article resource',
        type: ResourceType.ARTICLE
      });

      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/video',
        description: 'Video resource',
        type: ResourceType.VIDEO
      });

      const articleResources = await resourceService.findByType(ResourceType.ARTICLE);
      const videoResources = await resourceService.findByType(ResourceType.VIDEO);

      expect(articleResources).toHaveLength(1);
      expect(articleResources[0].type).toBe(ResourceType.ARTICLE);
      expect(videoResources).toHaveLength(1);
      expect(videoResources[0].type).toBe(ResourceType.VIDEO);
    });
  });

  describe('searchByDescription', () => {
    it('should find resources by description query', async () => {
      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/javascript',
        description: 'JavaScript tutorial for beginners',
        type: ResourceType.ARTICLE
      });

      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/python',
        description: 'Python programming guide',
        type: ResourceType.ARTICLE
      });

      const jsResources = await resourceService.searchByDescription('JavaScript');
      const programmingResources = await resourceService.searchByDescription('programming');

      expect(jsResources).toHaveLength(1);
      expect(jsResources[0].description).toContain('JavaScript');
      expect(programmingResources).toHaveLength(1);
      expect(programmingResources[0].description).toContain('programming');
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', async () => {
      const validUrl = await resourceService.validateUrl('https://example.com');
      const validHttpUrl = await resourceService.validateUrl('http://example.com');
      
      expect(validUrl).toBe(true);
      expect(validHttpUrl).toBe(true);
    });

    it('should reject invalid URLs', async () => {
      const invalidUrl = await resourceService.validateUrl('not-a-url');
      const incompleteUrl = await resourceService.validateUrl('example.com');
      
      expect(invalidUrl).toBe(false);
      expect(incompleteUrl).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return resource statistics', async () => {
      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/article1',
        description: 'Article 1',
        type: ResourceType.ARTICLE
      });

      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/article2',
        description: 'Article 2',
        type: ResourceType.ARTICLE
      });

      await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/video1',
        description: 'Video 1',
        type: ResourceType.VIDEO
      });

      const stats = await resourceService.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple resources', async () => {
      const resourcesData = [
        {
          topicId: testTopicId,
          url: 'https://example.com/resource1',
          description: 'Resource 1',
          type: ResourceType.ARTICLE
        },
        {
          topicId: testTopicId,
          url: 'https://example.com/resource2',
          description: 'Resource 2',
          type: ResourceType.VIDEO
        }
      ];

      const createdResources = await resourceService.bulkCreate(resourcesData);

      expect(createdResources).toHaveLength(2);
      expect(createdResources[0].description).toBe('Resource 1');
      expect(createdResources[1].description).toBe('Resource 2');
    });

    it('should handle partial failures in bulk creation', async () => {
      const resourcesData = [
        {
          topicId: testTopicId,
          url: 'https://example.com/valid',
          description: 'Valid resource',
          type: ResourceType.ARTICLE
        },
        {
          topicId: testTopicId,
          url: 'invalid-url',
          description: 'Invalid resource',
          type: ResourceType.ARTICLE
        }
      ];

      const createdResources = await resourceService.bulkCreate(resourcesData);

      // Should create only the valid resource
      expect(createdResources).toHaveLength(1);
      expect(createdResources[0].description).toBe('Valid resource');
    });
  });

  describe('delete', () => {
    it('should delete resource successfully', async () => {
      const resource = await resourceService.create({
        topicId: testTopicId,
        url: 'https://example.com/to-delete',
        description: 'Resource to delete',
        type: ResourceType.ARTICLE
      });

      const deleted = await resourceService.delete(resource.id);
      expect(deleted).toBe(true);

      const foundResource = await resourceService.findById(resource.id);
      expect(foundResource).toBeNull();
    });

    it('should return false for non-existent resource', async () => {
      const deleted = await resourceService.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});