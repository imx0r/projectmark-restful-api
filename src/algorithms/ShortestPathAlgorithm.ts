import { Topic } from '../models/Topic';
import { ITopicRepository } from '../interfaces/ITopic';

/**
 * Node representation for the shortest path algorithm
 */
interface PathNode {
  topic: Topic;
  distance: number;
  previous: PathNode | null;
  visited: boolean;
}

/**
 * Custom implementation of shortest path algorithm for topic hierarchy
 * Uses a modified Dijkstra's algorithm adapted for hierarchical structures
 */
export class ShortestPathAlgorithm {
  private repository: ITopicRepository;

  constructor(repository: ITopicRepository) {
    this.repository = repository;
  }

  /**
   * Finds the shortest path between two topics in the hierarchy
   * Returns an array of topics representing the path from source to target
   */
  async findShortestPath(fromId: string, toId: string): Promise<Topic[]> {
    if (fromId === toId) {
      const topic = await this.repository.findById(fromId);
      return topic ? [topic as Topic] : [];
    }

    const fromTopic = await this.repository.findById(fromId) as Topic;
    const toTopic = await this.repository.findById(toId) as Topic;

    if (!fromTopic || !toTopic) {
      return [];
    }

    // Build the graph of all topics
    const allTopics = await this.repository.findAll() as Topic[];
    const nodeMap = new Map<string, PathNode>();

    // Initialize nodes
    for (const topic of allTopics) {
      nodeMap.set(topic.id, {
        topic,
        distance: topic.id === fromId ? 0 : Infinity,
        previous: null,
        visited: false
      });
    }

    const unvisited = new Set(nodeMap.keys());

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode: PathNode | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const node = nodeMap.get(nodeId)!;
        if (node.distance < minDistance) {
          minDistance = node.distance;
          currentNode = node;
        }
      }

      if (!currentNode || currentNode.distance === Infinity) {
        break; // No more reachable nodes
      }

      // Mark current node as visited
      currentNode.visited = true;
      unvisited.delete(currentNode.topic.id);

      // If we reached the target, reconstruct and return the path
      if (currentNode.topic.id === toId) {
        return this.reconstructPath(currentNode);
      }

      // Update distances to neighbors
      const neighbors = await this.getNeighbors(currentNode.topic);
      for (const neighbor of neighbors) {
        const neighborNode = nodeMap.get(neighbor.id);
        if (neighborNode && !neighborNode.visited) {
          const newDistance = currentNode.distance + this.getEdgeWeight(currentNode.topic, neighbor);
          if (newDistance < neighborNode.distance) {
            neighborNode.distance = newDistance;
            neighborNode.previous = currentNode;
          }
        }
      }
    }

    return []; // No path found
  }

  /**
   * Gets all neighboring topics (parent, children, and siblings)
   */
  private async getNeighbors(topic: Topic): Promise<Topic[]> {
    const neighbors: Topic[] = [];

    // Add parent
    const parent = await topic.getParent();
    if (parent) {
      neighbors.push(parent);
    }

    // Add children
    const children = await topic.getChildren();
    neighbors.push(...children);

    // Add siblings (children of the same parent)
    if (topic.parentTopicId) {
      const siblings = await this.repository.findByParentId(topic.parentTopicId) as Topic[];
      for (const sibling of siblings) {
        if (sibling.id !== topic.id) {
          neighbors.push(sibling);
        }
      }
    }

    return neighbors;
  }

  /**
   * Calculates the weight of an edge between two topics
   * Lower weights for closer relationships
   */
  private getEdgeWeight(from: Topic, to: Topic): number {
    // Parent-child relationship: weight 1
    if (from.parentTopicId === to.id || to.parentTopicId === from.id) {
      return 1;
    }

    // Sibling relationship: weight 2
    if (from.parentTopicId && from.parentTopicId === to.parentTopicId) {
      return 2;
    }

    // Default weight for other relationships
    return 3;
  }

  /**
   * Reconstructs the path from the target node back to the source
   */
  private reconstructPath(targetNode: PathNode): Topic[] {
    const path: Topic[] = [];
    let current: PathNode | null = targetNode;

    while (current) {
      path.unshift(current.topic);
      current = current.previous;
    }

    return path;
  }

  /**
   * Finds all possible paths between two topics (up to a maximum depth)
   */
  async findAllPaths(fromId: string, toId: string, maxDepth: number = 10): Promise<Topic[][]> {
    if (fromId === toId) {
      const topic = await this.repository.findById(fromId);
      return topic ? [[topic as Topic]] : [];
    }

    const fromTopic = await this.repository.findById(fromId) as Topic | null;
    if (!fromTopic) {
      return [];
    }

    const allPaths: Topic[][] = [];
    const visited = new Set<string>();

    await this.dfsAllPaths(fromTopic, toId, [fromTopic], visited, allPaths, maxDepth);

    // Sort paths by length (shortest first)
    return allPaths.sort((a, b) => a.length - b.length);
  }

  /**
   * Depth-first search to find all paths
   */
  private async dfsAllPaths(
    current: Topic,
    targetId: string,
    currentPath: Topic[],
    visited: Set<string>,
    allPaths: Topic[][],
    maxDepth: number
  ): Promise<void> {
    if (currentPath.length > maxDepth) {
      return;
    }

    if (current.id === targetId) {
      allPaths.push([...currentPath]);
      return;
    }

    visited.add(current.id);

    const neighbors = await this.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        currentPath.push(neighbor);
        await this.dfsAllPaths(neighbor, targetId, currentPath, visited, allPaths, maxDepth);
        currentPath.pop();
      }
    }

    visited.delete(current.id);
  }

  /**
   * Calculates the distance between two topics
   */
  async calculateDistance(fromId: string, toId: string): Promise<number> {
    const path = await this.findShortestPath(fromId, toId);
    return path.length > 0 ? path.length - 1 : -1; // -1 indicates no path found
  }

  /**
   * Finds the closest topics to a given topic within a certain distance
   */
  async findClosestTopics(topicId: string, maxDistance: number = 3): Promise<{ topic: Topic; distance: number }[]> {
    const sourceTopic = await this.repository.findById(topicId) as Topic | null;
    if (!sourceTopic) {
      return [];
    }

    const allTopics = await this.repository.findAll() as Topic[];
    const results: { topic: Topic; distance: number }[] = [];

    for (const topic of allTopics) {
      if (topic.id !== topicId) {
        const distance = await this.calculateDistance(topicId, topic.id);
        if (distance >= 0 && distance <= maxDistance) {
          results.push({ topic, distance });
        }
      }
    }

    // Sort by distance
    return results.sort((a, b) => a.distance - b.distance);
  }
}