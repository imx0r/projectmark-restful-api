import { IResourceRepository } from '../interfaces/IResource';
import { Resource } from '../models/Resource';
import { InMemoryDatabase } from './InMemoryDatabase';

/**
 * Repository implementation for Resource entity
 */
export class ResourceRepository implements IResourceRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  /**
   * Saves a resource to the database
   */
  async save(resource: Resource): Promise<Resource> {
    // Validate resource before saving
    const isValid = await resource.validate();
    if (!isValid) {
      const errors = resource.getValidationErrors();
      throw new Error(`Resource validation failed: ${errors.join(', ')}`);
    }

    return this.database.saveResource(resource);
  }

  /**
   * Finds a resource by ID
   */
  async findById(id: string): Promise<Resource | null> {
    return this.database.findResourceById(id);
  }

  /**
   * Finds all resources
   */
  async findAll(): Promise<Resource[]> {
    return this.database.findAllResources();
  }

  /**
   * Finds resources by topic ID
   */
  async findByTopicId(topicId: string): Promise<Resource[]> {
    return this.database.findResourcesByTopicId(topicId);
  }

  /**
   * Deletes a resource
   */
  async delete(id: string): Promise<boolean> {
    return this.database.deleteResource(id);
  }

  /**
   * Checks if a resource exists
   */
  async exists(id: string): Promise<boolean> {
    const resource = await this.findById(id);
    return resource !== null;
  }

  /**
   * Finds resources by type
   */
  async findByType(type: string): Promise<Resource[]> {
    const allResources = await this.findAll();
    return allResources.filter(resource => resource.type === type);
  }

  /**
   * Finds resources by URL pattern
   */
  async findByUrlPattern(pattern: string): Promise<Resource[]> {
    const allResources = await this.findAll();
    const regex = new RegExp(pattern, 'i');
    return allResources.filter(resource => regex.test(resource.url));
  }

  /**
   * Finds resources by description (case-insensitive search)
   */
  async findByDescription(description: string): Promise<Resource[]> {
    const allResources = await this.findAll();
    const searchDescription = description.toLowerCase();
    return allResources.filter(resource => 
      resource.description.toLowerCase().includes(searchDescription)
    );
  }

  /**
   * Gets statistics about resources
   */
  async getStatistics(): Promise<Record<string, number>> {
    const allResources = await this.findAll();
    const typeCount: Record<string, number> = {};
    const topicCount: Record<string, number> = {};

    for (const resource of allResources) {
      // Count by type
      typeCount[resource.type] = (typeCount[resource.type] || 0) + 1;
      
      // Count by topic
      topicCount[resource.topicId] = (topicCount[resource.topicId] || 0) + 1;
    }

    return {
      totalResources: allResources.length,
      uniqueTypes: Object.keys(typeCount).length,
      uniqueTopics: Object.keys(topicCount).length,
      ...typeCount
    };
  }

  /**
   * Deletes all resources for a specific topic
   */
  async deleteByTopicId(topicId: string): Promise<number> {
    const resources = await this.findByTopicId(topicId);
    let deletedCount = 0;

    for (const resource of resources) {
      const deleted = await this.delete(resource.id);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Validates all resources and returns invalid ones
   */
  async findInvalidResources(): Promise<{ resource: Resource; errors: string[] }[]> {
    const allResources = await this.findAll();
    const invalidResources: { resource: Resource; errors: string[] }[] = [];

    for (const resource of allResources) {
      const isValid = await resource.validate();
      if (!isValid) {
        const errors = resource.getValidationErrors();
        invalidResources.push({ resource, errors });
      }
    }

    return invalidResources;
  }
}