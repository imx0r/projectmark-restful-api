/**
 * Base interface for all entities in the system
 */
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for entities that support versioning
 */
export interface IVersionable {
  version: number;
  getVersion(): number;
  createNewVersion(): IVersionable;
}

/**
 * Interface for entities that can be hierarchical
 */
export interface IHierarchical {
  parentId?: string;
  getParent(): Promise<IHierarchical | null>;
  getChildren(): Promise<IHierarchical[]>;
  getAncestors(): Promise<IHierarchical[]>;
  getDescendants(): Promise<IHierarchical[]>;
}

/**
 * Interface for entities that can be validated
 */
export interface IValidatable {
  validate(): Promise<boolean>;
  getValidationErrors(): string[];
}