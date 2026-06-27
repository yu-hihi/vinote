import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType || "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `このワインボトルの画像を分析し、以下の情報をJSON形式で返してください。
情報が読み取れない場合は空文字にしてください。

{
  "name": "ワイン名",
  "producer": "生産者名",
  "vintage": "収穫年（数字のみ）",
  "region": "生産国・地域",
  "grape": "ブドウ品種"
}

JSONのみを返し、他のテキストは含めないでください。`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const json = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ success: true, wine: json });
  } catch {
    return NextResponse.json({ success: false, wine: {} });
  }
}
