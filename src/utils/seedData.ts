import { User } from '../models/User';
import { Topic } from '../models/Topic';
import { Resource } from '../models/Resource';
import { UserRole } from '../interfaces/IUser';
import { ResourceType } from '../interfaces/IResource';
import { UserService } from '../services/UserService';
import { TopicService } from '../services/TopicService';
import { ResourceService } from '../services/ResourceService';

/**
 * Seeds the database with sample data on application startup
 */
export class DataSeeder {
  private userService: UserService;
  private topicService: TopicService;
  private resourceService: ResourceService;

  constructor() {
    this.userService = new UserService();
    this.topicService = new TopicService();
    this.resourceService = new ResourceService();
  }

  /**
   * Seeds the database with sample data
   */
  async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      // Check if data already exists
      const existingUsers = await this.userService.findAll();
      if (existingUsers.length > 0) {
        console.log('📊 Database already contains data, skipping seeding.');
        return;
      }

      // Seed users
      const users = await this.seedUsers();
      console.log(`👥 Created ${users.length} users`);

      // Seed topics with hierarchy
      const topics = await this.seedTopics(); 
      console.log(`📚 Created ${topics.length} topics`);

      // Seed resources
      const resources = await this.seedResources(topics);
      console.log(`🔗 Created ${resources.length} resources`);

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Creates sample users with different roles
   */
  private async seedUsers(): Promise<User[]> {
    const users: User[] = [];

    // Admin user
    const admin = await this.userService.create({
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN
    });
    users.push(admin);

    // Editor user
    const editor = await this.userService.create({
      name: 'Editor User',
      email: 'editor@example.com',
      role: UserRole.EDITOR
    });
    users.push(editor);

    // Viewer user
    const viewer = await this.userService.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: UserRole.VIEWER
    });
    users.push(viewer);

    return users;
  }

  /**
   * Creates sample topics with hierarchical relationships
   */
  private async seedTopics(): Promise<Topic[]> {
    const topics: Topic[] = [];

    // Root topic: Programming
    const programming = await this.topicService.create({
      name: 'Programming',
      content: 'Comprehensive guide to programming concepts and languages.'
    });
    topics.push(programming);

    // Child topic: JavaScript
    const javascript = await this.topicService.create({
      name: 'JavaScript',
      content: 'Modern JavaScript programming language fundamentals and advanced concepts.',
      parentTopicId: programming.id
    });
    topics.push(javascript);

    // Child topic: TypeScript
    const typescript = await this.topicService.create({
      name: 'TypeScript',
      content: 'TypeScript: JavaScript with static type definitions for better development experience.',
      parentTopicId: programming.id
    });
    topics.push(typescript);

    // Grandchild topic: React
    const react = await this.topicService.create({
      name: 'React',
      content: 'React library for building user interfaces with component-based architecture.',
      parentTopicId: javascript.id
    });
    topics.push(react);

    // Root topic: Databases
    const databases = await this.topicService.create({
      name: 'Databases',
      content: 'Database systems, design patterns, and management strategies.'
    });
    topics.push(databases);

    return topics;
  }

  /**
   * Creates sample resources linked to topics
   */
  private async seedResources(topics: Topic[]): Promise<Resource[]> {
    const resources: Resource[] = [];

    const resourceData = [
      {
        topicId: topics[0].id, // Programming
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        description: 'MDN JavaScript Guide - Comprehensive JavaScript documentation',
        type: ResourceType.ARTICLE
      },
      {
        topicId: topics[1].id, // JavaScript
        url: 'https://javascript.info/',
        description: 'The Modern JavaScript Tutorial - In-depth JavaScript learning resource',
        type: ResourceType.ARTICLE
      },
      {
        topicId: topics[1].id, // JavaScript
        url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        description: 'JavaScript Crash Course - Video tutorial for beginners',
        type: ResourceType.VIDEO
      },
      {
        topicId: topics[2].id, // TypeScript
        url: 'https://www.typescriptlang.org/docs/',
        description: 'Official TypeScript Documentation',
        type: ResourceType.ARTICLE
      },
      {
        topicId: topics[3].id, // React
        url: 'https://reactjs.org/docs/getting-started.html',
        description: 'React Official Documentation - Getting Started Guide',
        type: ResourceType.ARTICLE
      },
      {
        topicId: topics[4].id, // Databases
        url: 'https://www.postgresql.org/docs/',
        description: 'PostgreSQL Documentation - Advanced database concepts',
        type: ResourceType.PDF
      }
    ];

    for (const data of resourceData) {
      const resource = await this.resourceService.create(data);
      resources.push(resource);
    }

    return resources;
  }
}

/**
 * Initialize and run database seeding
 */
export async function initializeSampleData(): Promise<void> {
  const seeder = new DataSeeder();
  await seeder.seedDatabase();
}