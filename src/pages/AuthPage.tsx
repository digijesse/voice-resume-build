
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { parsePdf } from "@/utils/pdfParser";

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
  const [openAIApiKey, setOpenAIApiKey] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResume(file || null);
    setErrorMsg("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (mode === "signup") {
      if (!firstName.trim() || !elevenLabsKey.trim() || !openAIApiKey.trim() || !resume) {
        setErrorMsg("All fields are required.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "signup") {
        // 1. Create user account in Supabase (NO redirect for email verification!)
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error("Sign up failed");

        // 2. Upload resume to storage
        let resumeUrl = "";
        let parsedResumeText = "";
        if (resume) {
          const ext = resume.name.split(".").pop() || "pdf";
          const filePath = `resumes/${signUpData.user.id}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(filePath, resume, { upsert: true });
          if (uploadError) throw uploadError;
          // Public URL
          const publicUrl = supabase.storage.from("resumes").getPublicUrl(filePath).data.publicUrl;
          resumeUrl = publicUrl || "";

          // 3. Parse resume for text (PDF and TXT only, ignore docx for now)
          if (resume.type === "application/pdf") {
            parsedResumeText = await parsePdf(resume);
          } else if (resume.type === "text/plain") {
            parsedResumeText = await resume.text();
          } else {
            parsedResumeText = "";
          }
        }

        // 4. Generate persona data
        const randomPersona = randomPersonaName(firstName);
        const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${signUpData.user.id}&scale=100`;

        // 5. Store in profiles
        // --- TEMPORARY: force profiles table type as any.
        const { error: profileError } = await (supabase.from as any)("profiles").insert({
          id: signUpData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          elevenlabs_api_key: elevenLabsKey,
          openai_api_key: openAIApiKey,
          resume_file_url: resumeUrl,
          resume_text_content: parsedResumeText,
          is_public: isPublic,
          random_persona_name: randomPersona,
          avatar_url: avatarUrl,
        });
        if (profileError) throw profileError;

        // 6. Insert in public_personas if public
        if (isPublic) {
          await (supabase.from as any)("public_personas").upsert({
            id: signUpData.user.id,
            first_name: firstName,
            random_persona_name: randomPersona,
            avatar_url: avatarUrl,
          });
        }

        // 7. Immediately sign in the new user (no need for email verification for MVP!)
        const { error: signInError, data: signInData } =
          await supabase.auth.signInWithPassword({
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
              <Input
                type="text"
                required
                placeholder="OpenAI API Key"
                className="w-full"
                value={openAIApiKey}
                onChange={(e) => setOpenAIApiKey(e.target.value)}
                autoComplete="off"
              />
              <input
                type="file"
                required
                accept=".pdf,.txt,application/pdf,text/plain"
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
