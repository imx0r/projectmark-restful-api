import { Request, Response } from 'express';
import { ResourceService } from '../services/ResourceService';
import { Resource } from '../models/Resource';
import { ValidationError, NotFoundError } from '../types/errors';

/**
 * Controller for Resource CRUD operations
 */
export class ResourceController {
  private resourceService: ResourceService;

  constructor() {
    this.resourceService = new ResourceService();
  }

  /**
   * Creates a new resource
   */
  async createResource(req: Request, res: Response): Promise<void> {
    try {
      const { topicId, url, description, type } = req.body;

      if (!topicId || !url || !description || !type) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'TopicId, url, description, and type are required'
        });
        return;
      }

      const resourceData = {
        topicId: topicId.trim(),
        url: url.trim(),
        description: description.trim(),
        type: type.trim()
      };

      const resource = await this.resourceService.create(resourceData);
      
      res.status(201).json({
        success: true,
        data: resource.toJSON(),
        message: 'Resource created successfully'
      });
    } catch (_error) {
      if (_error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: _error.message
        });
      } else {
        console.error('Error creating resource:', _error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error'
        });
      }
    }
  }

  /**
   * Gets a resource by ID
   */
  async getResourceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resource = await this.resourceService.findById(id);

      if (!resource) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found'
        });
        return;
      }

      res.json({
        success: true,
        data: resource.toJSON()
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve resource'
      });
    }
  }

  /**
   * Gets all resources
   */
  async getAllResources(req: Request, res: Response): Promise<void> {
    try {
      const { topicId, type, search } = req.query;
      let resources: Resource[];

      if (topicId) {
        resources = await this.resourceService.findByTopicId(topicId as string);
      } else if (type) {
        resources = await this.resourceService.findByType(type as string);
      } else if (search) {
        resources = await this.resourceService.searchByDescription(search as string);
      } else {
        resources = await this.resourceService.findAll();
      }

      res.json({
        success: true,
        data: resources.map(resource => resource.toJSON()),
        count: resources.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve resources'
      });
    }
  }

  /**
   * Updates a resource
   */
  async updateResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { url, description, type } = req.body;

      const updateData: Partial<Resource> = {};
      if (url !== undefined) updateData.url = url.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (type !== undefined) updateData.type = type.trim();

      const updatedResource = await this.resourceService.update(id, updateData);
      
      res.json({
        success: true,
        data: updatedResource.toJSON(),
        message: 'Resource updated successfully'
      });
    } catch (_error) {
      if (_error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: _error.message
        });
      } else if (_error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: _error.message
        });
      } else {
        console.error('Error updating resource:', _error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error'
        });
      }
    }
  }

  /**
   * Deletes a resource
   */
  async deleteResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.resourceService.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Resource not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete resource'
      });
    }
  }

  /**
   * Gets resources by topic ID
   */
  async getResourcesByTopic(req: Request, res: Response): Promise<void> {
    try {
      const { topicId } = req.params;
      const resources = await this.resourceService.findByTopicId(topicId);
      
      res.json({
        success: true,
        data: resources.map(resource => resource.toJSON()),
        count: resources.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve resources for topic'
      });
    }
  }

  /**
   * Gets resources by type
   */
  async getResourcesByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const resources = await this.resourceService.findByType(type);
      
      res.json({
        success: true,
        data: resources.map(resource => resource.toJSON()),
        count: resources.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve resources by type'
      });
    }
  }

  /**
   * Searches resources by URL pattern
   */
  async searchByUrlPattern(req: Request, res: Response): Promise<void> {
    try {
      const { pattern } = req.query;

      if (!pattern) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Pattern parameter is required'
        });
        return;
      }

      const resources = await this.resourceService.findByUrlPattern(pattern as string);
      
      res.json({
        success: true,
        data: resources.map(resource => resource.toJSON()),
        count: resources.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search resources by URL pattern'
      });
    }
  }

  /**
   * Validates a resource URL
   */
  async validateUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'URL is required'
        });
        return;
      }

      const isValid = await this.resourceService.validateUrl(url);
      
      res.json({
        success: true,
        data: {
          url,
          isValid
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate URL'
      });
    }
  }

  /**
   * Checks resource accessibility
   */
  async checkAccessibility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isAccessible = await this.resourceService.checkAccessibility(id);
      
      res.json({
        success: true,
        data: {
          resourceId: id,
          isAccessible
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check resource accessibility'
      });
    }
  }

  /**
   * Gets resource statistics
   */
  async getResourceStatistics(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.resourceService.getStatistics();
      const extensionStats = await this.resourceService.getFileExtensionStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          fileExtensions: extensionStats
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve resource statistics'
      });
    }
  }

  /**
   * Gets resources grouped by type
   */
  async getResourcesByTypeGrouped(_req: Request, res: Response): Promise<void> {
    try {
      const groupedResources = await this.resourceService.getResourcesByType();
      
      res.json({
        success: true,
        data: groupedResources
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve grouped resources'
      });
    }
  }

  /**
   * Bulk creates resources
   */
  async bulkCreateResources(req: Request, res: Response): Promise<void> {
    try {
      const { resources } = req.body;

      if (!Array.isArray(resources) || resources.length === 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Resources array is required and must not be empty'
        });
        return;
      }

      const createdResources = await this.resourceService.bulkCreate(resources);
      
      res.status(201).json({
        success: true,
        data: createdResources.map(resource => resource.toJSON()),
        count: createdResources.length,
        message: `${createdResources.length} resources created successfully`
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to bulk create resources'
      });
    }
  }

  /**
   * Exports resources
   */
  async exportResources(_req: Request, res: Response): Promise<void> {
    try {
      const exportData = await this.resourceService.exportResources();
      
      res.json({
        success: true,
        data: exportData,
        count: exportData.length
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to export resources'
      });
    }
  }

  /**
   * Imports resources
   */
  async importResources(req: Request, res: Response): Promise<void> {
    try {
      const { resources } = req.body;

      if (!Array.isArray(resources)) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Resources array is required'
        });
        return;
      }

      const importedResources = await this.resourceService.importResources(resources);
      
      res.status(201).json({
        success: true,
        data: importedResources.map(resource => resource.toJSON()),
        count: importedResources.length,
        message: `${importedResources.length} resources imported successfully`
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to import resources'
      });
    }
  }

  /**
   * Validates all resources
   */
  async validateAllResources(_req: Request, res: Response): Promise<void> {
    try {
      const invalidResources = await this.resourceService.validateAllResources();
      
      res.json({
        success: true,
        data: {
          invalidResources: invalidResources.map(item => ({
            resource: item.resource.toJSON(),
            errors: item.errors
          })),
          count: invalidResources.length,
          isValid: invalidResources.length === 0
        }
      });
    } catch (_error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate resources'
      });
    }
  }
}