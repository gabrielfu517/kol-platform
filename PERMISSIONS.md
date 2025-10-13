# Role-Based Access Control (RBAC)

## User Roles

The KOL Platform has two user roles with different permissions:

### 1. **Client Role** (Business Owner)
- **Purpose**: For companies/brands looking for influencers for their campaigns
- **Can Do**:
  - ✅ Browse and search KOLs
  - ✅ View KOL details and metrics
  - ✅ Create campaigns
  - ✅ Edit their own campaigns
  - ✅ Delete their own campaigns
  - ✅ Assign KOLs to their campaigns
  
- **Cannot Do**:
  - ❌ Create new KOLs
  - ❌ Edit KOL profiles
  - ❌ Delete KOLs

### 2. **Admin Role** (Platform Administrator)
- **Purpose**: For platform managers who maintain the KOL database
- **Can Do**:
  - ✅ Everything a Client can do, PLUS:
  - ✅ Create new KOLs
  - ✅ Edit KOL profiles
  - ✅ Delete KOLs
  - ✅ Full platform management

## Test Accounts

### Client Account (Business Owner)
```
Email: demo@kolplatform.com
Password: demo123
Role: client
```

### Admin Account (Platform Manager)
```
Email: admin@kolplatform.com
Password: admin123
Role: admin
```

## UI Changes for Clients

When logged in as a **client**, the following UI elements are hidden:

1. **KOLs Page**:
   - "Add New KOL" button is hidden
   - "Edit" button on KOL cards is hidden

2. **KOL Detail Page**:
   - "Edit Profile" button is hidden
   - "Delete KOL" button is hidden

3. **Dashboard**:
   - Shows "Getting Started" instead of "Platform Management"
   - No admin badge displayed

## UI Changes for Admins

When logged in as an **admin**, all features are visible:

1. **KOLs Page**:
   - "Add New KOL" button is visible
   - "Edit" button on KOL cards is visible

2. **KOL Detail Page**:
   - "Edit Profile" button is visible
   - "Delete KOL" button is visible

3. **Dashboard**:
   - Shows "Platform Management"
   - Gold admin badge is displayed

## Backend Protection

The backend API enforces role-based access control:

### Protected Endpoints (Admin Only):

**POST /api/kols**
- Creates a new KOL
- Returns 403 Forbidden if user is not admin

**PUT /api/kols/:id**
- Updates KOL profile
- Returns 403 Forbidden if user is not admin

**DELETE /api/kols/:id**
- Deletes a KOL
- Returns 403 Forbidden if user is not admin

### Public Endpoints (All Authenticated Users):

**GET /api/kols**
- Browse and filter KOLs
- Available to all logged-in users

**GET /api/kols/:id**
- View KOL details
- Available to all logged-in users

**POST /api/campaigns**
**PUT /api/campaigns/:id**
**DELETE /api/campaigns/:id**
- Campaign management
- Users can only manage their own campaigns

## Security Features

1. **JWT Token Authentication**: All API requests require valid JWT token
2. **Role Verification**: Backend checks user role before allowing admin operations
3. **User Isolation**: Users can only see/manage their own campaigns
4. **Frontend Guards**: UI elements are hidden based on user role (UX improvement)
5. **Backend Enforcement**: Even if someone tries to access admin endpoints directly, the API will reject them

## Testing Permissions

### As a Client (demo@kolplatform.com):
1. Login with demo credentials
2. Go to KOLs page - you should NOT see "Add New KOL" button
3. Click on any KOL card - you should NOT see "Edit" button
4. View KOL details - you should NOT see "Edit Profile" or "Delete" buttons
5. You CAN create and manage campaigns

### As an Admin (admin@kolplatform.com):
1. Login with admin credentials
2. Go to KOLs page - you SHOULD see "Add New KOL" button
3. Click on any KOL card - you SHOULD see "Edit" button
4. View KOL details - you SHOULD see "Edit Profile" and "Delete" buttons
5. You CAN create, edit, and delete KOLs
6. You CAN create and manage campaigns

## Error Messages

When a client tries to access admin-only endpoints:

```json
{
  "error": "Only admins can create KOLs"
}
```

```json
{
  "error": "Only admins can update KOLs"
}
```

```json
{
  "error": "Only admins can delete KOLs"
}
```

HTTP Status Code: **403 Forbidden**

## Best Practices

1. **Always use the appropriate role**: Use client accounts for business operations, admin accounts for platform management
2. **Test with both roles**: When adding new features, test with both client and admin accounts
3. **Follow the principle of least privilege**: Give users only the permissions they need
4. **Keep admin credentials secure**: Admin accounts have full platform access

## Future Enhancements

Potential role improvements for future versions:

- **Super Admin**: Can manage other admin accounts
- **KOL Role**: For influencers to manage their own profiles
- **Agency Role**: For marketing agencies managing multiple campaigns
- **Viewer Role**: Read-only access for stakeholders
- **Fine-grained permissions**: Separate permissions for create/edit/delete

