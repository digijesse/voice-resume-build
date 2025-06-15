import { useRef, useState, useEffect } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthState } from "../hooks/useAuthState";
import { useNavigate } from "react-router-dom";

const ELEVENLABS_SIGNUP_URL = "https://www.elevenlabs.io/signup";

export default function CreatePersona() {
  const { user } = useAuthState();
  const navigate = useNavigate();

  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // If not logged in, redirect to /auth
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: Resume required, OpenAI/Eleven API required, name required, first_name >=2 chars
    const data = new FormData(formRef.current!);
    const resume = data.get("resume") as File | null;
    const openai = data.get("openai")?.toString().trim();
    const eleven = data.get("eleven")?.toString().trim();
    const first_name = data.get("first_name")?.toString().trim();

    const err: typeof errors = {};
    if (!resume) err.resume = "Resume is required";
    if (!openai) err.openai = "OpenAI API key is required";
    if (!eleven) err.eleven = "ElevenLabs API key is required";
    if (!first_name || first_name.length < 2) err.first_name = "First name must be at least 2 letters";
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);
    setOutputVisible(false);

    // TODO: Actual API call (upload resume, create persona, store privacy)
    setTimeout(() => {
      setLoading(false);
      setOutputVisible(true);
    }, 2000);
  };

  return (
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
          <input
            id="first_name"
            name="first_name"
            type="text"
            minLength={2}
            required
            className="w-full border rounded px-3 py-2 bg-muted"
          />
          {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="resume">
            Upload Your Resume&nbsp;
            <span className="text-muted-foreground text-xs">(PDF, DOCX, or TXT)</span>
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            required
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="w-full border rounded px-3 py-2 cursor-pointer bg-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:bg-primary/90 file:text-white transition"
          />
          {errors.resume && <div className="text-red-500 text-xs mt-1">{errors.resume}</div>}
        </div>
        <div>
          <label htmlFor="openai-api" className="block text-sm font-medium mb-1">
            OpenAI API Key <span className="text-red-500">*</span>
          </label>
          <input
            id="openai-api"
            name="openai"
            type="text"
            required
            autoComplete="off"
            placeholder="sk-..."
            className="w-full border rounded px-3 py-2 bg-muted"
          />
          {errors.openai && <div className="text-red-500 text-xs mt-1">{errors.openai}</div>}
        </div>
        <div>
          <label htmlFor="eleven-api" className="block text-sm font-medium mb-1">
            ElevenLabs API Key <span className="text-red-500">*</span>
          </label>
          <input
            id="eleven-api"
            name="eleven"
            type="text"
            required
            autoComplete="off"
            placeholder="eleven_..."
            className="w-full border rounded px-3 py-2 bg-muted"
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
        <button
          type="submit"
          className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 shadow transition disabled:opacity-60"
          disabled={loading}
        >
          Create PersonAI
        </button>
      </form>
      <div id="persona-output" className="mt-10 p-8 min-h-24 rounded-xl border bg-muted text-muted-foreground w-full text-center">
        {loading && <span>Creating your PersonAI...</span>}
        {!loading && !outputVisible && (
          <span>Your PersonAI will appear here after creation.</span>
        )}
        {!loading && outputVisible && (
          <div>
            <h3 className="text-xl font-semibold mb-2">👤 PersonAI Created!</h3>
            <p className="text-muted-foreground">Your interactive profile is ready. Check your account page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
