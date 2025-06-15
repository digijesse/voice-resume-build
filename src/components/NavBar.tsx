
import { Link, useLocation } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";

export default function NavBar() {
  const location = useLocation();
  const { user } = useAuthState();

  const navItems = [
    { to: "/personas", label: "Public PersonAIs" },
    { to: user ? "/account" : "/auth", label: user ? "My PersonAI" : "Sign Up / Sign In" },
  ];

  return (
    <nav className="flex items-center justify-between h-16 px-6 max-w-screen-xl mx-auto">
      <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary select-none mr-4">
        PersonAI
      </Link>
      <div className="flex gap-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${location.pathname === item.to
                ? "bg-primary text-primary-foreground shadow"
                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"}
            `}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
