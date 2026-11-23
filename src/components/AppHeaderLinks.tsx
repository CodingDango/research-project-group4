import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router";

export function AppHeaderLinks() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button variant="outline" className={"text-primary-foreground"}>
          Modes <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem>
          <Link to="/coordinate">Coordinate</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/1-player">1 Player</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link to="/2-player">2 Players</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
