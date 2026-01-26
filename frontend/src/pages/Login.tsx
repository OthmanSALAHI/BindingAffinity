import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log('🔑 LoginPage: Rendering with isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('🔑 LoginPage: User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    console.log('🔑 LoginPage: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    console.log('🔑 LoginPage: User is authenticated, rendering null');
    return null;
  }

  console.log('🔑 LoginPage: Rendering login form');
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
