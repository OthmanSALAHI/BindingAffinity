import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, Target, Activity, BarChart3 } from "lucide-react";

interface MetricCardsProps {
  kibaScore: number;
  confidence: number;
  isLoading: boolean;
}

export function MetricCards({ kibaScore, confidence, isLoading }: MetricCardsProps) {
  const confidenceData = [
    { x: 0, y: 20 },
    { x: 1, y: 35 },
    { x: 2, y: 45 },
    { x: 3, y: 60 },
    { x: 4, y: 75 },
    { x: 5, y: confidence },
  ];

  const bindingStrength = kibaScore < 5 ? "Weak" : kibaScore < 10 ? "Moderate" : kibaScore < 15 ? "Strong" : "Very Strong";
  const strengthColor = kibaScore < 5 ? "text-yellow-400" : kibaScore < 10 ? "text-blue-400" : "text-primary";

  return (
    <div className="space-y-4 h-full">
      {/* Main KIBA Score Card */}
      <GlassCard className="p-6" variant="glow-teal">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">KIBA Score</h2>
            <p className="text-sm text-muted-foreground">Binding Affinity</p>
          </div>
        </div>

        <div className="text-center py-4">
          {isLoading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <span className="metric-value text-6xl">{kibaScore.toFixed(1)}</span>
              <div className="mt-2">
                <span className={`text-sm font-medium ${strengthColor}`}>
                  {bindingStrength} Binding
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Score Range Indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(kibaScore / 20) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Confidence Interval Card */}
      <GlassCard className="p-6" variant="default">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Confidence</h2>
            <p className="text-sm text-muted-foreground">Prediction reliability</p>
          </div>
        </div>

        <div className="flex items-end justify-between h-24 px-2">
          {confidenceData.map((point, i) => (
            <motion.div
              key={i}
              className="w-6 rounded-t-lg bg-gradient-to-t from-secondary to-secondary/50"
              initial={{ height: 0 }}
              animate={{ height: `${point.y}%` }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Confidence Level</span>
          <span className="text-lg font-semibold text-secondary">{confidence}%</span>
        </div>
      </GlassCard>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4" variant="default">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">IC50 (nM)</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? "—" : (Math.pow(10, kibaScore / 3)).toFixed(2)}
          </p>
        </GlassCard>

        <GlassCard className="p-4" variant="default">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-secondary" />
            <span className="text-xs text-muted-foreground">pKd Value</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? "—" : (kibaScore * 0.7 + 2).toFixed(2)}
          </p>
        </GlassCard>
      </div>

      {/* Prediction Details */}
      <GlassCard className="p-4" variant="default">
        <h3 className="text-sm font-medium text-foreground mb-3">Analysis Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model Version</span>
            <span className="text-foreground">BioAffinity v2.4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inference Time</span>
            <span className="text-foreground">0.847s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GPU Accelerated</span>
            <span className="text-primary">Yes ✓</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
