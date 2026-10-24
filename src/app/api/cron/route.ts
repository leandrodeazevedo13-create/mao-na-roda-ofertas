import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ ok: true, robo: "Mão na Roda ativo 2x ao dia - Shibata+Maximo+Conde" });
}