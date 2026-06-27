import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    const models = await openai.models.list();
    const imageModels = models.data
      .filter((m) => m.id.includes("dall") || m.id.includes("image"))
      .map((m) => m.id);
    return NextResponse.json({ ok: true, imageModels, total: models.data.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message });
  }
}
