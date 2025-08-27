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
| `userId` | `user-123` | Current user ID for authentication |
| `adminUserId` | `admin-456` | Admin user ID for admin operations |
| `topicId` | `topic-789` | Sample topic ID for testing |
| `resourceId` | `resource-101` | Sample resource ID for testing |
| `targetUserId` | `target-user-112` | Target user for user management |
| `searchQuery` | `JavaScript` | Search query for topic search |
| `parentTopicId` | `parent-topic-123` | Parent topic ID for hierarchy |
| `sourceTopicId` | `source-topic-456` | Source topic for path finding |
| `targetTopicId` | `target-topic-789` | Destination topic for path finding |
| `resourceType` | `article` | Type of resource for filtering |
| `urlPattern` | `example.com` | URL pattern for resource search |
| `validateUrl` | `https://example.com` | URL to validate |
| `exportFormat` | `json` | Export format (json, csv) |
| `userRole` | `Editor` | User role for filtering |
| `userEmail` | `john.doe@example.com` | User email address |
| `checkEmail` | `newuser@example.com` | Email to check for availability |

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
- **Find Shortest Path**: `GET /api/topics/path/{{sourceTopicId}}/{{targetTopicId}}`

#### Search and Statistics
- **Search Topics**: `GET /api/topics?query={{searchQuery}}`
- **Get Statistics**: `GET /api/topics/statistics`
- **Validate Hierarchy**: `GET /api/topics/validate`

#### Resource Operations
- **Get All Resources**: `GET /api/resources`
- **Get Resource by ID**: `GET /api/resources/{{resourceId}}`
- **Update Resource**: `PUT /api/resources/{{resourceId}}`
- **Delete Resource**: `DELETE /api/resources/{{resourceId}}`
- **Get Resources by Topic**: `GET /api/resources/topic/{{topicId}}`
- **Get Resources by Type**: `GET /api/resources/type/{{resourceType}}`
- **Search Resources by URL**: `GET /api/resources/search/url?pattern={{urlPattern}}`
- **Get Resource Statistics**: `GET /api/resources/statistics`
- **Get Resources Grouped by Type**: `GET /api/resources/grouped`
- **Validate All Resources**: `GET /api/resources/validate`
- **Validate URL**: `GET /api/resources/validate-url/{{validateUrl}}`
- **Check Resource Accessibility**: `GET /api/resources/{{resourceId}}/accessibility`
- **Bulk Create Resources**: `POST /api/resources/bulk`
- **Export Resources**: `GET /api/resources/export?format={{exportFormat}}`
- **Import Resources**: `POST /api/resources/import`

#### User Operations
- **Get All Users**: `GET /api/users`
- **Get User by ID**: `GET /api/users/{{userId}}`
- **Update User**: `PUT /api/users/{{targetUserId}}`
- **Delete User**: `DELETE /api/users/{{targetUserId}}`
- **Get User Statistics**: `GET /api/users/statistics`
- **Authenticate User**: `POST /api/users/authenticate`
- **Get Users by Role**: `GET /api/users/role/{{userRole}}`
- **Change User Role**: `POST /api/users/{{targetUserId}}/role`
- **Get User by Email**: `GET /api/users/email/{{userEmail}}`
- **Check Email Availability**: `GET /api/users/check-email/{{checkEmail}}`
- **Check User Permissions**: `GET /api/users/{{targetUserId}}/permissions`
- **Get User Profile**: `GET /api/users/{{targetUserId}}/profile`
- **Deactivate User**: `POST /api/users/{{targetUserId}}/deactivate`
- **Bulk Create Users**: `POST /api/users/bulk`
- **Export Users**: `GET /api/users/export?format={{exportFormat}}`
- **Import Users**: `POST /api/users/import`

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
6. Search topics by query
7. Get topic statistics

### Scenario 2: Hierarchy Operations
1. Create multiple levels of topics
2. Move a topic to different parent
3. Find shortest path between topics
4. Validate hierarchy integrity
5. Get root topics
6. Test circular reference prevention

### Scenario 3: Resource Management
1. Create resources for topics
2. Update resource information
3. Get resources by topic
4. Get resources by type
5. Search resources by URL pattern
6. Validate resource URLs
7. Check resource accessibility
8. Get resource statistics
9. Export/import resources
10. Bulk create resources
11. Delete resources

### Scenario 4: User Management
1. Create users with different roles
2. Update user information
3. Get users by role
4. Change user roles (Admin only)
5. Get user by email
6. Check email availability
7. Authenticate users
8. Check user permissions
9. Get user profiles
10. Deactivate users
11. Export/import users
12. Bulk create users
13. Get user statistics

### Scenario 5: Permission Testing
1. Test as Admin user (full access)
2. Test as Editor user (limited access)
3. Test as Viewer user (read-only)
4. Verify permission restrictions
5. Test role-based endpoint access
6. Test user profile access controls

### Scenario 6: Advanced Operations
1. Bulk operations (topics, resources, users)
2. Data validation and integrity checks
3. Export/import functionality
4. URL validation and accessibility
5. Statistics and analytics
6. Search and filtering capabilities

### Scenario 7: Error Handling
1. Test invalid data inputs
2. Test missing required fields
3. Test permission violations
4. Test non-existent resource access
5. Test circular reference creation
6. Test duplicate email registration

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
- The collection covers all API functionality
- Bulk operations support creating multiple entities at once
- Export/import functionality supports JSON and CSV formats
- URL validation checks both format and accessibility
- Role-based permissions are enforced across all endpoints
- Authentication uses the `x-user-id` header for simplicity
- All endpoints include comprehensive error handling and validation

## 🔗 Related Documentation

- [Main README](./README.md) - Complete project documentation
- [API Documentation](./README.md#-api-endpoints) - Detailed endpoint specifications
- [Development Guide](./README.md#-development) - Setup and development instructions

Happy testing! 🚀