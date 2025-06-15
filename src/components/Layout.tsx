import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/personas", label: "Public Personas" },
  { path: "/create", label: "Create Persona" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-white/90 sticky top-0 z-20">
        <NavBar />
      </header>
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <footer className="bg-muted py-3 text-xs text-muted-foreground border-t mt-8 w-full">
        <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
          <span>
            © {new Date().getFullYear()} PersonAI. All rights reserved.
          </span>
          <span>Built with 💙 PersonAI</span>
        </div>
      </footer>
    </div>
  );
}
