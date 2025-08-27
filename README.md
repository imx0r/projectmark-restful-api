# Dynamic Knowledge Base API

A RESTful API for managing interconnected topics and resources with version control, user roles, and permissions. Built with Node.js, TypeScript, and Express using advanced OOP concepts and design patterns.

## 🚀 Features

### Core Functionality
- **Topic Management**: CRUD operations with hierarchical structure and version control
- **Resource Management**: External links and documents associated with topics
- **User Management**: Role-based access control (Admin, Editor, Viewer)
- **Version Control**: Complete topic versioning system with history tracking
- **Recursive Retrieval**: Get topics with all subtopics in tree structure
- **Custom Algorithms**: Shortest path algorithm between topics in hierarchy

### Advanced Features
- **Design Patterns**: Factory, Strategy, and Composite patterns implementation
- **OOP Architecture**: Abstract classes, interfaces, and SOLID principles
- **Error Handling**: Comprehensive error management with custom error types
- **Input Validation**: Request validation and sanitization
- **Testing**: Unit and integration tests with Jest

## 🏗️ Architecture

### Design Patterns Used
- **Factory Pattern**: `EntityFactory` for creating different entity types
- **Strategy Pattern**: `PermissionService` for role-based access control
- **Composite Pattern**: `TopicComposite` for hierarchical topic structures

### Project Structure
```
src/
├── algorithms/          # Custom algorithms (shortest path)
├── controllers/         # Request handlers
├── database/           # In-memory database and repositories
├── interfaces/         # TypeScript interfaces
├── middleware/         # Express middleware (error handling, etc.)
├── models/            # Entity models with OOP design
├── routes/            # API route definitions
├── services/          # Business logic layer
├── tests/             # Unit and integration tests
├── types/             # Custom type definitions
└── utils/             # Utility classes and helpers
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectmark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the production server**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## 🗄️ Database Setup

This project uses an **in-memory database** for simplicity and demonstration purposes. No external database setup is required.

### Database Features
- **In-Memory Storage**: Data persists during application runtime
- **Repository Pattern**: Clean data access layer
- **Automatic Relationships**: Foreign key management
- **Statistics**: Built-in analytics and counting

### Sample Data
The application automatically seeds with sample data on startup:
- 3 Users (Admin, Editor, Viewer)
- 5 Topics with hierarchical relationships
- 6 Resources linked to topics

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all operations
- **Editor**: Can create, read, and update (no delete)
- **Viewer**: Read-only access

### Role-Based Permissions
```typescript
// Permission matrix
Admin:  CREATE | READ | UPDATE | DELETE
Editor: CREATE | READ | UPDATE
Viewer:         READ
```

### API Authentication
Currently uses a simple user ID header for demonstration:
```bash
# Include user ID in requests
curl -H "x-user-id: user-id-here" http://localhost:3000/api/topics
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```bash
GET /health
```

### Topics API

#### Get All Topics
```bash
GET /api/topics
```

#### Get Topic by ID
```bash
GET /api/topics/:id
```

#### Get Topic with Recursive Subtopics
```bash
GET /api/topics/:id/recursive
```

#### Get Topic Version
```bash
GET /api/topics/:id/versions/:version
```

#### Create Topic
```bash
POST /api/topics
Content-Type: application/json

{
  "name": "Topic Name",
  "content": "Topic content",
  "parentTopicId": "parent-id" // optional
}
```

#### Update Topic (Creates New Version)
```bash
PUT /api/topics/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "content": "Updated content"
}
```

#### Delete Topic
```bash
DELETE /api/topics/:id
```

#### Find Shortest Path Between Topics
```bash
GET /api/topics/:fromId/path/:toId
```

### Resources API

#### Get All Resources
```bash
GET /api/resources
```

#### Get Resource by ID
```bash
GET /api/resources/:id
```

#### Create Resource
```bash
POST /api/resources
Content-Type: application/json

{
  "topicId": "topic-id",
  "url": "https://example.com",
  "description": "Resource description",
  "type": "article" // article, video, pdf, etc.
}
```

#### Update Resource
```bash
PUT /api/resources/:id
```

#### Delete Resource
```bash
DELETE /api/resources/:id
```

### Users API

#### Get All Users
```bash
GET /api/users
```

#### Get User by ID
```bash
GET /api/users/:id
```

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "role": "Editor" // Admin, Editor, Viewer
}
```

#### Update User
```bash
PUT /api/users/:id
```

#### Delete User
```bash
DELETE /api/users/:id
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual service and utility testing
- **Integration Tests**: End-to-end API testing
- **Mocking**: Dependency mocking for isolated testing

### Postman Collection

A comprehensive Postman collection is included for manual API testing:

- **File**: `Dynamic_Knowledge_Base_API.postman_collection.json`
- **Guide**: See [POSTMAN_COLLECTION_GUIDE.md](./POSTMAN_COLLECTION_GUIDE.md) for detailed usage instructions
- **Coverage**: All endpoints including CRUD operations, versioning, hierarchy management, and permissions

#### Quick Start with Postman
1. Import the collection file into Postman
2. Ensure the API server is running (`npm start`)
3. Follow the testing workflow in the guide
4. Update variables with real IDs from API responses

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm test             # Run tests
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting (if configured)
- **Jest**: Testing framework with coverage reports

## 🌟 Key Features Demonstration

### 1. Topic Versioning
```bash
# Create a topic
POST /api/topics
{"name": "JavaScript", "content": "Programming language"}

# Update it (creates version 2)
PUT /api/topics/topic-id
{"content": "Dynamic programming language"}

# Get specific version
GET /api/topics/topic-id/versions/1
```

### 2. Hierarchical Topics
```bash
# Create parent topic
POST /api/topics
{"name": "Programming"}

# Create child topic
POST /api/topics
{"name": "JavaScript", "parentTopicId": "parent-id"}

# Get recursive tree
GET /api/topics/parent-id/recursive
```

### 3. Shortest Path Algorithm
```bash
# Find path between two topics
GET /api/topics/topic1-id/path/topic2-id

# Returns: ["topic1", "parent", "topic2"]
```

## 🚀 Production Considerations

### For Production Deployment
1. **Replace In-Memory Database**: Use PostgreSQL, MongoDB, or similar
2. **Add Real Authentication**: JWT tokens, OAuth, or similar
3. **Environment Configuration**: Use environment variables
4. **Logging**: Add structured logging (Winston, etc.)
5. **Rate Limiting**: Implement API rate limiting
6. **CORS**: Configure CORS for frontend integration
7. **Security**: Add helmet, input sanitization, etc.

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

**Built with ❤️ using Node.js, TypeScript, and Express**