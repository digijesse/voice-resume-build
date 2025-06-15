
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Allowed resume types
const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ELEVENLABS_SIGNUP_URL = "https://www.elevenlabs.io/signup";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Signup-only fields:
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ACCEPTED_RESUME_TYPES.includes(file.type)) {
      setResume(file);
      setErrorMsg("");
    } else if (file) {
      setResume(null);
      setErrorMsg("Invalid resume file type. Allowed: PDF, DOCX, TXT.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (mode === "signup") {
      // Validate all additional fields
      if (firstName.trim().length < 2) {
        setErrorMsg("First name is required (min 2 characters).");
        setLoading(false);
        return;
      }
      if (!elevenLabsKey.trim()) {
        setErrorMsg("ElevenLabs API key is required.");
        setLoading(false);
        return;
      }
      if (!resume) {
        setErrorMsg("Resume upload is required.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        // Create user account in Supabase
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (signUpError) throw signUpError;
        // User must verify email before continuing
        let message =
          "Check your email for the verification link before signing in.";

        // Upload resume (only after user is created, otherwise skip file upload)
        if (signUpData.user && resume) {
          // We'll store under resumes/{user_id}.{ext}
          const ext = resume.name.split(".").pop() || "pdf";
          const filePath = `resumes/${signUpData.user.id}.${ext}`;

          // Try to upload to a bucket named 'resumes'
          const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, resume);

          if (uploadError) {
            setErrorMsg(
              "Resume upload failed (bucket may not exist yet). Please try again once resumes storage is configured."
            );
            setLoading(false);
            return;
          }
        }

        // Save profile info in localStorage, will be linked to ElevenLabs flow later
        window.localStorage.setItem("elevenlabs_api_key", elevenLabsKey);
        window.localStorage.setItem("personai_is_public", String(isPublic));
        // Leaving last name and resume url storage as an exercise for server
        setMode("signin");
        setErrorMsg(message);
      } else {
        // Sign in flow
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
            minLength={3}
            autoComplete="email"
          />
          <Input
            type="password"
            required
            placeholder="Password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
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
                minLength={2}
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
                minLength={10}
                autoComplete="off"
              />
              <input
                type="file"
                required
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/90 file:text-primary-foreground hover:file:bg-primary"
                onChange={handleResumeChange}
                aria-label="Upload Resume"
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
              ? "Loading..."
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
