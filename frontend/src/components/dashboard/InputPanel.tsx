import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScientificTextarea } from "@/components/ui/ScientificTextarea";
import { Atom, Dna, Zap, RotateCcw } from "lucide-react";

interface InputPanelProps {
  onPredict: (smiles: string, protein: string) => void;
  isLoading: boolean;
}

export function InputPanel({ onPredict, isLoading }: InputPanelProps) {
  const [smiles, setSmiles] = useState("CC(=O)Nc1ccc(O)cc1");
  const [protein, setProtein] = useState("MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict(smiles, protein);
  };

  const handleReset = () => {
    setSmiles("");
    setProtein("");
  };

  const exampleSmiles = [
    { name: "Aspirin", value: "CC(=O)Oc1ccccc1C(=O)O" },
    { name: "Ibuprofen", value: "CC(C)Cc1ccc(C(C)C(=O)O)cc1" },
    { name: "Paracetamol", value: "CC(=O)Nc1ccc(O)cc1" },
  ];

  return (
    <GlassCard className="p-6 h-full" variant="default">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Atom className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Molecular Input</h2>
          <p className="text-sm text-muted-foreground">Enter compound & target data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SMILES Input */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Atom className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">SMILES String</span>
          </div>
          <ScientificTextarea
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
            placeholder="Enter SMILES notation..."
            className="min-h-[80px]"
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {exampleSmiles.map((example) => (
              <motion.button
                key={example.name}
                type="button"
                onClick={() => setSmiles(example.value)}
                className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {example.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Protein Sequence Input */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dna className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground/80">Protein Sequence</span>
          </div>
          <ScientificTextarea
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Enter amino acid sequence..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {protein.length} amino acids entered
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={isLoading || !smiles || !protein}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Predict Binding
              </>
            )}
          </motion.button>
          
          <motion.button
            type="button"
            onClick={handleReset}
            className="btn-glass px-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </form>

      {/* Quick Info */}
      <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-2">Quick Guide</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• SMILES: Simplified molecular input line entry system</li>
          <li>• Protein: Single-letter amino acid sequence (FASTA)</li>
          <li>• KIBA: Kinase inhibitor binding affinity score</li>
        </ul>
      </div>
    </GlassCard>
  );
}
