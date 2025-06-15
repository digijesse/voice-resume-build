
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
          .from('public_personas' as any)
          .select('id, first_name, avatar_url, agent_id, random_persona_name');
        
        if (error) {
          console.error('Error fetching personas:', error);
          throw error;
        }
        
        console.log('Fetched personas:', data);
        setPersonas(data || []);
      } catch (error) {
        console.error('Error loading personas:', error);
        // Show empty state instead of fallback data to see if real data loads
        setPersonas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const handlePersonaClick = (persona: Persona) => {
    if (persona.agent_id) {
      console.log('Opening ElevenLabs chat for agent:', persona.agent_id);
      window.open(`https://elevenlabs.io/app/talk-to?agent_id=${persona.agent_id}`, '_blank');
    } else {
      console.log('No agent ID available for this persona:', persona);
      alert('This persona does not have an active agent yet.');
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-8">Public PersonAIs</h2>
        
        {!loading && personas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No public PersonAIs yet. Be the first to create one!</p>
          </div>
        )}
        
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
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
