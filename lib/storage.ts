import { createClient } from "./supabase/client";
import { WineRecord } from "./types";

// Supabase の行 → WineRecord
function rowToRecord(row: Record<string, unknown>): WineRecord {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    producer: (row.producer as string) ?? "",
    region: (row.region as string) ?? "",
    grape: (row.grape as string) ?? "",
    vintage: (row.vintage as string) ?? "",
    color: (row.color as WineRecord["color"]) ?? null,
    sparkling: (row.sparkling as boolean) ?? false,
    aromas: (row.aromas as string[]) ?? [],
    taste: (row.taste as WineRecord["taste"]) ?? { sweetness: 0, acidity: 0, finish: 0, tannin: 0, body: 0 },
    rating: (row.rating as number) ?? 0,
    pairing: (row.pairing as string) ?? "",
    notes: (row.notes as string) ?? "",
    illustrationUrl: (row.illustration_url as string) ?? undefined,
    originalImageBase64: (row.original_image_base64 as string) ?? undefined,
    originalImageMime: (row.original_image_mime as string) ?? undefined,
    createdAt: (row.created_at as string) ?? undefined,
  };
}

// WineRecord → Supabase INSERT/UPDATE 用オブジェクト
function recordToRow(record: WineRecord, userId: string) {
  return {
    ...(record.id ? { id: record.id } : {}),
    user_id: userId,
    name: record.name,
    producer: record.producer,
    region: record.region,
    grape: record.grape,
    vintage: record.vintage,
    color: record.color ?? null,
    sparkling: record.sparkling ?? false,
    aromas: record.aromas,
    taste: record.taste,
    rating: record.rating,
    pairing: record.pairing,
    notes: record.notes ?? "",
    illustration_url: record.illustrationUrl ?? null,
    original_image_base64: record.originalImageBase64 ?? null,
    original_image_mime: record.originalImageMime ?? null,
  };
}

export async function loadRecords(): Promise<WineRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wine_records")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToRecord);
}

export async function saveRecord(record: WineRecord): Promise<WineRecord> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const row = recordToRow(record, user.id);
  const { data, error } = await supabase
    .from("wine_records")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return rowToRecord(data);
}

export async function getRecord(id: string): Promise<WineRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wine_records")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToRecord(data);
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("wine_records").delete().eq("id", id);
  if (error) throw error;
}
