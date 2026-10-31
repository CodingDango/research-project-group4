import type { PhysicsStats } from "@/types/types";
import { Card } from "./ui/card";

const InformationPanel = ({ stats }: { stats: PhysicsStats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* Distance / Range */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Distance
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
          {stats.distance.toFixed(2)}{" "}
          <span className="text-xs text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Max Height */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Peak Height
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-sky-400">
          {stats.maxHeight.toFixed(2)}
          <span className="text-xs text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Flight Time */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Air Time
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-amber-400">
          {stats.airTime.toFixed(2)}{" "}
          <span className="text-xs text-muted-foreground font-normal">s</span>
        </span>
      </Card>

      {/* Velocity */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Speed
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-rose-400">
          {(stats.speed > 0.5 ? stats.speed : 0).toFixed(2)}{" "}
          <span className="text-xs text-muted-foreground font-normal">m/s</span>
        </span>
      </Card>
    </div>
  );
};

export default InformationPanel;
