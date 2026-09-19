import { createClient } from "@supabase/supabase-js";

const VALID_FALLBACK_URL = "https://ctkkyqokpfspejvwkxtq.supabase.co";
const VALID_FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0a2t5cW9rcGZzcGVqdndreHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTIwMzksImV4cCI6MjEwNTM2ODAzOX0.ObXuP-ewibpcJg_rlmseod6cIBIGizbuJo7_FbIo12E";

export let lastSupabaseSyncError: string | null = null;

export function getSyncSupabaseClient(forceFallback = false) {
  const url = forceFallback
    ? VALID_FALLBACK_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || VALID_FALLBACK_URL;

  const key = forceFallback
    ? VALID_FALLBACK_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      VALID_FALLBACK_KEY;

  if (!url || !key) return null;

  try {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err: any) {
    lastSupabaseSyncError = "Client creation failed: " + err.message;
    console.error("Failed to initialize Supabase client for sync:", err);
    return null;
  }
}

export async function fetchStoreSnapshotFromSupabase(): Promise<any | null> {
  let sb = getSyncSupabaseClient();
  if (!sb) return null;

  try {
    let { data, error } = await (sb as any)
      .from("ai_recommendations")
      .select("id, recommendation_text, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // If initial query errored, retry with verified direct fallback
    if (error) {
      lastSupabaseSyncError = "Query error: " + error.message;
      console.warn("Retrying fetchStoreSnapshotFromSupabase with verified key:", error.message);
      const fallbackSb = getSyncSupabaseClient(true);
      if (fallbackSb) {
        const retry = await (fallbackSb as any)
          .from("ai_recommendations")
          .select("id, recommendation_text, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      lastSupabaseSyncError = "Final error: " + error.message;
      return null;
    }

    if (!data || (data as any[]).length === 0) {
      lastSupabaseSyncError = "Empty data returned";
      return null;
    }

    for (const row of (data as any[])) {
      if (
        row.recommendation_text &&
        typeof row.recommendation_text === "string" &&
        row.recommendation_text.includes("__haziniy_store_sync__")
      ) {
        try {
          const parsed = JSON.parse(row.recommendation_text);
          if (parsed && parsed.__haziniy_store_sync__ && parsed.data) {
            lastSupabaseSyncError = null;
            return parsed.data;
          }
        } catch {
          // ignore corrupted row
        }
      }
    }

    lastSupabaseSyncError = "No valid __haziniy_store_sync__ row found in top 10";
    return null;
  } catch (err: any) {
    lastSupabaseSyncError = "Exception: " + err.message;
    console.warn("fetchStoreSnapshotFromSupabase exception:", err.message);
    return null;
  }
}

export async function pushStoreSnapshotToSupabase(store: any): Promise<boolean> {
  let sb = getSyncSupabaseClient();
  if (!sb) return false;

  try {
    const payload = {
      __haziniy_store_sync__: true,
      version: Date.now(),
      updated_at: new Date().toISOString(),
      departmentsCount: store.departments ? store.departments.length : 0,
      positionsCount: store.positions ? store.positions.length : 0,
      employeesCount: store.employees ? store.employees.length : 0,
      data: store,
    };

    let { error } = await (sb as any).from("ai_recommendations").insert({
      recommendation_text: JSON.stringify(payload),
    });

    if (error) {
      console.warn("Retrying pushStoreSnapshotToSupabase with verified key:", error.message);
      const fallbackSb = getSyncSupabaseClient(true);
      if (fallbackSb) {
        const retry = await (fallbackSb as any).from("ai_recommendations").insert({
          recommendation_text: JSON.stringify(payload),
        });
        error = retry.error;
      }
    }

    if (error) {
      lastSupabaseSyncError = "Push error: " + error.message;
      console.error("pushStoreSnapshotToSupabase error:", error.message);
      return false;
    }

    // Clean up older snapshots asynchronously (keep latest 5)
    (async () => {
      try {
        const client = getSyncSupabaseClient() || getSyncSupabaseClient(true);
        if (!client) return;
        const { data: allRows } = await (client as any)
          .from("ai_recommendations")
          .select("id, recommendation_text, created_at")
          .order("created_at", { ascending: false })
          .limit(30);

        if (allRows && (allRows as any[]).length > 8) {
          const syncRows = (allRows as any[]).filter(
            (r: any) =>
              r.recommendation_text &&
              typeof r.recommendation_text === "string" &&
              r.recommendation_text.includes("__haziniy_store_sync__")
          );
          if (syncRows.length > 5) {
            const idsToDelete = syncRows.slice(5).map((r: any) => r.id);
            await (client as any).from("ai_recommendations").delete().in("id", idsToDelete);
          }
        }
      } catch {
        // cleanup is non-critical
      }
    })();

    lastSupabaseSyncError = null;
    return true;
  } catch (err: any) {
    lastSupabaseSyncError = "Push exception: " + err.message;
    console.error("pushStoreSnapshotToSupabase exception:", err.message);
    return false;
  }
}
