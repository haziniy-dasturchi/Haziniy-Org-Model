import { createClient } from "@supabase/supabase-js";

let _cachedClient: ReturnType<typeof createClient> | null = null;

export function getSyncSupabaseClient() {
  if (_cachedClient) return _cachedClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://ctkkyqokpfspejvwkxtq.supabase.co";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0a2t5cW9rcGZzcGVqdndreHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTIwMzksImV4cCI6MjEwNTM2ODAzOX0.ObXuP-ewibpcJg_rlmseod6cIBIGizbuJo7_FbIo12E";

  if (!url || !key) return null;

  try {
    _cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return _cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client for sync:", err);
    return null;
  }
}

export async function fetchStoreSnapshotFromSupabase(): Promise<any | null> {
  const sb = getSyncSupabaseClient();
  if (!sb) return null;

  try {
    const { data, error } = await (sb as any)
      .from("ai_recommendations")
      .select("id, recommendation_text, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.warn("Could not fetch store snapshot from Supabase:", error.message);
      return null;
    }

    if (!data || (data as any[]).length === 0) return null;

    for (const row of (data as any[])) {
      if (row.recommendation_text && typeof row.recommendation_text === "string" && row.recommendation_text.includes("__haziniy_store_sync__")) {
        try {
          const parsed = JSON.parse(row.recommendation_text);
          if (parsed && parsed.__haziniy_store_sync__ && parsed.data) {
            return parsed.data;
          }
        } catch {
          // ignore corrupted row
        }
      }
    }

    return null;
  } catch (err: any) {
    console.warn("fetchStoreSnapshotFromSupabase exception:", err.message);
    return null;
  }
}

export async function pushStoreSnapshotToSupabase(store: any): Promise<boolean> {
  const sb = getSyncSupabaseClient();
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

    const { error } = await (sb as any)
      .from("ai_recommendations")
      .insert({
        recommendation_text: JSON.stringify(payload),
      });

    if (error) {
      console.error("pushStoreSnapshotToSupabase error:", error.message);
      return false;
    }

    // Clean up older snapshots asynchronously (keep latest 3)
    (async () => {
      try {
        const { data: allRows } = await (sb as any)
          .from("ai_recommendations")
          .select("id, recommendation_text, created_at")
          .order("created_at", { ascending: false })
          .limit(30);

        if (allRows && (allRows as any[]).length > 5) {
          const syncRows = (allRows as any[]).filter(
            (r: any) => r.recommendation_text && typeof r.recommendation_text === "string" && r.recommendation_text.includes("__haziniy_store_sync__")
          );
          if (syncRows.length > 3) {
            const idsToDelete = syncRows.slice(3).map((r: any) => r.id);
            await (sb as any).from("ai_recommendations").delete().in("id", idsToDelete);
          }
        }
      } catch {
        // cleanup is non-critical
      }
    })();

    return true;
  } catch (err: any) {
    console.error("pushStoreSnapshotToSupabase exception:", err.message);
    return false;
  }
}
