import { Topic } from '../models/Topic';
import { ITopicTree } from '../interfaces/ITopic';

/**
 * Abstract component for the Composite pattern
 */
export abstract class TopicComponent {
  protected topic: Topic;

  constructor(topic: Topic) {
    this.topic = topic;
  }

  abstract add(component: TopicComponent): void;
  abstract remove(component: TopicComponent): void;
  abstract getChild(index: number): TopicComponent | null;
  abstract getChildren(): TopicComponent[];
  abstract getSize(): number;
  abstract toTree(): ITopicTree;
  abstract findById(id: string): TopicComponent | null;
  abstract getAllTopics(): Topic[];

  getTopic(): Topic {
    return this.topic;
  }

  getId(): string {
    return this.topic.id;
  }

  getName(): string {
    return this.topic.name;
  }
}

/**
 * Leaf component - represents a topic without children
 */
export class TopicLeaf extends TopicComponent {
  constructor(topic: Topic) {
    super(topic);
  }

  add(_component: TopicComponent): void {
    throw new Error('Cannot add to leaf topic');
  }

  remove(_component: TopicComponent): void {
    throw new Error('Cannot remove from leaf topic');
  }

  getChild(_index: number): TopicComponent | null {
    return null;
  }

  getChildren(): TopicComponent[] {
    return [];
  }

  getSize(): number {
    return 1;
  }

  toTree(): ITopicTree {
    return {
      topic: this.topic,
      children: []
    };
  }

  findById(id: string): TopicComponent | null {
    return this.topic.id === id ? this : null;
  }

  getAllTopics(): Topic[] {
    return [this.topic];
  }
}

/**
 * Composite component - represents a topic with children
 */
export class TopicComposite extends TopicComponent {
  private children: TopicComponent[] = [];

  constructor(topic: Topic) {
    super(topic);
  }

  add(component: TopicComponent): void {
    // Ensure the child's parent ID matches this topic's ID
    const childTopic = component.getTopic();
    if (childTopic.parentTopicId !== this.topic.id) {
      throw new Error(`Child topic's parentTopicId (${childTopic.parentTopicId}) does not match parent ID (${this.topic.id})`);
    }
    
    this.children.push(component);
  }

  remove(component: TopicComponent): void {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): TopicComponent | null {
    return this.children[index] || null;
  }

  getChildren(): TopicComponent[] {
    return [...this.children];
  }

  getSize(): number {
    let size = 1; // Count this topic
    for (const child of this.children) {
      size += child.getSize();
    }
    return size;
  }

  toTree(): ITopicTree {
    return {
      topic: this.topic,
      children: this.children.map(child => child.toTree())
    };
  }

  findById(id: string): TopicComponent | null {
    if (this.topic.id === id) {
      return this;
    }

    for (const child of this.children) {
      const found = child.findById(id);
      if (found) {
        return found;
      }
    }

    return null;
  }

  getAllTopics(): Topic[] {
    const topics = [this.topic];
    for (const child of this.children) {
      topics.push(...child.getAllTopics());
    }
    return topics;
  }

  /**
   * Gets the depth of the topic tree
   */
  getDepth(): number {
    if (this.children.length === 0) {
      return 1;
    }

    let maxChildDepth = 0;
    for (const child of this.children) {
      const childDepth = child instanceof TopicComposite ? child.getDepth() : 1;
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    return 1 + maxChildDepth;
  }

  /**
   * Sorts children by name
   */
  sortChildren(): void {
    this.children.sort((a, b) => a.getName().localeCompare(b.getName()));
    
    // Recursively sort children of composite nodes
    for (const child of this.children) {
      if (child instanceof TopicComposite) {
        child.sortChildren();
      }
    }
  }

  /**
   * Finds all topics at a specific depth level
   */
  getTopicsAtDepth(targetDepth: number, currentDepth: number = 1): Topic[] {
    if (currentDepth === targetDepth) {
      return [this.topic];
    }

    const topics: Topic[] = [];
    for (const child of this.children) {
      if (child instanceof TopicComposite) {
        topics.push(...child.getTopicsAtDepth(targetDepth, currentDepth + 1));
      } else if (currentDepth + 1 === targetDepth) {
        topics.push(child.getTopic());
      }
    }

    return topics;
  }
}

/**
 * Factory for creating topic components
 */
export class TopicComponentFactory {
  /**
   * Creates a topic component (leaf or composite) based on whether it has children
   */
  static create(topic: Topic, hasChildren: boolean = false): TopicComponent {
    return hasChildren ? new TopicComposite(topic) : new TopicLeaf(topic);
  }

  /**
   * Builds a topic tree from a flat array of topics
   */
  static buildTree(topics: Topic[]): TopicComponent[] {
    const topicMap = new Map<string, TopicComponent>();
    const roots: TopicComponent[] = [];

    // First pass: create all components
    for (const topic of topics) {
      const hasChildren = topics.some(t => t.parentTopicId === topic.id);
      const component = this.create(topic, hasChildren);
      topicMap.set(topic.id, component);
    }

    // Second pass: build the hierarchy
    for (const topic of topics) {
      const component = topicMap.get(topic.id)!;
      
      if (topic.parentTopicId) {
        const parent = topicMap.get(topic.parentTopicId);
        if (parent && parent instanceof TopicComposite) {
          parent.add(component);
        }
      } else {
        roots.push(component);
      }
    }

    return roots;
  }
}