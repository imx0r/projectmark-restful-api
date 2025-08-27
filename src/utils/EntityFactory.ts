import { Topic } from '../models/Topic';
import { Resource } from '../models/Resource';
import { User } from '../models/User';
import { ITopic } from '../interfaces/ITopic';
import { IResource } from '../interfaces/IResource';
import { IUser, UserRole } from '../interfaces/IUser';
import { ValidationError } from '../types/errors';

/**
 * Abstract factory for creating entities
 */
export abstract class EntityFactory {
  abstract createTopic(data: Partial<ITopic>): Topic;
  abstract createResource(data: Partial<IResource>): Resource;
  abstract createUser(data: Partial<IUser>): User;
}

/**
 * Concrete factory for creating standard entities
 */
export class StandardEntityFactory extends EntityFactory {
  /**
   * Creates a new Topic instance
   */
  createTopic(data: Partial<ITopic>): Topic {
    if (!data.name || !data.content) {
      throw new ValidationError('Topic name and content are required');
    }

    return new Topic(
      data.name,
      data.content,
      data.parentTopicId,
      data.version || 1,
      data.id
    );
  }

  /**
   * Creates a new Resource instance
   */
  createResource(data: Partial<IResource>): Resource {
    if (!data.topicId || !data.url || !data.description || !data.type) {
      throw new Error('Resource topicId, url, description, and type are required');
    }

    return new Resource(
      data.topicId,
      data.url,
      data.description,
      data.type,
      data.id
    );
  }

  /**
   * Creates a new User instance
   */
  createUser(data: Partial<IUser>): User {
    if (!data.name || !data.email) {
      throw new ValidationError('User name and email are required');
    }

    return new User(
      data.name,
      data.email,
      data.role || UserRole.VIEWER,
      data.id
    );
  }
}

/**
 * Factory for creating versioned topics
 */
export class VersionedTopicFactory extends EntityFactory {
  /**
   * Creates a new versioned Topic instance
   */
  createTopic(data: Partial<ITopic>): Topic {
    if (!data.name || !data.content) {
      throw new ValidationError('Topic name and content are required');
    }

    // Always start with version 1 for new topics
    const version = data.id ? (data.version || 1) : 1;

    return new Topic(
      data.name,
      data.content,
      data.parentTopicId,
      version,
      data.id
    );
  }

  /**
   * Creates a new version of an existing topic
   */
  createNewVersion(existingTopic: Topic, updateData: Partial<ITopic>): Topic {
    const newTopic = new Topic(
      updateData.name || existingTopic.name,
      updateData.content || existingTopic.content,
      updateData.parentTopicId !== undefined ? updateData.parentTopicId : existingTopic.parentTopicId,
      existingTopic.version + 1,
      existingTopic.id // Keep the same ID for versioning
    );

    return newTopic;
  }

  createResource(_data: Partial<IResource>): Resource {
    throw new Error('VersionedTopicFactory only creates topics');
  }

  createUser(_data: Partial<IUser>): User {
    throw new Error('VersionedTopicFactory only creates topics');
  }
}

/**
 * Factory registry for managing different factory types
 */
export class FactoryRegistry {
  private static factories: Map<string, EntityFactory> = new Map();

  /**
   * Registers a factory with a name
   */
  static register(name: string, factory: EntityFactory): void {
    this.factories.set(name, factory);
  }

  /**
   * Gets a factory by name
   */
  static get(name: string): EntityFactory {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Factory '${name}' not found`);
    }
    return factory;
  }

  /**
   * Gets all registered factory names
   */
  static getRegisteredNames(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Initializes default factories
   */
  static initializeDefaults(): void {
    this.register('standard', new StandardEntityFactory());
    this.register('versioned', new VersionedTopicFactory());
  }
}

// Initialize default factories
FactoryRegistry.initializeDefaults();