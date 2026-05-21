import { NextRequest, NextResponse } from "next/server";
import { db, items } from "@inventory/db";
import { desc } from "drizzle-orm";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().optional().default(""),
});

export async function GET() {
  try {
    const allItems = await db.select().from(items).orderBy(desc(items.createdAt));

    return NextResponse.json(allItems);
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createItemSchema.parse(body);

    const [item] = await db
      .insert(items)
      .values({
        name: parsed.name,
        description: parsed.description,
        category: parsed.category,
        price: String(parsed.price),
        quantity: parsed.quantity,
        imageUrl: parsed.imageUrl,
      })
      .returning();

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
