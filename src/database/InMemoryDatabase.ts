import { Topic } from '../models/Topic';
import { Resource } from '../models/Resource';
import { User } from '../models/User';

/**
 * In-memory database implementation
 */
export class InMemoryDatabase {
  private static instance: InMemoryDatabase;
  private topics: Map<string, Topic[]> = new Map(); // id -> versions array
  private resources: Map<string, Resource> = new Map(); // id -> resource
  private users: Map<string, User> = new Map(); // id -> user
  private usersByEmail: Map<string, User> = new Map(); // email -> user

  private constructor() {}

  /**
   * Singleton pattern implementation
   */
  static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  /**
   * Clears all data (useful for testing)
   */
  clear(): void {
    this.topics.clear();
    this.resources.clear();
    this.users.clear();
    this.usersByEmail.clear();
  }

  // Topic operations
  /**
   * Saves a topic (creates new version if topic exists)
   */
  saveTopic(topic: Topic): Topic {
    const versions = this.topics.get(topic.id) || [];
    
    // Check if this version already exists
    const existingVersionIndex = versions.findIndex(v => v.version === topic.version);
    
    if (existingVersionIndex >= 0) {
      // Update existing version
      versions[existingVersionIndex] = topic;
    } else {
      // Add new version
      versions.push(topic);
      // Sort versions by version number
      versions.sort((a, b) => a.version - b.version);
    }
    
    this.topics.set(topic.id, versions);
    return topic;
  }

  /**
   * Finds a topic by ID and optional version
   */
  findTopicById(id: string, version?: number): Topic | null {
    const versions = this.topics.get(id);
    if (!versions || versions.length === 0) {
      return null;
    }

    if (version !== undefined) {
      return versions.find(v => v.version === version) || null;
    }

    // Return latest version
    return versions[versions.length - 1];
  }

  /**
   * Gets all versions of a topic
   */
  findTopicVersions(id: string): Topic[] {
    return this.topics.get(id) || [];
  }

  /**
   * Finds all topics (latest versions only)
   */
  findAllTopics(): Topic[] {
    const latestTopics: Topic[] = [];
    
    for (const versions of this.topics.values()) {
      if (versions.length > 0) {
        latestTopics.push(versions[versions.length - 1]);
      }
    }
    
    return latestTopics;
  }

  /**
   * Finds topics by parent ID (latest versions only)
   */
  findTopicsByParentId(parentId: string): Topic[] {
    const allTopics = this.findAllTopics();
    return allTopics.filter(topic => topic.parentTopicId === parentId);
  }

  /**
   * Deletes all versions of a topic
   */
  deleteTopic(id: string): boolean {
    return this.topics.delete(id);
  }

  // Resource operations
  /**
   * Saves a resource
   */
  saveResource(resource: Resource): Resource {
    this.resources.set(resource.id, resource);
    return resource;
  }

  /**
   * Finds a resource by ID
   */
  findResourceById(id: string): Resource | null {
    return this.resources.get(id) || null;
  }

  /**
   * Finds all resources
   */
  findAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Finds resources by topic ID
   */
  findResourcesByTopicId(topicId: string): Resource[] {
    return Array.from(this.resources.values())
      .filter(resource => resource.topicId === topicId);
  }

  /**
   * Deletes a resource
   */
  deleteResource(id: string): boolean {
    return this.resources.delete(id);
  }

  // User operations
  /**
   * Saves a user
   */
  saveUser(user: User): User {
    // Remove old email mapping if email changed
    const existingUser = this.users.get(user.id);
    if (existingUser && existingUser.email !== user.email) {
      this.usersByEmail.delete(existingUser.email);
    }
    
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  /**
   * Finds a user by ID
   */
  findUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  /**
   * Finds a user by email
   */
  findUserByEmail(email: string): User | null {
    return this.usersByEmail.get(email) || null;
  }

  /**
   * Finds all users
   */
  findAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Deletes a user
   */
  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (user) {
      this.usersByEmail.delete(user.email);
      return this.users.delete(id);
    }
    return false;
  }

  // Utility methods
  /**
   * Gets database statistics
   */
  getStats(): Record<string, number> {
    let totalTopicVersions = 0;
    for (const versions of this.topics.values()) {
      totalTopicVersions += versions.length;
    }

    return {
      uniqueTopics: this.topics.size,
      totalTopicVersions,
      resources: this.resources.size,
      users: this.users.size
    };
  }

  /**
   * Exports all data (useful for backup/testing)
   */
  exportData(): Record<string, any> {
    const topicsData: Record<string, any> = {};
    for (const [id, versions] of this.topics.entries()) {
      topicsData[id] = versions.map(topic => topic.toJSON());
    }

    return {
      topics: topicsData,
      resources: Array.from(this.resources.values()).map(r => r.toJSON()),
      users: Array.from(this.users.values()).map(u => u.toJSON())
    };
  }

  /**
   * Imports data (useful for restore/testing)
   */
  importData(data: Record<string, any>): void {
    this.clear();
    
    // Import topics
    if (data.topics) {
      for (const [id, versions] of Object.entries(data.topics as Record<string, Record<string, any>[]>)) {
        const topicVersions: Topic[] = [];
        for (const versionData of versions) {
          const topic = new Topic(
            versionData.name,
            versionData.content,
            versionData.parentTopicId,
            versionData.version,
            versionData.id
          );
          topicVersions.push(topic);
        }
        this.topics.set(id, topicVersions);
      }
    }
    
    // Import resources
    if (data.resources) {
      for (const resourceData of data.resources) {
        const resource = new Resource(
          resourceData.topicId,
          resourceData.url,
          resourceData.description,
          resourceData.type,
          resourceData.id
        );
        this.resources.set(resource.id, resource);
      }
    }
    
    // Import users
    if (data.users) {
      for (const userData of data.users) {
        const user = new User(
          userData.name,
          userData.email,
          userData.role,
          userData.id
        );
        this.users.set(user.id, user);
        this.usersByEmail.set(user.email, user);
      }
    }
  }
}