import { IEntity, IValidatable } from './IEntity';

/**
 * Enum for resource types
 */
export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf',
  IMAGE = 'image',
  LINK = 'link',
  DOCUMENT = 'document'
}

/**
 * Interface for Resource entity
 */
export interface IResource extends IEntity, IValidatable {
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
}

/**
 * Interface for Resource operations
 */
export interface IResourceService {
  create(resourceData: Partial<IResource>): Promise<IResource>;
  findById(id: string): Promise<IResource | null>;
  findAll(): Promise<IResource[]>;
  findByTopicId(topicId: string): Promise<IResource[]>;
  update(id: string, updateData: Partial<IResource>): Promise<IResource>;
  delete(id: string): Promise<boolean>;
}

/**
 * Interface for Resource repository
 */
export interface IResourceRepository {
  save(resource: IResource): Promise<IResource>;
  findById(id: string): Promise<IResource | null>;
  findAll(): Promise<IResource[]>;
  findByTopicId(topicId: string): Promise<IResource[]>;
  delete(id: string): Promise<boolean>;
}