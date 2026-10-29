import type { PhysicsState } from "@/types/types";
import { Card } from "./ui/card";

const InformationPanel = ({ physicsState }: { physicsState: PhysicsState }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* Distance / Range */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Distance
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
          142.5{" "}
          <span className="text-xs text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Max Height */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Peak Height
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-sky-400">
          48.2{" "}
          <span className="text-xs text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Flight Time */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Air Time
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-amber-400">
          3.14{" "}
          <span className="text-xs text-muted-foreground font-normal">s</span>
        </span>
      </Card>

      {/* Velocity */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Speed
        </span>
        <span className="text-base sm:text-lg font-mono font-bold text-rose-400">
          {physicsState.speed}{" "}
          <span className="text-xs text-muted-foreground font-normal">m/s</span>
        </span>
      </Card>
    </div>
  );
};

export default InformationPanel;
