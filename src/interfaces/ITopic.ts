import { IEntity, IVersionable, IHierarchical, IValidatable } from './IEntity';

/**
 * Interface for Topic entity
 */
export interface ITopic extends IEntity, IVersionable, IHierarchical, IValidatable {
  name: string;
  content: string;
  parentTopicId?: string;
}

/**
 * Interface for Topic operations
 */
export interface ITopicService {
  create(topicData: Partial<ITopic>): Promise<ITopic>;
  findById(id: string, version?: number): Promise<ITopic | null>;
  findAll(): Promise<ITopic[]>;
  update(id: string, updateData: Partial<ITopic>): Promise<ITopic>;
  delete(id: string): Promise<boolean>;
  getVersions(id: string): Promise<ITopic[]>;
  getTopicTree(id: string): Promise<ITopicTree>;
  findShortestPath(fromId: string, toId: string): Promise<ITopic[]>;
}

/**
 * Interface for Topic tree structure
 */
export interface ITopicTree {
  topic: ITopic;
  children: ITopicTree[];
}

/**
 * Interface for Topic repository
 */
export interface ITopicRepository {
  save(topic: ITopic): Promise<ITopic>;
  findById(id: string, version?: number): Promise<ITopic | null>;
  findAll(): Promise<ITopic[]>;
  findByParentId(parentId: string): Promise<ITopic[]>;
  findVersions(id: string): Promise<ITopic[]>;
  delete(id: string): Promise<boolean>;
}