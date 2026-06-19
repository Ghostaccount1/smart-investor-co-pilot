import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: true, session: null, user: null });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active)
        setState({ loading: false, session: data.session, user: data.session?.user ?? null });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ loading: false, session, user: session?.user ?? null });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
