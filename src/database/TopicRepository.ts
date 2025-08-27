import { ITopicRepository } from '../interfaces/ITopic';
import { Topic } from '../models/Topic';
import { InMemoryDatabase } from './InMemoryDatabase';

/**
 * Repository implementation for Topic entity
 */
export class TopicRepository implements ITopicRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  /**
   * Saves a topic to the database
   */
  async save(topic: Topic): Promise<Topic> {
    // Validate topic before saving
    const isValid = await topic.validate();
    if (!isValid) {
      const errors = topic.getValidationErrors();
      throw new Error(`Topic validation failed: ${errors.join(', ')}`);
    }

    // Set repository reference
    topic.setRepository(this);
    
    return this.database.saveTopic(topic);
  }

  /**
   * Finds a topic by ID and optional version
   */
  async findById(id: string, version?: number): Promise<Topic | null> {
    const topic = this.database.findTopicById(id, version);
    if (topic) {
      topic.setRepository(this);
    }
    return topic;
  }

  /**
   * Finds all topics (latest versions only)
   */
  async findAll(): Promise<Topic[]> {
    const topics = this.database.findAllTopics();
    topics.forEach(topic => topic.setRepository(this));
    return topics;
  }

  /**
   * Finds topics by parent ID
   */
  async findByParentId(parentId: string): Promise<Topic[]> {
    const topics = this.database.findTopicsByParentId(parentId);
    topics.forEach(topic => topic.setRepository(this));
    return topics;
  }

  /**
   * Finds all versions of a topic
   */
  async findVersions(id: string): Promise<Topic[]> {
    const versions = this.database.findTopicVersions(id);
    versions.forEach(topic => topic.setRepository(this));
    return versions;
  }

  /**
   * Deletes a topic and all its versions
   */
  async delete(id: string): Promise<boolean> {
    return this.database.deleteTopic(id);
  }

  /**
   * Finds root topics (topics without parents)
   */
  async findRootTopics(): Promise<Topic[]> {
    const allTopics = await this.findAll();
    const rootTopics = allTopics.filter(topic => !topic.parentTopicId);
    return rootTopics;
  }

  /**
   * Checks if a topic exists
   */
  async exists(id: string): Promise<boolean> {
    const topic = await this.findById(id);
    return topic !== null;
  }

  /**
   * Gets the latest version number for a topic
   */
  async getLatestVersion(id: string): Promise<number> {
    const versions = await this.findVersions(id);
    if (versions.length === 0) {
      return 0;
    }
    return Math.max(...versions.map(v => v.version));
  }

  /**
   * Finds topics by name (case-insensitive search)
   */
  async findByName(name: string): Promise<Topic[]> {
    const allTopics = await this.findAll();
    const searchName = name.toLowerCase();
    return allTopics.filter(topic => 
      topic.name.toLowerCase().includes(searchName)
    );
  }

  /**
   * Finds topics by content (case-insensitive search)
   */
  async findByContent(content: string): Promise<Topic[]> {
    const allTopics = await this.findAll();
    const searchContent = content.toLowerCase();
    return allTopics.filter(topic => 
      topic.content.toLowerCase().includes(searchContent)
    );
  }

  /**
   * Gets topic hierarchy depth
   */
  async getMaxDepth(): Promise<number> {
    const allTopics = await this.findAll();
    let maxDepth = 0;

    for (const topic of allTopics) {
      const ancestors = await topic.getAncestors();
      const depth = ancestors.length + 1;
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  /**
   * Gets statistics about topics
   */
  async getStatistics(): Promise<Record<string, number>> {
    const allTopics = await this.findAll();
    const rootTopics = await this.findRootTopics();
    const maxDepth = await this.getMaxDepth();
    
    let totalVersions = 0;
    const uniqueTopicIds = new Set<string>();
    
    for (const topic of allTopics) {
      uniqueTopicIds.add(topic.id);
      const versions = await this.findVersions(topic.id);
      totalVersions += versions.length;
    }

    return {
      totalTopics: allTopics.length,
      uniqueTopics: uniqueTopicIds.size,
      totalVersions,
      rootTopics: rootTopics.length,
      maxDepth
    };
  }
}