import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Orbs */}
      <div className="orb-teal w-[500px] h-[500px] -top-48 -left-48 opacity-40" />
      <div className="orb-violet w-[600px] h-[600px] -bottom-64 -right-48 opacity-30" />
      <div className="orb-teal w-[300px] h-[300px] top-1/4 right-1/4 opacity-20" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
        style={{ margin: "50px 0px" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
