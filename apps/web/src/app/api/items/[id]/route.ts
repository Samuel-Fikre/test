import { NextRequest, NextResponse } from "next/server";
import { db, items } from "@inventory/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  price: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

type Params = Promise<{ id: string }>;

export async function PUT(request: NextRequest, props: { params: Params }) {
  try {
    const { id } = paramsSchema.parse(await props.params);
    const body = await request.json();
    const parsed = updateItemSchema.parse(body);

    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { price, ...rest } = parsed;
    const updateData = {
      ...rest,
      ...(price !== undefined && { price: String(price) }),
    };

    const [item] = await db.update(items).set(updateData).where(eq(items.id, id)).returning();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
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
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Params }) {
  try {
    const { id } = paramsSchema.parse(await props.params);

    const [item] = await db.delete(items).where(eq(items.id, id)).returning();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
