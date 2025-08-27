import { TopicService } from '../services/TopicService';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { ValidationError } from '../types/errors';

describe('TopicService', () => {
  let topicService: TopicService;
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = InMemoryDatabase.getInstance();
    database.clear();
    topicService = new TopicService();
  });

  afterEach(() => {
    database.clear();
  });

  describe('createTopic', () => {
    it('should create a new topic successfully', async () => {
      const topicData = {
        name: 'Test Topic',
        content: 'Test content'
      };

      const result = await topicService.create(topicData);

      expect(result).toBeDefined();
      expect(result.name).toBe(topicData.name);
      expect(result.content).toBe(topicData.content);
      expect(result.version).toBe(1);
    });

    it('should create a child topic with parent reference', async () => {
      // Create parent topic first
      const parentTopic = await topicService.create({
        name: 'Parent Topic',
        content: 'Parent content'
      });

      const childData = {
        name: 'Child Topic',
        content: 'Child content',
        parentTopicId: parentTopic.id
      };

      const childTopic = await topicService.create(childData);

      expect(childTopic.parentTopicId).toBe(parentTopic.id);
    });

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name should be invalid
        content: 'Test content'
      };

      await expect(topicService.create(invalidData))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('updateTopic', () => {
    it('should create a new version when updating topic', async () => {
      const originalTopic = await topicService.create({
        name: 'Original Topic',
        content: 'Original content'
      });

      const updatedTopic = await topicService.update(originalTopic.id, {
        content: 'Updated content'
      });

      expect(updatedTopic.version).toBe(2);
      expect(updatedTopic.content).toBe('Updated content');
      expect(updatedTopic.name).toBe('Original Topic'); // Name should remain
    });

    it('should throw NotFoundError for non-existent topic', async () => {
      await expect(topicService.update('non-existent-id', { content: 'test' }))
        .rejects.toThrow();
    });
  });

  describe('getTopicTree', () => {
    it('should return hierarchical tree structure', async () => {
      // Create parent topic
      const parent = await topicService.create({
        name: 'Parent',
        content: 'Parent content'
      });

      // Create child topics
      const child1 = await topicService.create({
        name: 'Child 1',
        content: 'Child 1 content',
        parentTopicId: parent.id
      });

      const child2 = await topicService.create({
        name: 'Child 2',
        content: 'Child 2 content',
        parentTopicId: parent.id
      });

      const tree = await topicService.getTopicTree(parent.id);

      expect(tree).toBeDefined();
      expect(tree.topic.id).toBe(parent.id);
      expect(tree.children).toHaveLength(2);
      expect(tree.children.map(c => c.topic.id)).toContain(child1.id);
      expect(tree.children.map(c => c.topic.id)).toContain(child2.id);
    });
  });

  describe('findShortestPath', () => {
    it('should find path between connected topics', async () => {
      // Create a simple hierarchy: A -> B -> C
      const topicA = await topicService.create({
        name: 'Topic A',
        content: 'Content A'
      });

      const topicB = await topicService.create({
        name: 'Topic B',
        content: 'Content B',
        parentTopicId: topicA.id
      });

      const topicC = await topicService.create({
        name: 'Topic C',
        content: 'Content C',
        parentTopicId: topicB.id
      });

      const path = await topicService.findShortestPath(topicA.id, topicC.id);

      expect(path).toHaveLength(3);
      expect(path[0].id).toBe(topicA.id);
      expect(path[1].id).toBe(topicB.id);
      expect(path[2].id).toBe(topicC.id);
    });

    it('should return empty array for disconnected topics', async () => {
      const topic1 = await topicService.create({
        name: 'Topic 1',
        content: 'Content 1'
      });

      const topic2 = await topicService.create({
        name: 'Topic 2',
        content: 'Content 2'
      });

      const path = await topicService.findShortestPath(topic1.id, topic2.id);
      expect(path).toHaveLength(0);
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version of a topic', async () => {
      const originalTopic = await topicService.create({
        name: 'Test Topic',
        content: 'Original content'
      });

      // Update the topic to create version 2
      await topicService.update(originalTopic.id, {
        content: 'Updated content'
      });

      const latestVersion = await topicService.getLatestVersion(originalTopic.id);

      expect(latestVersion).toBeDefined();
      expect(latestVersion!.version).toBe(2);
      expect(latestVersion!.content).toBe('Updated content');
    });
  });

  describe('searchByName', () => {
    it('should find topics by name pattern', async () => {
      await topicService.create({
        name: 'JavaScript Basics',
        content: 'JS content'
      });

      await topicService.create({
        name: 'Python Basics',
        content: 'Python content'
      });

      await topicService.create({
        name: 'Advanced JavaScript',
        content: 'Advanced JS content'
      });

      const results = await topicService.searchByName('JavaScript');

      expect(results).toHaveLength(2);
      expect(results.every(topic => topic.name.includes('JavaScript'))).toBe(true);
    });
  });
});