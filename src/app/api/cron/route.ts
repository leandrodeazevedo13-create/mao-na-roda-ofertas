import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: "Robo configurado! Vai rodar 08h e 18h",
    stores: ["Shibata","Maximo","Conde","Semar","Tenda","Mana","Pit Stop"],
    test: "Acesse /api/cron agora pra rodar manual"
  });
}