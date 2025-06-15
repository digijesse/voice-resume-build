
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Persona = {
  id: string;
  first_name: string;
  avatar_url: string | null;
  agent_id: string | null;
  random_persona_name: string | null;
};

export default function PublicPersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const { data, error } = await supabase
          .from('public_personas')
          .select('id, first_name, avatar_url, agent_id, random_persona_name');
        
        if (error) throw error;
        setPersonas(data || []);
      } catch (error) {
        console.error('Error fetching personas:', error);
        // Fallback to demo data if there's an error
        setPersonas([
          { 
            id: "1", 
            first_name: "Alex", 
            avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=1", 
            agent_id: null,
            random_persona_name: "Alex Engineer Lion"
          },
          { 
            id: "2", 
            first_name: "Taylor", 
            avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=2", 
            agent_id: null,
            random_persona_name: "Taylor Creator Eagle"
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const handlePersonaClick = (persona: Persona) => {
    if (persona.agent_id) {
      window.open(`https://elevenlabs.io/app/talk-to?agent_id=${persona.agent_id}`, '_blank');
    } else {
      console.log('No agent ID available for this persona');
    }
  };

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
                  className="flex flex-col items-center bg-card rounded-lg p-5 aspect-square border group hover:shadow-lg transition cursor-pointer"
                  onClick={() => handlePersonaClick(persona)}
                >
                  <img
                    src={
                      persona.avatar_url ||
                      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${persona.first_name}`
                    }
                    className="w-20 h-20 rounded-full bg-muted mb-3 object-cover border"
                    alt={persona.first_name}
                    draggable={false}
                  />
                  <div className="font-semibold text-center text-sm">
                    {persona.random_persona_name || persona.first_name}
                  </div>
                  {persona.agent_id && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to chat
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </Layout>
  );
}
