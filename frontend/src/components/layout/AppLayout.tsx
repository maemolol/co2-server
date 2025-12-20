import { Link, NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <>
      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-8 bg-white dark:bg-zinc-700">
        <Outlet />
      </main>
    </>
  );
}