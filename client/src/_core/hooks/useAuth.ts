import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type AppUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  whatsapp: string | null;
  role: string;
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (!session) {
          if (mounted) { setUser(null); setLoading(false); }
          return;
        }

        // Fetch user row from our public.users table — try openId first, then email
        const openId = `supabase_${session.user.id}`;
        let { data, error } = await supabase
          .from("users")
          .select("id, openId, name, email, whatsapp, role")
          .eq("openId", openId)
          .single();

        // Fallback: match by email and update openId
        if ((error || !data) && session.user.email) {
          const { data: emailMatch } = await supabase
            .from("users")
            .select("id, openId, name, email, whatsapp, role")
            .eq("email", session.user.email)
            .single();

          if (emailMatch) {
            // Update the openId to match Supabase Auth
            await supabase
              .from("users")
              .update({ openId })
              .eq("email", session.user.email);
            data = { ...emailMatch, openId };
            error = null;
          }
        }

        if (mounted) {
          if (data && !error) {
            setUser(data as AppUser);
          } else {
            // Row not synced yet — use session data with default role
            setUser({
              id: 0,
              openId,
              name: session.user.user_metadata?.name ?? null,
              email: session.user.email ?? null,
              whatsapp: session.user.user_metadata?.whatsapp ?? null,
              role: "user",
            });
          }
          setLoading(false);
        }
      } catch {
        if (mounted) { setUser(null); setLoading(false); }
      }
    }

    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; max-age=0";
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    loading,
    error: null,
    isAuthenticated: !!user,
    refresh: () => {},
    logout,
  };
}
