import { checkSupabaseHealth } from "@/lib/supabase/health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseIsHealthy = await checkSupabaseHealth();

    return Response.json(
      {
        status: supabaseIsHealthy ? "ok" : "degraded",
        services: {
          application: "ok",
          supabase: supabaseIsHealthy ? "ok" : "unavailable",
        },
      },
      { status: supabaseIsHealthy ? 200 : 503 },
    );
  } catch {
    return Response.json(
      {
        status: "degraded",
        services: {
          application: "ok",
          supabase: "unavailable",
        },
      },
      { status: 503 },
    );
  }
}
