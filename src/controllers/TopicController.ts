import { Request, Response } from 'express';
import { TopicService } from '../services/TopicService';
import { Topic } from '../models/Topic';
import { ValidationError, NotFoundError, ConflictError } from '../types/errors';

/**
 * Controller for Topic CRUD operations
 */
export class TopicController {
  private topicService: TopicService;

  constructor() {
    this.topicService = new TopicService();
  }

  /**
   * Creates a new topic
   */
  async createTopic(req: Request, res: Response): Promise<void> {
    try {
      const { name, content, parentTopicId } = req.body;

      if (!name || !content) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Name and content are required'
        });
        return;
      }

      const topicData = {
        name: name.trim(),
        content: content.trim(),
        parentTopicId: parentTopicId || undefined
      };

      const topic = await this.topicService.create(topicData);
      
      res.status(201).json({
        success: true,
        data: topic.toJSON(),
        message: 'Topic created successfully'
      });
    } catch (_error) {
      if (_error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: _error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create topic'
        });
      }
    }
  }

  /**
   * Gets a topic by ID
   */
  async getTopicById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { version } = req.query;

      const versionNumber = version ? parseInt(version as string) : undefined;
      const topic = await this.topicService.findById(id, versionNumber);

      if (!topic) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Topic not found'
        });
        return;
      }

      res.json({
        success: true,
        data: topic.toJSON()
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve topic'
      });
    }
  }

  /**
   * Gets all topics
   */
  async getAllTopics(req: Request, res: Response): Promise<void> {
    try {
      const { query, parentId } = req.query;
      let topics: Topic[];

      if (query) {
        topics = await this.topicService.searchTopics(query as string);
      } else if (parentId) {
        topics = await this.topicService.getChildren(parentId as string);
      } else {
        topics = await this.topicService.findAll();
      }

      res.json({
        success: true,
        data: topics.map((topic: Topic) => topic.toJSON()),
        count: topics.length
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve topics'
      });
    }
  }

  /**
   * Updates a topic (creates new version)
   */
  async updateTopic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, content, parentTopicId } = req.body;

      const updateData: Partial<Topic> = {};
      if (name !== undefined) updateData.name = name.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (parentTopicId !== undefined) updateData.parentTopicId = parentTopicId;

      const updatedTopic = await this.topicService.update(id, updateData);
      
      res.json({
        success: true,
        data: updatedTopic.toJSON(),
        message: 'Topic updated successfully (new version created)'
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: _error.message
        });
      } else if (_error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: _error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to update topic'
        });
      }
    }
  }

  /**
   * Deletes a topic
   */
  async deleteTopic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.topicService.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Topic not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Topic deleted successfully'
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete topic'
      });
    }
  }

  /**
   * Gets all versions of a topic
   */
  async getTopicVersions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const versions = await this.topicService.getVersions(id);

      res.json({
        success: true,
        data: versions.map(topic => topic.toJSON()),
        count: versions.length
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve topic versions'
      });
    }
  }

  /**
   * Gets a specific version of a topic
   */
  async getTopicVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id, version } = req.params;
      const versionNumber = parseInt(version, 10);

      if (isNaN(versionNumber) || versionNumber < 1) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Version must be a positive integer'
        });
        return;
      }

      const topic = await this.topicService.getVersion(id, versionNumber);

      if (!topic) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Topic version ${versionNumber} not found for topic ${id}`
        });
        return;
      }

      res.json({
        success: true,
        data: topic.toJSON()
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve topic version'
      });
    }
  }

  /**
   * Gets topic tree structure
   */
  async getTopicTree(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tree = await this.topicService.getTopicTree(id);

      res.json({
        success: true,
        data: tree
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: _error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to retrieve topic tree'
        });
      }
    }
  }

  /**
   * Finds shortest path between two topics
   */
  async findShortestPath(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Both from and to parameters are required'
        });
        return;
      }

      const path = await this.topicService.findShortestPath(from as string, to as string);
      
      res.json({
        success: true,
        data: path.map(topic => topic.toJSON()),
        length: path.length
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to find shortest path'
      });
    }
  }

  /**
   * Moves a topic to a new parent
   */
  async moveTopic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newParentId } = req.body;

      const movedTopic = await this.topicService.moveTopic(id, newParentId || null);
      
      res.json({
        success: true,
        data: movedTopic.toJSON(),
        message: 'Topic moved successfully'
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: _error.message
        });
      } else if (_error instanceof ConflictError) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: _error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to move topic'
        });
      }
    }
  }

  /**
   * Gets root topics
   */
  async getRootTopics(_req: Request, res: Response): Promise<void> {
    try {
      const rootTopics = await this.topicService.getRootTopics();
      
      res.json({
        success: true,
        data: rootTopics.map(topic => topic.toJSON()),
        count: rootTopics.length
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve root topics'
      });
    }
  }

  /**
   * Gets topic statistics
   */
  async getTopicStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.topicService.getStatistics();
      const maxDepth = await this.topicService.getMaxDepth();
      
      res.json({
        success: true,
        data: {
          ...stats,
          maxDepth
        }
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve topic statistics'
      });
    }
  }

  /**
   * Validates topic hierarchy
   */
  async validateHierarchy(_req: Request, res: Response): Promise<void> {
    try {
      const validation = await this.topicService.validateHierarchy();
      
      res.json({
        success: true,
        data: validation
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to validate hierarchy'
      });
    }
  }

}