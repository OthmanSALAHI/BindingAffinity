import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScientificInput } from "@/components/ui/ScientificInput";
import { User, Mail, Camera, Save, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form fields when user data is available
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const profileImageUrl = user?.profile_image 
    ? authApi.getProfileImageUrl(user.profile_image)
    : null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      const response = await authApi.uploadProfileImage(file);
      
      // Update user with new profile image
      if (user) {
        const updatedUser = { ...user, profile_image: response.profile_image };
        updateUser(updatedUser);
      }
      
      toast.success("Profile image updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.profile_image) return;

    try {
      await authApi.deleteProfileImage();
      
      // Update user without profile image
      const updatedUser = { ...user, profile_image: null };
      updateUser(updatedUser);
      
      toast.success("Profile image deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete image";
      toast.error(message);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate fields
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authApi.updateProfile({
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim()
      });
      
      // Update user in context
      updateUser(response.user);
      
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <GlassCard className="w-full max-w-lg p-6" variant="glow-violet">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <motion.div
                    className="w-28 h-28 rounded-full bg-gradient-primary p-[3px] cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                  </motion.div>
                  <motion.button
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center glow-teal"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    )}
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                {profileImageUrl && (
                  <motion.button
                    onClick={handleDeleteAvatar}
                    className="mt-3 text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Photo
                  </motion.button>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <ScientificInput
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  placeholder="Your username"
                />

                <ScientificInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  placeholder="your@email.com"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself... (e.g., Researcher, Bioinformatics Specialist)"
                    className="input-scientific w-full min-h-[100px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/200 characters
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={onClose}
                  className="btn-glass flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
