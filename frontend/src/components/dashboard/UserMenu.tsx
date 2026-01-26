import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ChevronDown, Shield, Book } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  onOpenProfile: () => void;
}

export function UserMenu({ onOpenProfile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const profileImageUrl = user?.profile_image 
    ? authApi.getProfileImageUrl(user.profile_image)
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-primary p-[2px]">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{user?.username || "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.bio || "Researcher"}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden"
            style={{
              zIndex: 9999,
              background: "linear-gradient(135deg, hsl(222 40% 12% / 0.98) 0%, hsl(222 47% 8% / 0.98) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid hsl(222 30% 22% / 0.5)",
              boxShadow: "0 8px 32px 0 rgba(0, 212, 170, 0.1)"
            }}
          >
            <div className="p-2">
              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                whileHover={{ x: 4 }}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Edit Profile</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/api-docs');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                whileHover={{ x: 4 }}
              >
                <Book className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">API Documentation</span>
              </motion.button>

              {isAdmin && (
                <>
                  <div className="my-2 border-t border-border/50" />
                  <motion.button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm text-primary">Admin Panel</span>
                  </motion.button>
                </>
              )}

              <div className="my-2 border-t border-border/50" />

              <motion.button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                whileHover={{ x: 4 }}
              >
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="text-sm text-destructive">Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
