import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SecretDatabase() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text mb-8">Secret Database Admin</h1>
        <div className="glass-card p-6">
          <p className="text-muted-foreground">
            This is a restricted area for administrators only.
          </p>
          {/* Add your secret database functionality here */}
        </div>
      </div>
    </div>
  );
}
