"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// hook เดียวใช้ทั้งเช็ค login และเช็คว่าเป็นแอดมินจริง (มีแถวใน admin_users)
export function useAdminSession() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function check(currentSession) {
      if (!currentSession) {
        if (active) {
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", currentSession.user.id)
        .maybeSingle();

      if (!active) return;
      setSession(currentSession);
      setIsAdmin(!!data && !error);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => check(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setLoading(true);
      check(newSession);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { loading, session, isAdmin };
}
