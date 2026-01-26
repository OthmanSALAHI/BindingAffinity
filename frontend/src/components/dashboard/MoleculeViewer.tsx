import { useEffect, useRef, useState } from "react";

interface BindingSite {
  x: number;
  y: number;
  label: string;
  affinity: number;
}

export function MoleculeViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSite, setHoveredSite] = useState<BindingSite | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  const bindingSites: BindingSite[] = [
    { x: 150, y: 100, label: "Site A", affinity: 8.5 },
    { x: 300, y: 150, label: "Site B", affinity: 7.2 },
    { x: 450, y: 120, label: "Site C", affinity: 9.1 },
    { x: 250, y: 250, label: "Site D", affinity: 6.8 },
    { x: 400, y: 280, label: "Site E", affinity: 7.9 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationId: number;
    const animate = () => {
      setAnimationFrame((prev) => prev + 1);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(26, 34, 53, 0.1)");
    gradient.addColorStop(1, "rgba(0, 212, 170, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the protein structure
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw protein backbone (simplified 2D representation)
    ctx.strokeStyle = "#00d4aa";
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Draw a simplified protein chain with curves
    const points = [
      { x: centerX - 200, y: centerY - 50 },
      { x: centerX - 100, y: centerY - 80 },
      { x: centerX, y: centerY - 60 },
      { x: centerX + 100, y: centerY - 90 },
      { x: centerX + 200, y: centerY - 50 },
      { x: centerX + 180, y: centerY + 50 },
      { x: centerX + 80, y: centerY + 80 },
      { x: centerX - 20, y: centerY + 70 },
      { x: centerX - 120, y: centerY + 90 },
      { x: centerX - 200, y: centerY + 50 },
    ];

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const midX = (prevPoint.x + currentPoint.x) / 2;
      const midY = (prevPoint.y + currentPoint.y) / 2;
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    }
    ctx.stroke();

    // Draw secondary structures (alpha helices and beta sheets)
    // Alpha helices - represented as rectangles
    const helices = [
      { x: centerX - 150, y: centerY - 70, width: 60, height: 25 },
      { x: centerX + 50, y: centerY - 80, width: 70, height: 25 },
      { x: centerX + 100, y: centerY + 60, width: 65, height: 25 },
    ];

    helices.forEach((helix) => {
      ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.fillRect(helix.x, helix.y, helix.width, helix.height);
      ctx.strokeRect(helix.x, helix.y, helix.width, helix.height);
      
      // Add helix pattern
      ctx.strokeStyle = "rgba(139, 92, 246, 0.5)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const lineX = helix.x + (helix.width / 4) * i + 10;
        ctx.beginPath();
        ctx.moveTo(lineX, helix.y);
        ctx.lineTo(lineX, helix.y + helix.height);
        ctx.stroke();
      }
    });

    // Beta sheets - represented as arrows
    const sheets = [
      { x: centerX - 80, y: centerY + 70, width: 50, height: 20 },
      { x: centerX - 180, y: centerY + 40, width: 55, height: 20 },
    ];

    sheets.forEach((sheet) => {
      ctx.fillStyle = "rgba(0, 212, 170, 0.3)";
      ctx.strokeStyle = "#00d4aa";
      ctx.lineWidth = 2;
      
      // Draw arrow shape
      ctx.beginPath();
      ctx.moveTo(sheet.x, sheet.y);
      ctx.lineTo(sheet.x + sheet.width - 10, sheet.y);
      ctx.lineTo(sheet.x + sheet.width, sheet.y + sheet.height / 2);
      ctx.lineTo(sheet.x + sheet.width - 10, sheet.y + sheet.height);
      ctx.lineTo(sheet.x, sheet.y + sheet.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Draw binding sites with pulsing animation
    const pulsePhase = (animationFrame % 60) / 60;
    bindingSites.forEach((site) => {
      const siteX = centerX + site.x - 250;
      const siteY = centerY + site.y - 200;
      const isHovered = hoveredSite?.label === site.label;
      
      // Pulsing effect
      const pulse = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.2;
      const radius = (isHovered ? 12 : 8) * pulse;

      // Glow effect
      const gradient = ctx.createRadialGradient(siteX, siteY, 0, siteX, siteY, radius * 2);
      gradient.addColorStop(0, site.affinity > 8 ? "rgba(0, 212, 170, 0.6)" : "rgba(139, 92, 246, 0.6)");
      gradient.addColorStop(1, "rgba(0, 212, 170, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(siteX, siteY, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      ctx.fillStyle = site.affinity > 8 ? "#00d4aa" : "#8b5cf6";
      ctx.beginPath();
      ctx.arc(siteX, siteY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Draw label if hovered
      if (isHovered) {
        ctx.fillStyle = "rgba(26, 34, 53, 0.9)";
        ctx.fillRect(siteX + 15, siteY - 25, 100, 40);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(site.label, siteX + 20, siteY - 10);
        ctx.font = "11px sans-serif";
        ctx.fillText(`Affinity: ${site.affinity} kcal/mol`, siteX + 20, siteY + 5);
      }
    });

    // Draw legend
    ctx.fillStyle = "rgba(26, 34, 53, 0.8)";
    ctx.fillRect(20, 20, 180, 110);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("2D Protein Structure", 30, 40);
    
    ctx.font = "12px sans-serif";
    // Alpha helix
    ctx.fillStyle = "#8b5cf6";
    ctx.fillRect(30, 50, 15, 15);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Alpha Helix", 50, 62);
    
    // Beta sheet
    ctx.fillStyle = "#00d4aa";
    ctx.fillRect(30, 75, 15, 15);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Beta Sheet", 50, 87);
    
    // Binding site
    ctx.fillStyle = "#00d4aa";
    ctx.beginPath();
    ctx.arc(37, 107, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Binding Site", 50, 112);

  }, [animationFrame, hoveredSite]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let foundSite: BindingSite | null = null;
    for (const site of bindingSites) {
      const siteX = centerX + site.x - 250;
      const siteY = centerY + site.y - 200;
      const distance = Math.sqrt(
        Math.pow(mouseX - siteX, 2) + Math.pow(mouseY - siteY, 2)
      );
      if (distance < 15) {
        foundSite = site;
        break;
      }
    }
    setHoveredSite(foundSite);
  };

  return (
    <div className="molecule-container w-full h-full min-h-[400px] relative">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSite(null)}
        className="w-full h-full cursor-pointer"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
