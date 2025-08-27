import { BaseEntity } from './BaseEntity';
import { IResource, ResourceType } from '../interfaces/IResource';

/**
 * Resource entity representing external links or documents
 */
export class Resource extends BaseEntity implements IResource {
  public topicId: string;
  public url: string;
  public description: string;
  public type: ResourceType;

  constructor(
    topicId: string,
    url: string,
    description: string,
    type: ResourceType,
    id?: string
  ) {
    super(id);
    this.topicId = topicId;
    this.url = url;
    this.description = description;
    this.type = type;
  }

  /**
   * Validates the resource
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

    if (!this.topicId || this.topicId.trim().length === 0) {
      errors.push('Topic ID is required');
    }

    if (!this.url || this.url.trim().length === 0) {
      errors.push('URL is required');
    }

    if (this.url && !this.isValidUrl(this.url)) {
      errors.push('URL must be a valid URL format');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (this.description && this.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (!Object.values(ResourceType).includes(this.type)) {
      errors.push('Invalid resource type');
    }

    return errors;
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates resource properties
   */
  update(updateData: Partial<Omit<IResource, 'id' | 'createdAt' | 'updatedAt'>>): void {
    if (updateData.topicId !== undefined) this.topicId = updateData.topicId;
    if (updateData.url !== undefined) this.url = updateData.url;
    if (updateData.description !== undefined) this.description = updateData.description;
    if (updateData.type !== undefined) this.type = updateData.type;
    
    this.touch();
  }

  /**
   * Gets the file extension from URL
   */
  getFileExtension(): string | null {
    try {
      const url = new URL(this.url);
      const pathname = url.pathname;
      const lastDot = pathname.lastIndexOf('.');
      
      if (lastDot === -1) return null;
      
      return pathname.substring(lastDot + 1).toLowerCase();
    } catch {
      return null;
    }
  }

  /**
   * Checks if resource is accessible (basic check)
   */
  isAccessible(): boolean {
    return this.isValidUrl(this.url);
  }

  /**
   * Converts resource to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      topicId: this.topicId,
      url: this.url,
      description: this.description,
      type: this.type
    };
  }
}