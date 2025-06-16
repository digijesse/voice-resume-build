
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuthState } from "../hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";

interface AccountDetails {
  first_name: string;
  last_name?: string | null;
  email: string;
  bio: string;
  avatar_url?: string | null;
  agent_id?: string | null;
  is_public?: boolean;
  random_persona_name?: string | null;
  elevenlabs_api_key?: string | null;
  resume_text?: string | null;
}

export default function AccountPage() {
  const { user } = useAuthState();
  const [details, setDetails] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingAgent, setUpdatingAgent] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const loadAccountInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
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
        setDetails({
          email: user.email || "",
          first_name: "User",
          bio: "",
          agent_id: null,
          is_public: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAccountInfo();
  }, [user]);

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
        setDetails(prev => prev ? { ...prev, bio: data.text, resume_text: data.text } : null);
        toast.success("Resume text extracted successfully!");
      } else {
        throw new Error("No text was extracted from the document");
      }
    } catch (error) {
      console.error('Document extraction error:', error);
      toast.error("Failed to extract text from document. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!details || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: details.first_name,
          last_name: details.last_name,
          bio: details.bio,
          is_public: details.is_public,
          avatar_url: details.avatar_url,
          resume_text: details.resume_text,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update public_personas if public
      if (details.is_public) {
        const { error: publicError } = await supabase
          .from('public_personas')
          .upsert({
            id: user.id,
            first_name: details.first_name,
            random_persona_name: details.random_persona_name || `${details.first_name} PersonAI`,
            avatar_url: details.avatar_url,
            agent_id: details.agent_id || '',
          });

        if (publicError) console.error('Error updating public persona:', publicError);
      } else {
        // Remove from public_personas if made private
        await supabase
          .from('public_personas')
          .delete()
          .eq('id', user.id);
      }

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!details?.elevenlabs_api_key || !details?.bio) {
      toast.error("ElevenLabs API key and bio are required to update agent");
      return;
    }

    setUpdatingAgent(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          elevenlabs_api_key: details.elevenlabs_api_key,
          bio: details.bio,
          name: details.first_name
        }
      });

      if (error) throw error;

      if (data?.agent_id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ agent_id: data.agent_id })
          .eq('id', user?.id);

        if (updateError) throw updateError;

        setDetails(prev => prev ? { ...prev, agent_id: data.agent_id } : null);
        toast.success("Agent updated successfully!");
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error("Failed to update agent");
    } finally {
      setUpdatingAgent(false);
    }
  };

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
      <div className="max-w-2xl mx-auto w-full px-6 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary">My PersonAI Account</h2>
          <Button
            onClick={() => setEditing(!editing)}
            variant={editing ? "outline" : "default"}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {editing ? (
          <div className="bg-card border rounded-xl p-8 shadow space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={
                  details?.avatar_url ||
                  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${details?.first_name || 'user'}`
                }
                className="w-20 h-20 rounded-full bg-muted border"
                alt="Avatar"
                draggable={false}
              />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                <Input
                  type="url"
                  value={details?.avatar_url || ''}
                  onChange={(e) => setDetails(prev => prev ? {...prev, avatar_url: e.target.value} : null)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={details?.first_name || ''}
                  onChange={(e) => setDetails(prev => prev ? {...prev, first_name: e.target.value} : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={details?.last_name || ''}
                  onChange={(e) => setDetails(prev => prev ? {...prev, last_name: e.target.value} : null)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload New Resume
                <span className="text-muted-foreground text-xs ml-2">(PDF, DOCX, or TXT)</span>
              </label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="cursor-pointer"
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
              <label className="block text-sm font-medium mb-1">Bio</label>
              <Textarea
                rows={8}
                value={details?.bio || ''}
                onChange={(e) => setDetails(prev => prev ? {...prev, bio: e.target.value} : null)}
                placeholder="Describe your professional background and expertise..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={details?.is_public || false}
                onCheckedChange={(checked) => setDetails(prev => prev ? {...prev, is_public: checked} : null)}
              />
              <label className="text-sm font-medium">
                Make my PersonAI public
              </label>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                onClick={handleUpdateAgent} 
                disabled={updatingAgent}
                variant="outline"
              >
                {updatingAgent ? "Updating..." : "Update Agent"}
              </Button>
            </div>
          </div>
        ) : (
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
              <Button
                onClick={handleChatClick}
                className="mt-4 px-6 py-2"
              >
                Chat with My PersonAI
              </Button>
            )}

            {!details?.agent_id && (
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Your PersonAI agent is not set up yet. Please edit your profile to create one.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
