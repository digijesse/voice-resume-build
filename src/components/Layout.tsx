
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

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
        <nav className="max-w-screen-xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="text-lg font-bold tracking-tight text-primary select-none">
            Persona Builder
          </div>
          <div className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground shadow"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <footer className="bg-muted py-3 text-xs text-muted-foreground border-t mt-8 w-full">
        <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
          <span>
            © {new Date().getFullYear()} Hackathon Project. All rights reserved.
          </span>
          <span>Built with 💙 Persona Builder</span>
        </div>
      </footer>
    </div>
  );
}
