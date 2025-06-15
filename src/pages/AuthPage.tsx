
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const ELEVENLABS_SIGNUP_URL = "https://www.elevenlabs.io/signup";

// Persona name/adjective generator for flavor:
function randomPersonaName(firstName: string) {
  const types = ["Engineer", "Strategist", "Creator", "Analyst", "Innovator", "Developer", "Designer"];
  const animals = ["Lion", "Eagle", "Fox", "Bear", "Wolf", "Owl", "Falcon"];
  return `${firstName?.trim()} ${types[Math.floor(Math.random() * types.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
}

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Signup-only:
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (mode === "signup") {
      if (!firstName.trim() || !elevenLabsKey.trim() || !bio.trim()) {
        setErrorMsg("All fields are required.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        // 1. Create user account in Supabase
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("Sign up failed");

        // 2. Generate persona data
        const randomPersona = randomPersonaName(firstName);
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${signUpData.user.id}&scale=100`;

        // 3. Create ElevenLabs agent
        const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
          body: {
            apiKey: elevenLabsKey,
            firstName: firstName,
            bio: bio
          }
        });

        if (agentError) throw agentError;
        if (!agentData?.agent_id) throw new Error("Failed to create agent");

        // 4. Store in profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          id: signUpData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          elevenlabs_api_key: elevenLabsKey,
          bio: bio,
          agent_id: agentData.agent_id,
          is_public: isPublic,
          random_persona_name: randomPersona,
          avatar_url: avatarUrl,
        });
        if (profileError) throw profileError;

        // 5. Insert in public_personas if public
        if (isPublic) {
          await supabase.from("public_personas").upsert({
            id: signUpData.user.id,
            first_name: firstName,
            random_persona_name: randomPersona,
            avatar_url: avatarUrl,
            agent_id: agentData.agent_id,
          });
        }

        // 6. Sign in the new user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        toast.success("Welcome! Your PersonAI has been created.");
        navigate("/account");
      } else {
        // Sign in
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
          {mode === "signup" ? "Create Your PersonAI" : "Sign In to PersonAI"}
        </h2>
        <form className="grid gap-4" onSubmit={handleAuth}>
          <Input
            type="email"
            required
            placeholder="Email address"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            required
            placeholder="Password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {/* Signup fields */}
          {mode === "signup" && (
            <>
              <Input
                type="text"
                required
                placeholder="First Name"
                className="w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              <Input
                type="text"
                placeholder="Last Name (optional)"
                className="w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
              <Input
                type="text"
                required
                placeholder="ElevenLabs API Key"
                className="w-full"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                autoComplete="off"
              />
              <textarea
                required
                placeholder="Tell us about yourself - your professional background, skills, experiences..."
                className="w-full min-h-24 px-3 py-2 text-sm border border-input bg-background rounded-md placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <label htmlFor="isPublic">
                  {isPublic ? "Public" : "Private"}
                </label>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Creating Your PersonAI..."
              : mode === "signup"
              ? "Create My PersonAI"
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
