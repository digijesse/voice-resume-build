
import { useRef, useState, useEffect } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthState } from "../hooks/useAuthState";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ELEVENLABS_SIGNUP_URL = "https://www.elevenlabs.io/signup";

export default function CreatePersona() {
  const { user } = useAuthState();
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, DOC, or TXT file");
      return;
    }

    setIsExtracting(true);
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('extract-document', {
        body: {
          base64Data,
          mimeType: file.type
        }
      });

      if (error) {
        throw error;
      }

      if (data?.text) {
        setExtractedText(data.text);
        toast.success("Resume text extracted successfully!");
      } else {
        throw new Error("No text was extracted from the document");
      }
    } catch (error) {
      console.error('Document extraction error:', error);
      toast.error("Failed to extract text from document. Please try again or enter your bio manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(formRef.current!);
    const openai = data.get("openai")?.toString().trim();
    const eleven = data.get("eleven")?.toString().trim();
    const first_name = data.get("first_name")?.toString().trim();
    const bio = data.get("bio")?.toString().trim() || extractedText.trim();

    const err: typeof errors = {};
    if (!openai) err.openai = "OpenAI API key is required";
    if (!eleven) err.eleven = "ElevenLabs API key is required";
    if (!first_name || first_name.length < 2) err.first_name = "First name must be at least 2 letters";
    if (!bio) err.bio = "Bio is required - either upload a resume or enter it manually";
    
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    setOutputVisible(false);

    try {
      const { data: agentData, error: agentError } = await supabase.functions.invoke('create-agent', {
        body: {
          elevenlabs_api_key: eleven,
          bio: bio,
          name: first_name
        }
      });

      if (agentError) {
        throw agentError;
      }

      if (!agentData?.agent_id) {
        throw new Error("Failed to create ElevenLabs agent");
      }

      const profileData = {
        id: user?.id,
        email: user?.email,
        first_name,
        elevenlabs_api_key: eleven,
        openai_api_key: openai,
        bio,
        resume_text: extractedText || bio,
        agent_id: agentData.agent_id,
        is_public: isPublic,
        random_persona_name: `${first_name} ${['Engineer', 'Designer', 'Developer', 'Consultant', 'Expert', 'Professional'][Math.floor(Math.random() * 6)]} ${['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Falcon'][Math.floor(Math.random() * 6)]}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        throw profileError;
      }

      if (isPublic) {
        const { error: publicError } = await supabase
          .from('public_personas')
          .upsert({
            id: user?.id,
            first_name,
            random_persona_name: profileData.random_persona_name,
            avatar_url: profileData.avatar_url,
            agent_id: agentData.agent_id
          });

        if (publicError) {
          throw publicError;
        }
      }

      setOutputVisible(true);
      toast.success("PersonAI created successfully!");
      
      setTimeout(() => {
        navigate("/account");
      }, 2000);

    } catch (error) {
      console.error('Persona creation error:', error);
      toast.error("Failed to create PersonAI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto w-full px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-6">Create Your PersonAI Profile</h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-card border rounded-xl p-8 shadow grid gap-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="first_name">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              minLength={2}
              required
              className="bg-muted"
            />
            {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="resume">
              Upload Your Resume&nbsp;
              <span className="text-muted-foreground text-xs">(PDF, DOCX, or TXT)</span>
            </label>
            <Input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="bg-muted cursor-pointer"
              disabled={isExtracting}
            />
            {isExtracting && (
              <div className="text-blue-600 text-xs mt-1 flex items-center gap-2">
                <LoadingSpinner />
                Extracting text from document...
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="bio">
              Professional Bio <span className="text-red-500">*</span>
              <span className="text-muted-foreground text-xs block">
                {extractedText ? "Extracted from your resume (you can edit this)" : "Describe your professional background and expertise"}
              </span>
            </label>
            <Textarea
              id="bio"
              name="bio"
              rows={8}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Enter your professional background, skills, experience, and expertise..."
              className="bg-muted"
            />
            {errors.bio && <div className="text-red-500 text-xs mt-1">{errors.bio}</div>}
          </div>

          <div>
            <label htmlFor="openai-api" className="block text-sm font-medium mb-1">
              OpenAI API Key <span className="text-red-500">*</span>
            </label>
            <Input
              id="openai-api"
              name="openai"
              type="text"
              required
              autoComplete="off"
              placeholder="sk-..."
              className="bg-muted"
            />
            {errors.openai && <div className="text-red-500 text-xs mt-1">{errors.openai}</div>}
          </div>

          <div>
            <label htmlFor="eleven-api" className="block text-sm font-medium mb-1">
              ElevenLabs API Key <span className="text-red-500">*</span>
            </label>
            <Input
              id="eleven-api"
              name="eleven"
              type="text"
              required
              autoComplete="off"
              placeholder="eleven_..."
              className="bg-muted"
            />
            {errors.eleven && <div className="text-red-500 text-xs mt-1">{errors.eleven}</div>}
            <div className="text-xs mt-3">
              Don't have an ElevenLabs account?{" "}
              <a
                href={ELEVENLABS_SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Sign up here
              </a>
              {" "}and then paste your API key here.
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium mb-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <span>
                Make my PersonAI public&nbsp;
                <span className="text-muted-foreground text-xs">
                  (uncheck to keep it private)
                </span>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="mt-4 w-full py-3 text-lg"
            disabled={loading || isExtracting}
          >
            {loading ? "Creating PersonAI..." : "Create PersonAI"}
          </Button>
        </form>

        <div id="persona-output" className="mt-10 p-8 min-h-24 rounded-xl border bg-muted text-muted-foreground w-full text-center">
          {loading && (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>Creating your PersonAI...</span>
            </div>
          )}
          {!loading && !outputVisible && (
            <span>Your PersonAI will appear here after creation.</span>
          )}
          {!loading && outputVisible && (
            <div>
              <h3 className="text-xl font-semibold mb-2">👤 PersonAI Created!</h3>
              <p className="text-muted-foreground">Your interactive profile is ready. Redirecting to your account...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
