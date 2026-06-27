import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { wineInfo, imageBase64, mimeType } = await req.json();
    const { name, producer, vintage, region, grape } = wineInfo;

    let detailedDescription = "";

    // Step 1: Claude Visionでボトルを詳細に描写
    if (imageBase64) {
      const visionRes = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType || "image/jpeg", data: imageBase64 },
              },
              {
                type: "text",
                text: `Describe this wine bottle in extreme detail in English, as instructions for an illustrator.
Include ALL of the following:
- Bottle shape, glass color, overall silhouette
- Foil/capsule color and texture at the top
- Label background color, shape, and size
- ONLY the text that is LITERALLY VISIBLE on the label — copy each word exactly as printed, do NOT add, infer, or translate any text
- Logo, crest, coat of arms, animals, crown: describe shape, color, position precisely
- Gold/metallic stripe details
- Any secondary labels and their exact text

CRITICAL RULES:
- Do NOT add any text that is not physically printed on the label
- Do NOT infer wine type (e.g. do NOT write "White Wine", "Red Wine" unless those exact words appear on the label)
- Ignore background, hands, and anything other than the bottle itself
- Reply in English description only`,
              },
            ],
          },
        ],
      });
      detailedDescription = visionRes.content[0].type === "text" ? visionRes.content[0].text : "";
    }

    // Step 2: 詳細描写を元にgpt-image-1でイラスト生成
    const prompt = `Create a beautiful watercolor illustration of a single wine bottle.
The bottle must exactly match this description:
${detailedDescription || `Wine bottle: "${name}" by ${producer}, ${vintage}, ${region}, ${grape}`}

Requirements:
- Show ONLY the wine bottle, no hands, no table, no other objects
- Background color must be exactly this warm sandy craft paper tone: RGB(212, 176, 122) — #D4B07A
- Full bottle from cork to base, centered
- Reproduce the label text, logo, and design with complete accuracy and clarity
- Style: delicate watercolor painting, soft color washes, hand-drawn brushstrokes
- The label design, colors, and all text must be faithfully reproduced
- The bottle should blend naturally into the warm beige craft paper background`;

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1536",
      quality: "high",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (b64) {
      return NextResponse.json({ success: true, imageUrl: `data:image/png;base64,${b64}` });
    }
    return NextResponse.json({ success: false, error: "画像が生成されませんでした" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-art error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
