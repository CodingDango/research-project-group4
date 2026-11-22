import { ModeToggle } from "./ui/mode-toggle";

const AppHeader = () => {
  return (
    <div className="h-12 bg-card border-b py-2 px-4 sm:px-8">
      <div className="flex justify-end items-center">
        <ModeToggle/>
      </div>
    </div>
  );
};

export default AppHeader;
