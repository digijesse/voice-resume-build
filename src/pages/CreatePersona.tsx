
import { useRef, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CreatePersona() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutputVisible(false);

    // Simulate loading for demo. Replace with real logic later
    setTimeout(() => {
      setLoading(false);
      setOutputVisible(true);
    }, 2200);
  };

  return (
    <Layout>
      <section className="max-w-xl mx-auto w-full px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-6">Create Your Professional Persona</h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-card border rounded-xl p-8 shadow grid gap-6"
        >
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
          </div>
          {/* Uncomment for Hume API Key beyond MVP
          <div>
            <label htmlFor="hume-api" className="block text-sm font-medium mb-1">
              Hume AI API Key (Optional)
            </label>
            <input
              id="hume-api"
              name="hume"
              type="text"
              autoComplete="off"
              className="w-full border rounded px-3 py-2 bg-muted"
            />
          </div>
          */}
          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 shadow transition disabled:opacity-60"
            disabled={loading}
          >
            Generate Professional Persona
          </button>
        </form>
        {/* Persona Output */}
        <div id="persona-output" className="mt-10 p-8 min-h-24 rounded-xl border bg-muted text-muted-foreground w-full text-center">
          {loading && <LoadingSpinner />}
          {!loading && !outputVisible && (
            <span>Your persona will appear here.</span>
          )}
          {!loading && outputVisible && (
            <div>
              <h3 className="text-xl font-semibold mb-2">👤 Persona Generated!</h3>
              <p className="text-muted-foreground">Interactive persona UI will appear here after integration.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
