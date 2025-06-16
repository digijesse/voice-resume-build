
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export default function NavBar() {
  const { user } = useAuthState();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="max-w-screen-xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-primary">
        PersonAI
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/personas"
          className="text-muted-foreground hover:text-primary transition"
        >
          Public Personas
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/create"
              className="text-muted-foreground hover:text-primary transition"
            >
              Create Persona
            </Link>
            <Link
              to="/account"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
