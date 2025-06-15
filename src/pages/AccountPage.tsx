
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuthState } from "../hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";

interface AccountDetails {
  first_name: string;
  last_name?: string | null;
  email: string;
  avatar_url?: string | null;
  agent_id?: string | null;
  is_public?: boolean;
  random_persona_name?: string | null;
}

export default function AccountPage() {
  const { user } = useAuthState();
  const [details, setDetails] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccountInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles' as any)
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          throw error;
        }

        setDetails(data);
      } catch (error) {
        console.error('Failed to load account details:', error);
        // Set basic details from auth user
        setDetails({
          email: user.email || "",
          first_name: "User",
          agent_id: null,
          is_public: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAccountInfo();
  }, [user]);

  const handleChatClick = () => {
    if (details?.agent_id) {
      window.open(`https://elevenlabs.io/app/talk-to?agent_id=${details.agent_id}`, '_blank');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto pt-24 text-center text-muted-foreground">
          Please sign in to view your PersonAI account.
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto w-full px-6 py-16">
          <div className="animate-pulse">
            <div className="w-28 h-28 rounded-full bg-muted mx-auto mb-4" />
            <div className="w-32 h-4 rounded bg-muted mx-auto mb-2" />
            <div className="w-24 h-3 rounded bg-muted mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto w-full px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-8">My PersonAI Account</h2>
        <div className="flex flex-col items-center space-y-5">
          <img
            src={
              details?.avatar_url ||
              `https://api.dicebear.com/7.x/pixel-art/svg?seed=${details?.first_name || 'user'}`
            }
            className="w-28 h-28 rounded-full bg-muted border mb-2"
            alt="My PersonAI Avatar"
            draggable={false}
          />
          <div className="text-lg font-semibold">
            {details?.random_persona_name || details?.first_name}
          </div>
          {details?.last_name && (
            <div className="text-muted-foreground">{details.last_name}</div>
          )}
          <div className="text-sm text-muted-foreground">{details?.email}</div>
          
          <div className="flex flex-row gap-2 items-center mt-3">
            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                details?.is_public ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {details?.is_public ? "Public" : "Private"}
            </span>
          </div>

          {details?.agent_id && (
            <button
              onClick={handleChatClick}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Chat with My PersonAI
            </button>
          )}

          {!details?.agent_id && (
            <div className="text-sm text-muted-foreground mt-4 text-center">
              Your PersonAI agent is not set up yet. Please contact support.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
