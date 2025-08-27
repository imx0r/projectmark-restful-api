import { ITopicService, ITopicTree, ITopic } from '../interfaces/ITopic';
import { Topic } from '../models/Topic';
import { TopicRepository } from '../database/TopicRepository';
import { ShortestPathAlgorithm } from '../algorithms/ShortestPathAlgorithm';
// import { TopicComponentFactory } from '../utils/TopicComposite';
import { VersionedTopicFactory } from '../utils/EntityFactory';

/**
 * Service implementation for Topic business logic
 */
export class TopicService implements ITopicService {
  private repository: TopicRepository;
  private pathAlgorithm: ShortestPathAlgorithm;
  private topicFactory: VersionedTopicFactory;

  constructor() {
    this.repository = new TopicRepository();
    this.pathAlgorithm = new ShortestPathAlgorithm(this.repository);
    this.topicFactory = new VersionedTopicFactory();
  }

  /**
   * Creates a new topic
   */
  async create(data: Partial<ITopic>): Promise<Topic> {
    const topic = this.topicFactory.createTopic(data);
    return await this.repository.save(topic);
  }

  /**
   * Updates an existing topic (creates new version)
   */
  async update(id: string, data: Partial<Topic>): Promise<Topic> {
    const existingTopic = await this.repository.findById(id);
    if (!existingTopic) {
      throw new Error(`Topic with id ${id} not found`);
    }

    // Create new version
    const newVersion = existingTopic.createNewVersion();
    
    // Update properties
    if (data.name !== undefined) newVersion.name = data.name;
    if (data.content !== undefined) newVersion.content = data.content;
    if (data.parentTopicId !== undefined) newVersion.parentTopicId = data.parentTopicId;

    return await this.repository.save(newVersion);
  }

  /**
   * Finds a topic by ID
   */
  async findById(id: string, version?: number): Promise<Topic | null> {
    return await this.repository.findById(id, version);
  }

  /**
   * Finds all topics
   */
  async findAll(): Promise<Topic[]> {
    return await this.repository.findAll();
  }

  /**
   * Deletes a topic and all its versions
   */
  async delete(id: string): Promise<boolean> {
    const topic = await this.repository.findById(id);
    if (!topic) {
      return false;
    }

    // Delete all versions of this topic
    const versions = await this.repository.findVersions(topic.name);
    let deletedCount = 0;

    for (const version of versions) {
      const deleted = await this.repository.delete(version.id);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount > 0;
  }

  /**
   * Gets all versions of a topic
   */
  async getVersions(id: string): Promise<Topic[]> {
    // First find the topic by name to get its ID
    const topic = await this.repository.findById(id);
    if (!topic) {
      return [];
    }
    // Use the first matching topic's ID to get all versions
    return await this.repository.findVersions(topic.id);
  }

  /**
   * Gets a specific version of a topic
   */
  async getVersion(id: string, version: number): Promise<Topic | null> {
    // First find the topic by name to get its ID
    const topic = await this.repository.findById(id);
    if (!topic) {
      return null;
    }
    // Get all versions and find the specific version
    const versions = await this.repository.findVersions(topic.id);
    return versions.find(t => t.version === version) || null;
  }

  /**
   * Gets the latest version of a topic
   */
  async getLatestVersion(topicName: string): Promise<Topic | null> {
    const versions = await this.repository.findVersions(topicName);
    return versions.length > 0 ? versions[versions.length - 1] : null;
  }

  /**
   * Gets topic tree structure recursively
   */
  async getTopicTree(id: string): Promise<ITopicTree> {
    const rootTopic = await this.repository.findById(id);
    if (!rootTopic) {
      throw new Error(`Topic with id ${id} not found`);
    }

    return await this.buildTopicTree(rootTopic);
  }

  /**
   * Builds a topic tree recursively
   */
  private async buildTopicTree(topic: Topic): Promise<ITopicTree> {
    const children = await this.repository.findByParentId(topic.id);
    const childTrees: ITopicTree[] = [];

    for (const child of children) {
      const childTree = await this.buildTopicTree(child);
      childTrees.push(childTree);
    }

    return {
      topic,
      children: childTrees
    };
  }

  /**
   * Calculates the depth of a topic in the hierarchy
   */
  public async calculateDepth(topic: Topic): Promise<number> {
    let depth = 0;
    let currentTopic = topic;

    while (currentTopic.parentTopicId) {
      const parent = await this.repository.findById(currentTopic.parentTopicId);
      if (!parent) break;
      currentTopic = parent;
      depth++;
    }

    return depth;
  }

  /**
   * Counts all descendants of a topic recursively
   */
  public async countDescendants(topicId: string): Promise<number> {
    const children = await this.repository.findByParentId(topicId);
    let count = children.length;

    for (const child of children) {
      count += await this.countDescendants(child.id);
    }

    return count;
  }

  /**
   * Finds the shortest path between two topics
   */
  async findShortestPath(fromTopicId: string, toTopicId: string): Promise<Topic[]> {
    return await this.pathAlgorithm.findShortestPath(fromTopicId, toTopicId);
  }

  /**
   * Searches topics by name
   */
  async searchByName(query: string): Promise<Topic[]> {
    return await this.repository.findByName(query);
  }

  /**
   * Searches topics by content
   */
  async searchByContent(query: string): Promise<Topic[]> {
    return await this.repository.findByContent(query);
  }

  /**
   * Searches topics by keyword in both name and content
   */
  async searchTopics(query: string): Promise<Topic[]> {
    const nameResults = await this.searchByName(query);
    const contentResults = await this.searchByContent(query);
    
    // Combine results and remove duplicates based on ID
    const combinedResults = [...nameResults, ...contentResults];
    const uniqueResults = combinedResults.filter((topic, index, self) => 
      index === self.findIndex(t => t.id === topic.id)
    );
    
    return uniqueResults;
  }

  /**
   * Gets all child topics of a parent
   */
  async getChildren(parentId: string): Promise<Topic[]> {
    return await this.repository.findByParentId(parentId);
  }

  /**
   * Gets all root topics (topics without parents)
   */
  async getRootTopics(): Promise<Topic[]> {
    return await this.repository.findRootTopics();
  }

  /**
   * Moves a topic to a new parent
   */
  async moveTopic(topicId: string, newParentId: string | null): Promise<Topic> {
    const topic = await this.repository.findById(topicId);
    if (!topic) {
      throw new Error(`Topic with id ${topicId} not found`);
    }

    // Validate that we're not creating a circular reference
    if (newParentId && await this.wouldCreateCircularReference(topicId, newParentId)) {
      throw new Error('Moving topic would create a circular reference');
    }

    // Create new version with updated parent
    const newVersion = topic.createNewVersion();
    newVersion.parentTopicId = newParentId || undefined;

    return await this.repository.save(newVersion);
  }

  /**
   * Checks if moving a topic would create a circular reference
   */
  private async wouldCreateCircularReference(topicId: string, newParentId: string): Promise<boolean> {
    let currentParentId: string | undefined = newParentId;

    while (currentParentId) {
      if (currentParentId === topicId) {
        return true;
      }

      const parent = await this.repository.findById(currentParentId);
      if (!parent) break;
      currentParentId = parent.parentTopicId;
    }

    return false;
  }

  /**
   * Gets topic statistics
   */
  async getStatistics(): Promise<Record<string, number>> {
    return await this.repository.getStatistics();
  }

  /**
   * Gets the maximum depth of the topic hierarchy
   */
  async getMaxDepth(): Promise<number> {
    return await this.repository.getMaxDepth();
  }

  /**
   * Validates topic hierarchy integrity
   */
  async validateHierarchy(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const allTopics = await this.repository.findAll();

    for (const topic of allTopics) {
      // Check if parent exists (if parentTopicId is set)
      if (topic.parentTopicId) {
        const parent = await this.repository.findById(topic.parentTopicId);
        if (!parent) {
          errors.push(`Topic ${topic.id} references non-existent parent ${topic.parentTopicId}`);
        }
      }

      // Check for circular references
      if (await this.hasCircularReference(topic.id)) {
        errors.push(`Topic ${topic.id} has circular reference in hierarchy`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if a topic has circular references
   */
  private async hasCircularReference(topicId: string): Promise<boolean> {
    const visited = new Set<string>();
    let currentId: string | undefined = topicId;

    while (currentId) {
      if (visited.has(currentId)) {
        return true;
      }

      visited.add(currentId);
      const topic = await this.repository.findById(currentId);
      if (!topic) break;
      currentId = topic.parentTopicId;
    }

    return false;
  }
}