import { Outlet } from "react-router";
import AppHeader from "./AppHeader";

const AppLayout = () => {
  return (
    <div className="bg-background text-foreground min-h-screen ">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
