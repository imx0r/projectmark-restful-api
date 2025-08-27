import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dynamic Knowledge Base API',
      version: '1.0.0',
      description: 'RESTful API for a Dynamic Knowledge Base System',
      contact: {
        name: 'API Support',
        email: 'support@test.local'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Dev Server (local)'
      }
    ],
    components: {
      schemas: {
        Topic: {
          type: 'object',
          required: ['name', 'content'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the topic',
              example: 'topic_123'
            },
            name: {
              type: 'string',
              description: 'Name of the topic',
              example: 'JavaScript Fundamentals'
            },
            content: {
              type: 'string',
              description: 'Content of the topic',
              example: 'JavaScript is a programming language...'
            },
            version: {
              type: 'number',
              description: 'Version number of the topic',
              example: 1
            },
            parentTopicId: {
              type: 'string',
              nullable: true,
              description: 'ID of the parent topic for hierarchical structure',
              example: 'topic_456'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Resource: {
          type: 'object',
          required: ['topicId', 'url', 'description', 'type'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the resource',
              example: 'resource_123'
            },
            topicId: {
              type: 'string',
              description: 'ID of the associated topic',
              example: 'topic_123'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL of the external resource',
              example: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
            },
            description: {
              type: 'string',
              description: 'Description of the resource',
              example: 'MDN JavaScript Documentation'
            },
            type: {
              type: 'string',
              enum: ['video', 'article', 'pdf', 'website', 'book'],
              description: 'Type of the resource',
              example: 'article'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: 'user_123'
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Editor', 'Viewer'],
              description: 'Role of the user in the system',
              example: 'Editor'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              description: 'Response data'
            },
            count: {
              type: 'number',
              description: 'Number of items returned (for list endpoints)'
            },
            message: {
              type: 'string',
              description: 'Response message'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error type',
              example: 'ValidationError'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid input data'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        TopicHierarchy: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'topic_123'
            },
            name: {
              type: 'string',
              example: 'Programming'
            },
            content: {
              type: 'string',
              example: 'Programming concepts and languages'
            },
            version: {
              type: 'number',
              example: 1
            },
            parentTopicId: {
              type: 'string',
              nullable: true,
              example: null
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TopicHierarchy'
              },
              description: 'Child topics in hierarchical structure'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ShortestPath: {
          type: 'object',
          properties: {
            path: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of topic IDs representing the shortest path',
              example: ['topic_1', 'topic_2', 'topic_3']
            },
            distance: {
              type: 'number',
              description: 'Length of the shortest path',
              example: 2
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'NotFound',
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'ValidationError',
                message: 'Invalid input data',
                details: {
                  field: 'name',
                  message: 'Name is required'
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'InternalServerError',
                message: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Topics',
        description: 'Topic management with version control and hierarchical structure'
      },
      {
        name: 'Resources',
        description: 'Resource management for external links and documents'
      },
      {
        name: 'Users',
        description: 'User management with role-based access control'
      },
      {
        name: 'System',
        description: 'System health and information endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };