"use client";

import { Loader2Icon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { DeleteDialog } from "@/components/inventory/delete-dialog";
import { ItemForm, type Item } from "@/components/inventory/item-form";
import { ItemsTable } from "@/components/inventory/items-table";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="relative min-h-full overflow-hidden">
      <DotPattern className="opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />
      <div className="container relative mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <ItemForm onSuccess={fetchItems}>
            <Button size="sm">
              <PlusIcon className="mr-1 size-4" />
              Add Item
            </Button>
          </ItemForm>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ItemsTable
              items={items}
              onEdit={(item) => setEditingItem(item)}
              onDelete={(item) => setDeletingItem(item)}
            />

            <ItemForm
              item={editingItem}
              open={editingItem !== null}
              onOpenChange={(open) => {
                if (!open) setEditingItem(null);
              }}
              onSuccess={() => {
                setEditingItem(null);
                fetchItems();
              }}
            />

            <DeleteDialog
              item={deletingItem}
              onSuccess={() => {
                setDeletingItem(null);
                fetchItems();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
