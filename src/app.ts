import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { specs as swaggerSpec } from './config/swagger';
import topicRoutes from './routes/topicRoutes';
import resourceRoutes from './routes/resourceRoutes';
import userRoutes from './routes/userRoutes';
import { AppError } from './types/errors';
import { initializeSampleData } from './utils/seedData';

class App {
  public app: Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Logging middleware
    this.app.use(morgan('combined'));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request timeout middleware
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      res.setTimeout(30000, () => {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'Request took too long to process'
        });
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'OK',
        service: 'Dynamic Knowledge Base API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Swagger documentation
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Dynamic Knowledge Base API Documentation'
    }));

    // API routes
    this.app.use('/api/topics', topicRoutes);
    this.app.use('/api/resources', resourceRoutes);
    this.app.use('/api/users', userRoutes);

    // API documentation endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
      res.json({
        message: 'Dynamic Knowledge Base API',
        version: '1.0.0',
        endpoints: {
          topics: '/api/topics',
          resources: '/api/resources',
          users: '/api/users',
          health: '/health'
        },
        documentation: '/docs'
      });
    });

    // 404 handler for undefined routes
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ['/api/topics', '/api/resources', '/api/users', '/health']
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.name,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
      }

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.message
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          error: 'Invalid ID Format',
          message: 'The provided ID is not in a valid format'
        });
      }

      if (error.name === 'SyntaxError' && 'body' in error) {
        return res.status(400).json({
          error: 'Invalid JSON',
          message: 'Request body contains invalid JSON'
        });
      }

      // Default error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
      return;
    });
  }

  public async listen(): Promise<void> {
    // Initialize database with sample data before starting server
    await this.initializeDatabase();
    
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 Dynamic Knowledge Base API is running on port ${this.port}`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`📖 API docs: http://localhost:${this.port}/docs`);
        resolve();
      });
    });
  }

  /**
   * Initialize database with sample data
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await initializeSampleData();
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;