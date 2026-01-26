# 🧬 BioAffinity - AI-Powered Binding Affinity Prediction Platform

## Overview

**BioAffinity** is a bioinformatics web application designed to predict protein-ligand binding affinity using artificial intelligence. The platform provides an intuitive interface for researchers and scientists to analyze molecular interactions, visualize 3D structures, and predict KIBA (Kinase Inhibitor Bioactivity) scores.

## 🎯 Project Purpose

This application serves as a comprehensive tool for:
- **Drug Discovery**: Predict how strongly potential drug molecules bind to target proteins
- **Molecular Analysis**: Visualize and analyze ligand-protein binding complexes in 3D
- **Research Collaboration**: Secure user authentication system for managing research data
- **Bioinformatics Education**: Interactive platform for learning about molecular binding

## ✨ Key Features

### 🔐 Authentication System
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Profile image upload and management
- Protected routes for authenticated users
- Admin panel for user management

### 🧪 Molecular Analysis
- SMILES input for ligand molecules
- Protein sequence input
- AI-powered binding affinity prediction
- KIBA score calculation with confidence metrics
- Real-time prediction status

### 🎨 3D Visualization
- Interactive molecular structure viewer using Three.js
- Real-time 3D rendering of ligand-protein complexes
- Rotate, zoom, and explore molecular structures

### 📊 Dashboard
- Modern, glassmorphism UI design
- Real-time metrics and statistics
- Responsive design for all devices
- API documentation access

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with custom animations
- **3D Graphics**: React Three Fiber + Three.js + Drei
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + TanStack Query
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **CORS**: Enabled for local development

## 📁 Repository Structure

```
BindingAffinity/
│
├── 📄 API_DOCUMENTATION.md       # Complete API endpoint documentation
├── 📄 README.md                  # This file
│
├── 🎨 frontend/                  # React + TypeScript frontend
│   ├── public/                   # Static assets
│   │   ├── favicon.ico
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── auth/            # Authentication components
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   │
│   │   │   ├── dashboard/        # Dashboard-specific components
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── InputPanel.tsx      # SMILES & protein input
│   │   │   │   ├── MetricCards.tsx     # KIBA score display
│   │   │   │   ├── MoleculeViewer.tsx  # 3D visualization
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── UserProfile.tsx
│   │   │   │
│   │   │   ├── ui/              # shadcn/ui components (40+ components)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── GlassCard.tsx       # Custom glassmorphism card
│   │   │   │   ├── ScientificInput.tsx # Scientific notation input
│   │   │   │   └── ... (accordion, alert, dialog, etc.)
│   │   │   │
│   │   │   ├── NavLink.tsx
│   │   │   └── ProtectedRoute.tsx      # Route protection wrapper
│   │   │
│   │   ├── contexts/             # React Context providers
│   │   │   └── AuthContext.tsx   # Authentication state management
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── lib/                  # Utility functions and API client
│   │   │   ├── api-client.ts     # HTTP client configuration
│   │   │   ├── api.ts            # API endpoint functions
│   │   │   └── utils.ts          # Helper functions (cn, etc.)
│   │   │
│   │   ├── pages/                # Route pages
│   │   │   ├── Index.tsx         # Landing page
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   ├── Dashboard.tsx     # Main application dashboard
│   │   │   ├── Admin.tsx         # Admin panel
│   │   │   ├── ApiDocumentation.tsx
│   │   │   ├── SecretDatabase.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── test/                 # Test files
│   │   │   ├── example.test.ts
│   │   │   └── setup.ts
│   │   │
│   │   ├── App.tsx               # Main app component with routes
│   │   ├── App.css
│   │   ├── main.tsx              # Application entry point
│   │   ├── index.css             # Global styles
│   │   └── vite-env.d.ts         # TypeScript declarations
│   │
│   ├── components.json           # shadcn/ui configuration
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── vitest.config.ts          # Test configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── eslint.config.js          # ESLint configuration
│
└── 🖥️ server/                    # Node.js + Express backend
    ├── config/
    │   └── database.js           # SQLite database initialization
    │
    ├── middleware/
    │   ├── auth.js               # JWT authentication middleware
    │   └── upload.js             # Multer file upload configuration
    │
    ├── routes/
    │   ├── auth.js               # Authentication endpoints
    │   └── database.js           # Database management endpoints
    │
    ├── uploads/
    │   └── profiles/             # User profile image storage
    │       └── profile-*.jpg
    │
    ├── database.sqlite           # SQLite database file
    ├── index.js                  # Express server entry point
    ├── package.json              # Backend dependencies
    └── .env                      # Environment variables (not in repo)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BindingAffinity
   ```

2. **Set up the Backend**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

3. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Register a new account or use existing credentials

## 📚 API Documentation

Complete API documentation is available in two places:
1. **File**: `API_DOCUMENTATION.md` in the root directory
2. **Web Interface**: Navigate to `/api-docs` after logging in

### Main API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/upload-profile-image` - Upload profile image
- `DELETE /api/auth/delete-profile-image` - Delete profile image

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎨 UI Components

The project uses **shadcn/ui** with custom styling:
- 40+ pre-built Radix UI components
- Custom glassmorphism design system
- Fully responsive and accessible
- Dark mode support
- Smooth animations with Framer Motion

## 🔒 Security Features

- ✅ JWT-based authentication with 7-day expiry
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Input validation on all endpoints
- ✅ Protected routes (frontend + backend)
- ✅ File upload restrictions (5MB limit, image types only)
- ✅ CORS configuration for security
- ✅ SQL injection prevention

## 🧪 Testing

```bash
cd frontend
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
```

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
```
Production build will be in `frontend/dist/`

### Backend
```bash
cd server
npm start
```

## 🤝 Contributing

This is an educational project for bioinformatics research. Contributions are welcome!

## 📄 License

This project is created for educational and research purposes.

## 👥 Authors

- Developed as part of BIO-INFORMATIQUE studies
- © 2026 BioAffinity AI Platform

## 🆘 Support

For issues or questions:
- Check the `API_DOCUMENTATION.md` file
- Review backend logs: Terminal running `npm run dev` in `server/`
- Review frontend logs: Browser console (F12)

## 🔮 Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] User bio/profile updates
- [ ] Advanced molecular property calculations
- [ ] Export results to PDF/CSV
- [ ] Integration with real AI/ML models for binding affinity prediction
- [ ] Multi-language support
- [ ] Real-time collaboration features

---

**Built with ❤️ for the scientific community**
