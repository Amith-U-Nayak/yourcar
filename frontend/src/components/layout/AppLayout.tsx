import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-100 antialiased selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-surface-card py-6 bg-surface-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">Yourcar</span>. All
            rights reserved.
          </p>
          <p className="italic">"New or pre-owned, right on target."</p>
        </div>
      </footer>
    </div>
  );
}
