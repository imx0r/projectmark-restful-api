import { BaseEntity } from './BaseEntity';
import { ITopic, ITopicRepository } from '../interfaces/ITopic';
import { IVersionable, IHierarchical } from '../interfaces/IEntity';

/**
 * Topic entity with versioning and hierarchical structure
 */
export class Topic extends BaseEntity implements ITopic, IVersionable, IHierarchical {
  public name: string;
  public content: string;
  public version: number;
  public parentTopicId?: string;
  private repository?: ITopicRepository;

  constructor(
    name: string,
    content: string,
    parentTopicId?: string,
    version: number = 1,
    id?: string
  ) {
    super(id);
    this.name = name;
    this.content = content;
    this.parentTopicId = parentTopicId;
    this.version = version;
  }

  /**
   * Set the repository for database operations
   */
  setRepository(repository: ITopicRepository): void {
    this.repository = repository;
  }

  /**
   * Validates the topic
   */
  async validate(): Promise<boolean> {
    const errors = this.getValidationErrors();
    return errors.length === 0;
  }

  /**
   * Gets validation errors
   */
  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 255) {
      errors.push('Name must be less than 255 characters');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (this.version < 1) {
      errors.push('Version must be greater than 0');
    }

    return errors;
  }

  /**
   * Gets the current version
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * Creates a new version of the topic
   */
  createNewVersion(): Topic {
    const newTopic = new Topic(
      this.name,
      this.content,
      this.parentTopicId,
      this.version + 1,
      this.id // Keep the same ID for versioning
    );
    newTopic.setRepository(this.repository!);
    return newTopic;
  }

  /**
   * Updates topic content and increments version
   */
  updateContent(name?: string, content?: string, parentTopicId?: string): Topic {
    const newVersion = this.createNewVersion();
    
    if (name !== undefined) newVersion.name = name;
    if (content !== undefined) newVersion.content = content;
    if (parentTopicId !== undefined) newVersion.parentTopicId = parentTopicId;
    
    newVersion.touch();
    return newVersion;
  }

  /**
   * Gets the parent topic
   */
  async getParent(): Promise<Topic | null> {
    if (!this.parentTopicId || !this.repository) {
      return null;
    }
    return await this.repository.findById(this.parentTopicId) as Topic | null;
  }

  /**
   * Gets all child topics
   */
  async getChildren(): Promise<Topic[]> {
    if (!this.repository) {
      return [];
    }
    return await this.repository.findByParentId(this.id) as Topic[];
  }

  /**
   * Gets all ancestor topics (recursive)
   */
  async getAncestors(): Promise<Topic[]> {
    const ancestors: Topic[] = [];
    let current = await this.getParent();
    
    while (current) {
      ancestors.unshift(current);
      current = await current.getParent();
    }
    
    return ancestors;
  }

  /**
   * Gets all descendant topics (recursive)
   */
  async getDescendants(): Promise<Topic[]> {
    const descendants: Topic[] = [];
    const children = await this.getChildren();
    
    for (const child of children) {
      descendants.push(child);
      const childDescendants = await child.getDescendants();
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  /**
   * Converts topic to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      name: this.name,
      content: this.content,
      version: this.version,
      parentTopicId: this.parentTopicId
    };
  }
}