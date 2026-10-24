import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: "Robo Mão na Roda ativo!",
    horario: "Roda 08h e 18h BRT",
    mercados: 7,
    total_atual: 95
  });
}