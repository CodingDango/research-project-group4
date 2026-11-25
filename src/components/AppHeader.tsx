import { AppHeaderLinks } from "./AppHeaderLinks";
import { FormulaDialog } from "./FormulaDialog";
import { ModeToggle } from "./ui/mode-toggle";
import Logo from "@/assets/logo.svg";

const AppHeader = () => {
  return (
    <div className="h-12 bg-card border-b py-2 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-center">
          <img src={Logo} className="inline-block h-6" />
          <h1>Logoipsum</h1>
        </div>

        <div className="flex gap-4 items-center">
          <AppHeaderLinks />
          <FormulaDialog/>
          <ModeToggle />
          
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
