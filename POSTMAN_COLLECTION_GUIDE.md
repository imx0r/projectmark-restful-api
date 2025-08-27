# Dynamic Knowledge Base API - Postman Collection Guide

This guide explains how to use the Postman collection to test all endpoints of the Dynamic Knowledge Base API.

## 📁 Collection Overview

The Postman collection includes comprehensive testing for:
- **Topics**: CRUD operations, versioning, hierarchy management, search
- **Resources**: Managing external links and documents
- **Users**: User management with role-based permissions
- **Health Check**: API status verification

## 🚀 Getting Started

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `api.postman_collection.json` file
4. The collection will be imported with all endpoints and variables

### 2. Environment Variables

The collection includes pre-configured variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:3000` | API base URL |
| `userId` | `user-1` | Current user ID for authentication |
| `adminUserId` | `admin-1` | Admin user ID for admin operations |
| `topicId` | `topic-1` | Sample topic ID for testing |
| `resourceId` | `resource-1` | Sample resource ID for testing |
| `targetUserId` | `user-2` | Target user for user management |
| `fromTopicId` | `topic-1` | Source topic for path finding |
| `toTopicId` | `topic-2` | Destination topic for path finding |
| `newParentTopicId` | `topic-3` | New parent for moving topics |
| `version` | `1` | Topic version number |
| `searchQuery` | `Node.js` | Search query for topic search |

### 3. Update Variables

Before testing:
1. Ensure your API server is running on `http://localhost:3000`
2. Update variable values as needed for your test scenarios
3. Use real IDs returned from API responses

## 📋 Testing Workflow

### Step 1: Health Check
```
GET /health
```
Verify the API server is running properly.

### Step 2: Create Test Data

#### Create Users (if needed)
```
POST /api/users
```
Create admin and regular users for testing permissions.

#### Create Topics
```
POST /api/topics
```
Create a hierarchy of topics:
1. Create root topic (no parentTopicId)
2. Create child topics with parentTopicId
3. Update variables with returned IDs

#### Create Resources
```
POST /api/resources
```
Associate resources with topics using topicId.

### Step 3: Test Core Functionality

#### Topic Operations
- **Get All Topics**: `GET /api/topics`
- **Get Topic by ID**: `GET /api/topics/{{topicId}}`
- **Update Topic**: `PUT /api/topics/{{topicId}}` (creates new version)
- **Delete Topic**: `DELETE /api/topics/{{topicId}}`

#### Version Control
- **Get All Versions**: `GET /api/topics/{{topicId}}/versions`
- **Get Specific Version**: `GET /api/topics/{{topicId}}/versions/{{version}}`

#### Hierarchy Management
- **Get Topic Tree**: `GET /api/topics/{{topicId}}/tree`
- **Get Root Topics**: `GET /api/topics/root`
- **Move Topic**: `PUT /api/topics/{{topicId}}/move`
- **Find Shortest Path**: `GET /api/topics/path/{{fromTopicId}}/{{toTopicId}}`

#### Search and Statistics
- **Search Topics**: `GET /api/topics/?query={{searchQuery}}`
- **Get Statistics**: `GET /api/topics/statistics`
- **Validate Hierarchy**: `GET /api/topics/validate`

### Step 4: Test Permissions

Test different user roles by changing the `x-user-id` header:
- **Admin**: Full access to all operations
- **Editor**: Can create, read, and update topics/resources
- **Viewer**: Read-only access

## 🔐 Authentication

The API uses header-based authentication:
```
x-user-id: {{userId}}
```

Each request includes this header. Update the `userId` variable to test different user permissions.

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": {}
  }
}
```

## 🧪 Test Scenarios

### Scenario 1: Basic Topic Management
1. Create a root topic
2. Create child topics
3. Update a topic (creates new version)
4. Retrieve topic tree
5. Get topic versions

### Scenario 2: Hierarchy Operations
1. Create multiple levels of topics
2. Move a topic to different parent
3. Find shortest path between topics
4. Validate hierarchy integrity

### Scenario 3: Resource Management
1. Create resources for topics
2. Update resource information
3. Get resources by topic
4. Delete resources

### Scenario 4: Permission Testing
1. Test as Admin user (full access)
2. Test as Editor user (limited access)
3. Test as Viewer user (read-only)
4. Verify permission restrictions

### Scenario 5: Search and Statistics
1. Search topics by name/content
2. Get hierarchy statistics
3. Validate data integrity

## 🐛 Troubleshooting

### Common Issues

1. **404 Not Found**
   - Verify the server is running
   - Check the baseUrl variable
   - Ensure topic/resource IDs exist

2. **403 Forbidden**
   - Check user permissions
   - Verify x-user-id header
   - Ensure user has required role

3. **400 Bad Request**
   - Validate request body format
   - Check required fields
   - Verify data types

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connectivity
   - Check for circular references in hierarchy

### Tips for Effective Testing

1. **Use Real IDs**: Replace placeholder variables with actual IDs from responses
2. **Test Edge Cases**: Try invalid data, missing fields, circular references
3. **Check Permissions**: Test each endpoint with different user roles
4. **Validate Responses**: Verify response structure and data integrity
5. **Test Workflows**: Follow realistic user workflows, not just individual endpoints

## 📝 Notes

- The API uses in-memory storage, so data resets when the server restarts
- Version control creates new versions on updates, preserving history
- Hierarchy validation prevents circular references
- Search is case-insensitive and searches both name and content
- Statistics provide insights into the knowledge base structure

## 🔗 Related Documentation

- [Main README](./README.md) - Complete project documentation
- [API Documentation](./README.md#api-endpoints) - Detailed endpoint specifications
- [Development Guide](./README.md#development) - Setup and development instructions

Happy testing! 🚀