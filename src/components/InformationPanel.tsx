import type { PhysicsStats } from "@/types/types";
import { Card } from "./ui/card";

const InformationPanel = ({ stats }: { stats: PhysicsStats }) => {
  const colors = {
    range: "text-primary",
    maxHeight: "text-primary",
    flightTime: "text-primary",
    velocity: "text-primary",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Distance / Range */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase">
          Range
        </span>
        <span
          className={`text-base sm:text-lg font-mono ${colors.range}`}
        >
          {stats.range.toFixed(2)}{" "}
          <span className="text-sm text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Max Height */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase ">
          Max Height
        </span>
        <span
          className={`text-base sm:text-lg font-mono ${colors.maxHeight}`}
        >
          {stats.maxHeight.toFixed(2)}{" "}
          <span className="text-sm  text-muted-foreground font-normal">m</span>
        </span>
      </Card>

      {/* Flight Time */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase ">
          Flight Time
        </span>
        <span
          className={`text-base sm:text-lg font-mono ${colors.flightTime}`}
        >
          {stats.airTime.toFixed(2)}{" "}
          <span className="text-sm  text-muted-foreground font-normal">s</span>
        </span>
      </Card>

      {/* Velocity */}
      <Card className="rounded-xl p-4 text-center gap-1">
        <span className="block text-xs font-medium text-muted-foreground uppercase ">
          Speed
        </span>
        <span
          className={`text-base sm:text-lg font-mono ${colors.velocity}`}
        >
          {(stats.speed > 0.5 ? stats.speed : 0).toFixed(2)}{" "}
          <span className="text-sm  text-muted-foreground font-normal">
            m/s
          </span>
        </span>
      </Card>
    </div>
  );
};

export default InformationPanel;
