import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
          <a className="/coordinate">Coordinate</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a className="/1-player">1 Player</a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a className="/2-player">2 Players</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
