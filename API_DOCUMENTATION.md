# BioAffinity API Documentation

## Backend Setup Complete ✅

### Overview
A complete authentication system with SQLite database and local profile image storage.

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: express-validator

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "scientist123",
  "email": "scientist@lab.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "scientist123",
    "email": "scientist@lab.com",
    "profile_image": null
  }
}
```

---

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "scientist@lab.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "scientist123",
    "email": "scientist@lab.com",
    "profile_image": "profile-1234567890.jpg"
  }
}
```

---

#### 3. Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "scientist123",
    "email": "scientist@lab.com",
    "profile_image": "profile-1234567890.jpg",
    "created_at": "2026-01-25 12:00:00"
  }
}
```

---

#### 4. Upload Profile Image
```http
POST /auth/upload-profile-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

profile_image: <file>
```

**Constraints:**
- Max file size: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF
- Field name: `profile_image`

**Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "profile_image": "profile-1234567890.jpg"
}
```

**Access uploaded image:**
```
http://localhost:5000/uploads/profiles/profile-1234567890.jpg
```

---

#### 5. Delete Profile Image
```http
DELETE /auth/delete-profile-image
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Profile image deleted successfully"
}
```

---

## Frontend Integration

### Environment Variables
Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:5000/api
```

### Usage Example

#### Login
```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@email.com', 'password');
      // User is logged in and redirected to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

#### Register
```typescript
import { useAuth } from '@/contexts/AuthContext';

function RegisterComponent() {
  const { register } = useAuth();
  
  const handleRegister = async () => {
    try {
      await register('username', 'user@email.com', 'password');
      // User is registered and redirected to dashboard
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
}
```

#### Upload Profile Image
```typescript
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function ProfileComponent() {
  const { user, updateUser } = useAuth();
  
  const handleUpload = async (file: File) => {
    try {
      const response = await authApi.uploadProfileImage(file);
      const updatedUser = { ...user, profile_image: response.profile_image };
      updateUser(updatedUser);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
}
```

#### Get Profile Image URL
```typescript
import { authApi } from '@/lib/api';

const profileImageUrl = authApi.getProfileImageUrl(user?.profile_image);
// Returns: http://localhost:5000/uploads/profiles/profile-1234567890.jpg
```

#### Protected Routes
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## Running the Application

### Backend
```powershell
cd server
npm install
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (or check terminal output)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## Security Features

✅ **Password Hashing**: bcrypt with salt rounds  
✅ **JWT Authentication**: 7-day token expiry  
✅ **Input Validation**: express-validator  
✅ **File Upload Validation**: Size & type restrictions  
✅ **Protected Routes**: Frontend & backend auth middleware  
✅ **CORS Enabled**: For local development  

---

## File Structure

```
server/
├── config/
│   └── database.js          # SQLite configuration
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── upload.js            # Multer file upload config
├── routes/
│   └── auth.js              # Authentication routes
├── uploads/
│   └── profiles/            # Profile images storage
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── database.sqlite         # SQLite database file
├── index.js                # Main server file
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/
│   │   │   ├── UserMenu.tsx
│   │   │   └── UserProfile.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── lib/
│   │   ├── api-client.ts    # HTTP client
│   │   └── api.ts           # API functions
│   └── App.tsx
└── .env                     # Frontend environment variables
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Server Error

---

## Next Steps

1. ✅ Backend authentication with SQLite
2. ✅ Profile image upload/delete
3. ✅ Frontend API integration
4. ✅ Protected routes
5. ⏳ Add password reset functionality
6. ⏳ Add email verification
7. ⏳ Add user bio/profile updates

---

## Support

For issues or questions, check the console logs:
- Backend: Terminal running `npm run dev`
- Frontend: Browser console (F12)
