import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InputPanel } from "@/components/dashboard/InputPanel";
import { MoleculeViewer } from "@/components/dashboard/MoleculeViewer";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Dashboard() {
  const [kibaScore, setKibaScore] = useState(14.2);
  const [confidence, setConfidence] = useState(87);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handlePredict = async (smiles: string, protein: string) => {
    setIsLoading(true);
    
    // Simulate AI prediction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random prediction values for demo
    const newScore = Math.random() * 15 + 5;
    const newConfidence = Math.floor(Math.random() * 20 + 75);
    
    setKibaScore(newScore);
    setConfidence(newConfidence);
    setIsLoading(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="orb-teal w-[600px] h-[600px] -top-64 -left-64 opacity-20 fixed" />
      <div className="orb-violet w-[500px] h-[500px] -bottom-48 -right-48 opacity-15 fixed" />
      <div className="orb-teal w-[300px] h-[300px] top-1/2 right-1/4 opacity-10 fixed" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with User Menu */}
        <div className="flex items-center relative z-50">
          <div className="flex-1">
            <DashboardHeader />
          </div>
          <div className="px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-xl relative">
            <UserMenu 
              onOpenProfile={() => setIsProfileOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left Panel - Input */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InputPanel onPredict={handlePredict} isLoading={isLoading} />
            </motion.div>

            {/* Center - 3D Visualization */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard className="h-full min-h-[500px] overflow-hidden" variant="default">
                <div className="p-4 border-b border-border/50">
                  <h2 className="text-lg font-semibold text-foreground">Molecular Visualization</h2>
                  <p className="text-sm text-muted-foreground">Ligand-Protein Binding Complex</p>
                </div>
                <div className="h-[calc(100%-72px)]">
                  <MoleculeViewer />
                </div>
              </GlassCard>
            </motion.div>

            {/* Right Panel - Metrics */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MetricCards 
                kibaScore={kibaScore}
                confidence={confidence}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2026 BioAffinity AI Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/api-docs" className="hover:text-primary transition-colors">Documentation</a>
              <a href="/api-docs" className="hover:text-primary transition-colors">API</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* User Profile Modal */}
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
