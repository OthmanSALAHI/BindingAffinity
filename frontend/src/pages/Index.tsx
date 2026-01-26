import { motion } from "framer-motion";
import { ArrowRight, Atom, Dna, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="orb-teal w-[700px] h-[700px] -top-64 -left-64 opacity-30" />
      <div className="orb-violet w-[600px] h-[600px] -bottom-64 -right-64 opacity-25" />
      <div className="orb-teal w-[400px] h-[400px] top-1/3 right-1/4 opacity-15" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">BioAffinity</span>
          </motion.div>

          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <motion.button 
                className="btn-primary text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Drug Discovery</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Predict Drug-Target{" "}
            <span className="gradient-text text-glow-teal">Binding Affinity</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Leverage cutting-edge AI models to predict KIBA scores and accelerate your 
            drug discovery pipeline with unprecedented accuracy.
          </p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/register">
              <motion.button 
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Predicting
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button 
                className="btn-glass flex items-center gap-2 text-lg px-8 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FeatureCard
            icon={<Atom className="w-8 h-8" />}
            title="SMILES Input"
            description="Enter molecular structures using standardized SMILES notation for precise compound analysis."
            color="primary"
          />
          <FeatureCard
            icon={<Dna className="w-8 h-8" />}
            title="Protein Sequences"
            description="Analyze target proteins with amino acid sequences for comprehensive binding predictions."
            color="secondary"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="KIBA Scores"
            description="Get accurate kinase inhibitor binding affinity scores with confidence intervals."
            color="primary"
          />
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <StatCard value="98.7%" label="Prediction Accuracy" />
          <StatCard value="2.4M+" label="Predictions Made" />
          <StatCard value="<1s" label="Average Response" />
          <StatCard value="500+" label="Research Labs" />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 BioAffinity. Advancing drug discovery with AI.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: "primary" | "secondary" }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <GlassCard className="p-6 h-full" variant={color === "primary" ? "glow-teal" : "glow-violet"}>
        <div className={`w-14 h-14 rounded-xl bg-${color}/10 flex items-center justify-center mb-4`}>
          <span className={`text-${color}`}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <GlassCard className="p-6 text-center" variant="default">
      <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </GlassCard>
  );
}

export default Index;
