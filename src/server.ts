import dotenv from 'dotenv';
import App from './app';

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = parseInt(process.env.PORT || '3000', 10);

// Create and start the application
const app = new App(PORT);

// Start the application
app.listen().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
export default app;