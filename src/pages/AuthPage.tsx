
import { useState } from "react";
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64String = base64Data.split(',')[1];
        
        try {
          const { data, error } = await supabase.functions.invoke('extract-document', {
            body: {
              base64Data: base64String,
              mimeType: file.type
            }
          });

          if (error) throw error;
          resolve(data.text || '');
        } catch (error) {
          console.error('Error extracting text:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
        // Extract resume text if file is provided
        let resumeText = "";
        if (resumeFile) {
          try {
            resumeText = await extractTextFromFile(resumeFile);
          } catch (error) {
            console.error('Resume extraction failed:', error);
            toast.error("Failed to extract resume text. Continuing without it.");
          }
        }

        // 1. Create user account with proper email verification
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        
        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }
        if (!signUpData.user) throw new Error("Sign up failed");

        console.log('User created:', signUpData.user.id);

        // 2. Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            first_name: firstName,
            last_name: lastName || null,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here - user account is created, profile can be created later
        }

        // 3. Create ElevenLabs agent and persona
        try {
          console.log('Creating agent with data:', { firstName, lastName, bio: bio.substring(0, 50) + '...' });
          const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
            body: {
              resume_text: resumeText || bio,
              first_name: firstName,
              last_name: lastName || "",
              elevenlabs_api_key: elevenLabsKey
            }
          });

          if (agentError) {
            console.error('Agent creation error:', agentError);
            throw agentError;
          }
          if (!agentData?.agent_id) {
            console.error('No agent_id in response:', agentData);
            throw new Error("Failed to create agent - no agent ID returned");
          }

          console.log('Agent created successfully:', agentData.agent_id);

          // 4. Generate persona data
          const randomPersona = randomPersonaName(firstName);
          const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${signUpData.user.id}&scale=100`;

          // 5. Store persona data
          const { error: personaError } = await supabase
            .from('personas')
            .insert({
              user_id: signUpData.user.id,
              first_name: firstName,
              last_name: lastName || null,
              is_public: isPublic,
              resume_text: resumeText || bio,
              agent_id: agentData.agent_id,
              elevenlabs_api_key: elevenLabsKey,
              conversation_link: `https://elevenlabs.io/app/talk-to?agent_id=${agentData.agent_id}`,
              avatar_url: avatarUrl,
            });

          if (personaError) {
            console.error('Persona creation error:', personaError);
            // Don't throw here - the main signup succeeded
          }

          // 6. Update public personas if public
          if (isPublic) {
            const { error: publicPersonaError } = await supabase
              .from('public_personas')
              .upsert({
                id: signUpData.user.id,
                first_name: firstName,
                random_persona_name: randomPersona,
                avatar_url: avatarUrl,
                agent_id: agentData.agent_id,
              });

            if (publicPersonaError) {
              console.error('Public persona creation error:', publicPersonaError);
              // Don't throw here - profile is more important than public visibility
            }
          }
        } catch (agentError) {
          console.error('Agent/Persona creation failed:', agentError);
          toast.error("Account created but agent setup failed. You can complete setup later in your account page.");
        }

        // Show email verification message
        setShowEmailVerification(true);
        toast.success("Account created successfully! Please check your email to verify your account before signing in.");
        
      } else {
        // Sign in
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Email not confirmed')) {
            setErrorMsg("Please check your email and click the verification link before signing in.");
          } else {
            throw error;
          }
        } else if (data.user) {
          navigate("/");
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="max-w-md mx-auto w-full px-6 py-16">
        <div className="bg-card border rounded-xl p-8 shadow text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Check Your Email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong>{email}</strong>. 
            Please click the link in your email to verify your account, then return here to sign in.
          </p>
          <Button onClick={() => setShowEmailVerification(false)} className="w-full">
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

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
              <div className="space-y-2">
                <label className="text-sm font-medium">Resume (PDF, optional)</label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
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
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setShowEmailVerification(false);
              setErrorMsg("");
            }}
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
