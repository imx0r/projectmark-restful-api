import { IResourceService } from '../interfaces/IResource';
import { Resource } from '../models/Resource';
import { ResourceRepository } from '../database/ResourceRepository';
import { StandardEntityFactory } from '../utils/EntityFactory';

/**
 * Service implementation for Resource business logic
 */
export class ResourceService implements IResourceService {
  private repository: ResourceRepository;
  private factory: StandardEntityFactory;

  constructor() {
    this.repository = new ResourceRepository();
    this.factory = new StandardEntityFactory();
  }

  /**
   * Creates a new resource
   */
  async create(data: Partial<Resource>): Promise<Resource> {
    const resource = this.factory.createResource(data);
    return await this.repository.save(resource);
  }

  /**
   * Updates an existing resource
   */
  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    const existingResource = await this.repository.findById(id);
    if (!existingResource) {
      throw new Error(`Resource with id ${id} not found`);
    }

    // Update properties
    existingResource.update({
      url: data.url,
      description: data.description,
      type: data.type
    });

    return await this.repository.save(existingResource);
  }

  /**
   * Finds a resource by ID
   */
  async findById(id: string): Promise<Resource | null> {
    return await this.repository.findById(id);
  }

  /**
   * Finds all resources
   */
  async findAll(): Promise<Resource[]> {
    return await this.repository.findAll();
  }

  /**
   * Deletes a resource
   */
  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Finds resources by topic ID
   */
  async findByTopicId(topicId: string): Promise<Resource[]> {
    return await this.repository.findByTopicId(topicId);
  }

  /**
   * Finds resources by type
   */
  async findByType(type: string): Promise<Resource[]> {
    return await this.repository.findByType(type);
  }

  /**
   * Searches resources by description
   */
  async searchByDescription(query: string): Promise<Resource[]> {
    return await this.repository.findByDescription(query);
  }

  /**
   * Finds resources by URL pattern
   */
  async findByUrlPattern(pattern: string): Promise<Resource[]> {
    return await this.repository.findByUrlPattern(pattern);
  }

  /**
   * Validates a resource URL
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets resource statistics
   */
  async getStatistics(): Promise<Record<string, number>> {
    return await this.repository.getStatistics();
  }

  /**
   * Deletes all resources for a topic
   */
  async deleteByTopicId(topicId: string): Promise<number> {
    return await this.repository.deleteByTopicId(topicId);
  }

  /**
   * Validates all resources and returns invalid ones
   */
  async validateAllResources(): Promise<{ resource: Resource; errors: string[] }[]> {
    return await this.repository.findInvalidResources();
  }

  /**
   * Checks if a resource is accessible
   */
  async checkAccessibility(id: string): Promise<boolean> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      return false;
    }

    return await resource.isAccessible();
  }

  /**
   * Gets resources grouped by type
   */
  async getResourcesByType(): Promise<Record<string, Resource[]>> {
    const allResources = await this.repository.findAll();
    const grouped: Record<string, Resource[]> = {};

    for (const resource of allResources) {
      if (!grouped[resource.type]) {
        grouped[resource.type] = [];
      }
      grouped[resource.type].push(resource);
    }

    return grouped;
  }

  /**
   * Gets file extension statistics
   */
  async getFileExtensionStats(): Promise<Record<string, number>> {
    const allResources = await this.repository.findAll();
    const extensionCount: Record<string, number> = {};

    for (const resource of allResources) {
      const extension = resource.getFileExtension();
      if (extension) {
        extensionCount[extension] = (extensionCount[extension] || 0) + 1;
      }
    }

    return extensionCount;
  }

  /**
   * Bulk creates resources
   */
  async bulkCreate(resourcesData: Partial<Resource>[]): Promise<Resource[]> {
    const createdResources: Resource[] = [];

    for (const data of resourcesData) {
      try {
        const resource = await this.create(data);
        createdResources.push(resource);
      } catch (error) {
        // Log error but continue with other resources
        console.error(`Failed to create resource: ${error}`);
      }
    }

    return createdResources;
  }

  /**
   * Exports resources to JSON
   */
  async exportResources(): Promise<any[]> {
    const allResources = await this.repository.findAll();
    return allResources.map(resource => resource.toJSON());
  }

  /**
   * Imports resources from JSON data
   */
  async importResources(resourcesData: any[]): Promise<Resource[]> {
    const importedResources: Resource[] = [];

    for (const data of resourcesData) {
      try {
        const resource = await this.create(data);
        importedResources.push(resource);
      } catch (error) {
        console.error(`Failed to import resource: ${error}`);
      }
    }

    return importedResources;
  }
}