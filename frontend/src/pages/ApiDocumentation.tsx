import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Book, Code, Lock, Upload, Trash2, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ApiDocumentation() {
  const navigate = useNavigate();

  const endpoints = [
    {
      method: "POST",
      path: "/auth/register",
      description: "Register a new user account",
      requiresAuth: false,
      requestBody: {
        username: "scientist123",
        email: "scientist@lab.com",
        password: "secure123"
      },
      response: {
        message: "User registered successfully",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: 1,
          username: "scientist123",
          email: "scientist@lab.com"
        }
      }
    },
    {
      method: "POST",
      path: "/auth/login",
      description: "Login with existing credentials",
      requiresAuth: false,
      requestBody: {
        email: "scientist@lab.com",
        password: "secure123"
      },
      response: {
        message: "Login successful",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: 1,
          username: "scientist123",
          email: "scientist@lab.com"
        }
      }
    },
    {
      method: "GET",
      path: "/auth/me",
      description: "Get current authenticated user information",
      requiresAuth: true,
      response: {
        user: {
          id: 1,
          username: "scientist123",
          email: "scientist@lab.com",
          profile_image: "profile-1234567890.jpg",
          created_at: "2026-01-25 12:00:00"
        }
      }
    },
    {
      method: "POST",
      path: "/auth/upload-profile-image",
      description: "Upload a profile image (max 5MB, JPEG/PNG/GIF)",
      requiresAuth: true,
      contentType: "multipart/form-data",
      requestBody: "profile_image: <file>",
      response: {
        message: "Profile image uploaded successfully",
        profile_image: "profile-1234567890.jpg"
      }
    },
    {
      method: "DELETE",
      path: "/auth/delete-profile-image",
      description: "Delete the current profile image",
      requiresAuth: true,
      response: {
        message: "Profile image deleted successfully"
      }
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-400";
      case "POST": return "text-green-400";
      case "PUT": return "text-yellow-400";
      case "DELETE": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getMethodBg = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/10 border-blue-500/20";
      case "POST": return "bg-green-500/10 border-green-500/20";
      case "PUT": return "bg-yellow-500/10 border-yellow-500/20";
      case "DELETE": return "bg-red-500/10 border-red-500/20";
      default: return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">API Documentation</h1>
                <p className="text-sm text-muted-foreground">Complete guide to BioAffinity APIs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Overview */}
          <GlassCard className="p-6" variant="glow-teal">
            <h2 className="text-xl font-semibold text-foreground mb-4">Overview</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>The BioAffinity API provides RESTful endpoints for user authentication and profile management.</p>
              <div className="flex items-start gap-2 mt-4">
                <Code className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Base URL</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded mt-1 inline-block">
                    http://localhost:5000/api
                  </code>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Authentication */}
          <GlassCard className="p-6" variant="glow-violet">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-semibold text-foreground">Authentication</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Protected endpoints require a JWT token in the Authorization header:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
              <span className="text-muted-foreground">Authorization:</span>{" "}
              <span className="text-primary">Bearer &lt;token&gt;</span>
            </div>
          </GlassCard>

          {/* Endpoints */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Code className="w-6 h-6 text-primary" />
              API Endpoints
            </h2>

            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  {/* Method and Path */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-md font-mono text-sm font-semibold ${getMethodBg(endpoint.method)} ${getMethodColor(endpoint.method)} border`}>
                      {endpoint.method}
                    </span>
                    <code className="text-foreground font-mono text-sm bg-muted/50 px-3 py-1 rounded-md flex-1 min-w-[200px]">
                      {endpoint.path}
                    </code>
                    {endpoint.requiresAuth && (
                      <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                        <Lock className="w-3 h-3" />
                        Protected
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4">{endpoint.description}</p>

                  {/* Content Type */}
                  {endpoint.contentType && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-2">Content-Type</p>
                      <code className="text-sm bg-muted/50 px-3 py-1 rounded block w-fit">
                        {endpoint.contentType}
                      </code>
                    </div>
                  )}

                  {/* Request Body */}
                  {endpoint.requestBody && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-2">Request Body</p>
                      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-primary">
                          {typeof endpoint.requestBody === 'string' 
                            ? endpoint.requestBody 
                            : JSON.stringify(endpoint.requestBody, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}

                  {/* Response */}
                  {endpoint.response && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Response</p>
                      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-green-400">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Error Handling */}
          <GlassCard className="p-6" variant="glow-teal">
            <h2 className="text-xl font-semibold text-foreground mb-4">Error Handling</h2>
            <p className="text-muted-foreground mb-4">
              All API endpoints return consistent error responses:
            </p>
            <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm mb-4">
              <code className="text-red-400">
                {JSON.stringify({ error: "Error message here" }, null, 2)}
              </code>
            </pre>
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">Common HTTP Status Codes:</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li><span className="text-green-400">200</span> - Success</li>
                <li><span className="text-green-400">201</span> - Created</li>
                <li><span className="text-yellow-400">400</span> - Bad Request (validation errors)</li>
                <li><span className="text-yellow-400">401</span> - Unauthorized (invalid/missing token)</li>
                <li><span className="text-yellow-400">404</span> - Not Found</li>
                <li><span className="text-red-400">500</span> - Server Error</li>
              </ul>
            </div>
          </GlassCard>

          {/* Code Example */}
          <GlassCard className="p-6" variant="glow-violet">
            <h2 className="text-xl font-semibold text-foreground mb-4">Usage Example</h2>
            <p className="text-muted-foreground mb-4">
              Example using the authentication context in React:
            </p>
            <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-blue-300">
{`import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@email.com', 'password');
      // User is logged in and redirected
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}`}
              </code>
            </pre>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
