import request from 'supertest';
import App from '../app';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

describe('Integration Tests', () => {
  let app: App;
  let server: any;
  let database: InMemoryDatabase;

  beforeAll(async () => {
    database = InMemoryDatabase.getInstance();
    app = new App();
    server = app.getApp();
  });

  beforeEach(() => {
    database.clear();
  });

  afterEach(() => {
    database.clear();
  });

  describe('Topic API Integration', () => {
    describe('POST /api/topics', () => {
      it('should create a new topic', async () => {
        const topicData = {
          name: 'Integration Test Topic',
          content: 'This is a test topic for integration testing'
        };

        const response = await request(server)
          .post('/api/topics')
          .send(topicData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(topicData.name);
        expect(response.body.data.content).toBe(topicData.content);
        expect(response.body.data.version).toBe(1);
      });

      it('should return validation error for invalid data', async () => {
        const invalidData = {
          name: '', // Empty name
          content: 'Test content'
        };

        const response = await request(server)
          .post('/api/topics')
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /api/topics', () => {
      it('should retrieve all topics', async () => {
        // Create test topics first
        await request(server)
          .post('/api/topics')
          .send({ name: 'Topic 1', content: 'Content 1' });

        await request(server)
          .post('/api/topics')
          .send({ name: 'Topic 2', content: 'Content 2' });

        const response = await request(server)
          .get('/api/topics')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      });

      it('should search topics by name', async () => {
        await request(server)
          .post('/api/topics')
          .send({ name: 'JavaScript Basics', content: 'JS content' });

        await request(server)
          .post('/api/topics')
          .send({ name: 'Python Basics', content: 'Python content' });

        const response = await request(server)
          .get('/api/topics?query=Script')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].name).toContain('JavaScript');
      });
    });

    describe('PUT /api/topics/:id', () => {
      it('should update a topic and create new version', async () => {
        // Create initial topic
        const createResponse = await request(server)
          .post('/api/topics')
          .send({ name: 'Original Topic', content: 'Original content' });

        const topicId = createResponse.body.data.id;

        // Update the topic
        const updateResponse = await request(server)
          .put(`/api/topics/${topicId}`)
          .send({ content: 'Updated content' })
          .expect(200);

        expect(updateResponse.body.success).toBe(true);
        expect(updateResponse.body.data.version).toBe(2);
        expect(updateResponse.body.data.content).toBe('Updated content');
      });
    });

    describe('GET /api/topics/:id/tree', () => {
      it('should return hierarchical topic tree', async () => {
        // Create parent topic
        const parentResponse = await request(server)
          .post('/api/topics')
          .send({ name: 'Parent Topic', content: 'Parent content' });

        const parentId = parentResponse.body.data.id;

        // Create child topics
        await request(server)
          .post('/api/topics')
          .send({
            name: 'Child Topic 1',
            content: 'Child content 1',
            parentTopicId: parentId
          });

        await request(server)
          .post('/api/topics')
          .send({
            name: 'Child Topic 2',
            content: 'Child content 2',
            parentTopicId: parentId
          });

        const treeResponse = await request(server)
          .get(`/api/topics/${parentId}/tree`)
          .expect(200);

        expect(treeResponse.body.success).toBe(true);
        expect(treeResponse.body.data.topic.id).toBe(parentId);
        expect(treeResponse.body.data.children).toHaveLength(2);
      });
    });

    describe('GET /api/topics/path', () => {
      it('should find shortest path between topics', async () => {
        // Create topic hierarchy: A -> B -> C
        const topicAResponse = await request(server)
          .post('/api/topics')
          .send({ name: 'Topic A', content: 'Content A' });

        const topicAId = topicAResponse.body.data.id;

        const topicBResponse = await request(server)
          .post('/api/topics')
          .send({
            name: 'Topic B',
            content: 'Content B',
            parentTopicId: topicAId
          });

        const topicBId = topicBResponse.body.data.id;

        const topicCResponse = await request(server)
          .post('/api/topics')
          .send({
            name: 'Topic C',
            content: 'Content C',
            parentTopicId: topicBId
          });

        const topicCId = topicCResponse.body.data.id;

        const pathResponse = await request(server)
          .get(`/api/topics/path?from=${topicAId}&to=${topicCId}`)
          .expect(200);

        expect(pathResponse.body.success).toBe(true);
        expect(pathResponse.body.data).toHaveLength(3);
        expect(pathResponse.body.data[0].id).toBe(topicAId);
        expect(pathResponse.body.data[1].id).toBe(topicBId);
        expect(pathResponse.body.data[2].id).toBe(topicCId);
      });
    });
  });

  describe('Resource API Integration', () => {
    let topicId: string;

    beforeEach(async () => {
      // Create a topic for resource tests
      const topicResponse = await request(server)
        .post('/api/topics')
        .send({ name: 'Test Topic', content: 'Test content' });
      topicId = topicResponse.body.data.id;
    });

    describe('POST /api/resources', () => {
      it('should create a new resource', async () => {
        const resourceData = {
          topicId,
          url: 'https://example.com/resource',
          description: 'Test resource',
          type: 'article'
        };

        const response = await request(server)
          .post('/api/resources')
          .send(resourceData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.topicId).toBe(topicId);
        expect(response.body.data.url).toBe(resourceData.url);
        expect(response.body.data.type).toBe(resourceData.type);
      });
    });

    describe('GET /api/resources', () => {
      it('should retrieve all resources', async () => {
        // Create test resources
        await request(server)
          .post('/api/resources')
          .send({
            topicId,
            url: 'https://example.com/resource1',
            description: 'Resource 1',
            type: 'article'
          });

        await request(server)
          .post('/api/resources')
          .send({
            topicId,
            url: 'https://example.com/resource2',
            description: 'Resource 2',
            type: 'video'
          });

        const response = await request(server)
          .get('/api/resources')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter resources by topic', async () => {
        // Create another topic
        const topic2Response = await request(server)
          .post('/api/topics')
          .send({ name: 'Topic 2', content: 'Content 2' });
        const topic2Id = topic2Response.body.data.id;

        // Create resources for different topics
        await request(server)
          .post('/api/resources')
          .send({
            topicId,
            url: 'https://example.com/resource1',
            description: 'Resource 1',
            type: 'article'
          });

        await request(server)
          .post('/api/resources')
          .send({
            topicId: topic2Id,
            url: 'https://example.com/resource2',
            description: 'Resource 2',
            type: 'video'
          });

        const response = await request(server)
          .get(`/api/resources?topicId=${topicId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].topicId).toBe(topicId);
      });
    });
  });

  describe('User API Integration', () => {
    describe('POST /api/users', () => {
      it('should create a new user', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          role: 'Editor'
        };

        const response = await request(server)
          .post('/api/users')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(userData.name);
        expect(response.body.data.email).toBe(userData.email);
        expect(response.body.data.role).toBe(userData.role);
      });

      it('should prevent duplicate email addresses', async () => {
        const userData = {
          name: 'Test User',
          email: 'duplicate@example.com',
          role: 'Viewer'
        };

        // Create first user
        await request(server)
          .post('/api/users')
          .send(userData)
          .expect(201);

        // Try to create second user with same email
        const response = await request(server)
          .post('/api/users')
          .send({ ...userData, name: 'Different Name' })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /api/users', () => {
      it('should retrieve all users', async () => {
        // Create test users
        await request(server)
          .post('/api/users')
          .send({ name: 'User 1', email: 'user1@example.com', role: 'Admin' });

        await request(server)
          .post('/api/users')
          .send({ name: 'User 2', email: 'user2@example.com', role: 'Editor' });

        const response = await request(server)
          .get('/api/users')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter users by role', async () => {
        await request(server)
          .post('/api/users')
          .send({ name: 'Admin User', email: 'admin@example.com', role: 'Admin' });

        await request(server)
          .post('/api/users')
          .send({ name: 'Editor User', email: 'editor@example.com', role: 'Editor' });

        const response = await request(server)
          .get('/api/users?role=Admin')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].role).toBe('Admin');
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Dynamic Knowledge Base API');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(server)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent topic', async () => {
      const response = await request(server)
        .get('/api/topics/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});