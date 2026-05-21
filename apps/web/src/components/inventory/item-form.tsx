"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Electronics", "Furniture", "Clothing", "Food", "Books", "Other"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
});

export type Item = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: string;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  item?: Item | null;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function ItemForm({
  item,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name ?? "",
      description: item?.description ?? "",
      category: item?.category ?? "",
      price: item ? Number(item.price) : 0,
      quantity: item?.quantity ?? 0,
    },
  });

  useEffect(() => {
    if (open && item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        category: item.category,
        price: Number(item.price),
        quantity: item.quantity,
      });
      setImageUrl(item.imageUrl ?? "");
    }
  }, [open, item, form]);

  async function handleImageUpload(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File too large — max 4MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setSaving(true);
    try {
      const url = item ? `/api/items/${item.id}` : "/api/items";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, description: data.description ?? "", imageUrl }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");
      toast.success(item ? "Item updated" : "Item created");
      handleOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
    if (!open) {
      form.reset();
      setImageUrl("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 grid gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && (
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-20 resize-none rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors focus-visible:ring-1"
                />
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Category</FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  )}
                </Field>
              )}
            />
          </div>

          <Field>
            <FieldLabel>Image</FieldLabel>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => document.getElementById("image-input")?.click()}
              >
                {uploading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <UploadIcon className="size-4" />
                )}
                {uploading ? "Uploading..." : "Choose file"}
              </Button>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              {imageUrl && (
                <span className="truncate text-xs text-muted-foreground">Image ready</span>
              )}
            </div>
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="mt-1 h-20 w-20 rounded object-cover" />
            ) : (
              !uploading && (
                <div className="mt-1 flex h-20 w-20 items-center justify-center rounded border">
                  <ImageIcon className="size-6 text-muted-foreground" />
                </div>
              )
            )}
            {uploading && (
              <div className="mt-1 flex h-20 w-20 items-center justify-center rounded border">
                <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </Field>

          <div className={cn("flex justify-end gap-2", item && "mt-2")}>
            <DialogClose>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : item ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
