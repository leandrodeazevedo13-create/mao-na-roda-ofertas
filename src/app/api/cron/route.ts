// web/src/app/api/cron/route.ts - Endpoint que a Vercel chama 2x ao dia
import { NextResponse } from "next/server";
import { runAllRobots } from "@/../extract_TODOS_ROBOS";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos

export async function GET(req: Request) {
  // Proteção: só roda se tiver secret na URL ou se for Vercel Cron
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    // Em prod exige secret, mas permite Vercel Cron via header
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("🤖 Cron iniciado 2x ao dia - Mão na Roda");
    const total = await runAllRobots();
    return NextResponse.json({ ok: true, total, ranAt: new Date().toISOString(), stores: ["Shibata","Máximo","Conde","Semar","Tenda","Maná","Pit Stop"] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
