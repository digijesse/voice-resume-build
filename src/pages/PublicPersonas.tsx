import Layout from "../components/Layout";
import { useEffect, useState } from "react";

type Persona = {
  id: string;
  first_name: string;
  avatar_url: string | null;
};

export default function PublicPersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call to fetch public personas
    setTimeout(() => {
      setPersonas([
        { id: "1", first_name: "Alex", avatar_url: "https://api.elevenlabs.io/avatars/abc.jpg" },
        { id: "2", first_name: "Taylor", avatar_url: "https://api.elevenlabs.io/avatars/xyz.jpg" },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-8">Public PersonAIs</h2>
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-card rounded-lg p-5 aspect-square animate-pulse"
                >
                  <div className="w-20 h-20 rounded-full bg-muted mb-3" />
                  <div className="w-16 h-3 rounded bg-muted/80 mb-2" />
                </div>
              ))
            : personas.map((persona) => (
                <div
                  key={persona.id}
                  className="flex flex-col items-center bg-card rounded-lg p-5 aspect-square border group hover:shadow-lg transition"
                >
                  <img
                    src={
                      persona.avatar_url ||
                      "https://api.dicebear.com/7.x/thumbs/svg?seed=" + persona.first_name
                    }
                    className="w-20 h-20 rounded-full bg-muted mb-3 object-cover border"
                    alt={persona.first_name}
                    draggable={false}
                  />
                  <div className="font-semibold">{persona.first_name}</div>
                </div>
              ))}
        </div>
      </div>
    </Layout>
  );
}
