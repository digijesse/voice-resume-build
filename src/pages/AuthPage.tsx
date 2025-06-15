
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ELEVENLABS_SIGNUP_URL = "https://www.elevenlabs.io/signup";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        setMode("signin");
        setErrorMsg("Check your email for verification link then sign in.");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          navigate("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-6 py-16">
      <div className="bg-card border rounded-xl p-8 shadow grid gap-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {mode === "signup" ? "Sign Up for PersonAI" : "Sign In to PersonAI"}
        </h2>
        <form className="grid gap-4" onSubmit={handleAuth}>
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full border rounded px-3 py-2 bg-muted"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            minLength={3}
            autoComplete="email"
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full border rounded px-3 py-2 bg-muted"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Loading..."
              : mode === "signup"
              ? "Create account"
              : "Sign In"}
          </Button>
          {errorMsg && (
            <div className="text-red-500 text-sm text-center">{errorMsg}</div>
          )}
        </form>

        <div className="text-center text-sm text-muted-foreground mt-2">
          {mode === "signup"
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            className="underline ml-1"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            type="button"
          >
            {mode === "signup" ? "Sign in." : "Sign up now."}
          </button>
        </div>
        <div className="text-center text-xs mt-6">
          <span>
            Need an ElevenLabs API key?{" "}
            <a
              href={ELEVENLABS_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Sign up here
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
