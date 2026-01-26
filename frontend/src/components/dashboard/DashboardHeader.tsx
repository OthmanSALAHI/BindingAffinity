import { motion } from "framer-motion";
import { Activity, Beaker, Database, Clock, Book, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { path: "/api-docs", label: "API Docs", icon: <Book className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05, rotate: 5 }}
              onClick={() => navigate("/dashboard")}
            >
              <svg className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text">BioAffinity</h1>
              <p className="text-xs text-muted-foreground">Drug-Target Prediction</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Status Indicators */}
          <div className="hidden lg:flex items-center gap-6">
            <StatusItem icon={<Activity className="w-4 h-4" />} label="System" status="Online" color="text-primary" />
            <StatusItem icon={<Beaker className="w-4 h-4" />} label="Models" status="3 Active" color="text-secondary" />
            <StatusItem icon={<Database className="w-4 h-4" />} label="Database" status="Connected" color="text-primary" />
            <StatusItem icon={<Clock className="w-4 h-4" />} label="Last Sync" status="2m ago" color="text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusItem({ icon, label, status, color }: { icon: React.ReactNode; label: string; status: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${color}`}>{status}</p>
      </div>
    </div>
  );
}
