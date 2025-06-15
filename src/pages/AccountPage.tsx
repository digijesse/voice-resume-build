
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuthState } from "../hooks/useAuthState";

interface AccountDetails {
  first_name: string;
  last_name?: string | null;
  email: string;
  avatar_url?: string | null;
  resume_url?: string | null;
  is_public?: boolean;
}

export default function AccountPage() {
  const { user } = useAuthState();
  const [details, setDetails] = useState<AccountDetails | null>(null);

  useEffect(() => {
    // TODO: Load account info from supabase
    if (user) {
      setDetails({
        email: user.email || "",
        first_name: "Your First Name",
        last_name: "",
        avatar_url: null,
        resume_url: null,
        is_public: true,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto pt-24 text-center text-muted-foreground">
          Please sign in to view your PersonAI account.
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
              "https://api.dicebear.com/7.x/thumbs/svg?seed=Account"
            }
            className="w-28 h-28 rounded-full bg-muted border mb-2"
            alt="My PersonAI Avatar"
            draggable={false}
          />
          <div className="text-lg font-semibold">{details?.first_name}</div>
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
          <div className="w-full mt-4">
            <div className="text-left font-medium mb-1">Your Resume:</div>
            {details?.resume_url ? (
              <a
                href={details.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                View Resume
              </a>
            ) : (
              <span className="italic text-muted-foreground">No resume uploaded yet.</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
