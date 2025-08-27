import { IEntity, IValidatable } from '../interfaces/IEntity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract base class for all entities
 */
export abstract class BaseEntity implements IEntity, IValidatable {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id?: string) {
    this.id = id || uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Updates the updatedAt timestamp
   */
  protected touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Abstract method for validation - must be implemented by subclasses
   */
  abstract validate(): Promise<boolean>;

  /**
   * Abstract method for getting validation errors - must be implemented by subclasses
   */
  abstract getValidationErrors(): string[];

  /**
   * Converts entity to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates a shallow copy of the entity
   */
  clone(): this {
    const cloned = Object.create(Object.getPrototypeOf(this));
    return Object.assign(cloned, this);
  }
}