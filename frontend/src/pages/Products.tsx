import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus, Search } from "lucide-react";

type UiProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft";
  imageUrl: string | null;
  categoryId: string | null;
};

type EditForm = {
  id: string;
  name: string;
  price: string; // input string
  stock: string; // input string
  categoryId: string; // uuid or ""
  imageUrl: string; // url or ""
};

type CreateForm = {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
};

export default function Products() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");

  // EDIT
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState<EditForm | null>(null);

  // CREATE
  const [createOpen, setCreateOpen] = useState(false);
  const [create, setCreate] = useState<CreateForm>({
    name: "",
    price: "",
    stock: "0",
    categoryId: "",
    imageUrl: "",
  });

  const productsQ = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products(),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setCreateOpen(false);
      setCreate({ name: "", price: "", stock: "0", categoryId: "", imageUrl: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditOpen(false);
      setEdit(null);
    },
  });

  // API -> UI map
  const products: UiProduct[] = useMemo(() => {
    const raw = productsQ.data ?? [];
    return raw.map((p) => ({
      id: p.product_id,
      name: p.name,
      category: (p as any).category ?? "Uncategorized",
      price: Number(p.price ?? 0),
      stock: Number(p.stock_quantity ?? 0),
      status: "active",
      imageUrl: (p as any).image_url ?? null,
      categoryId: (p as any).category_id ?? null,
    }));
  }, [productsQ.data]);

  const filteredProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(s) ||
        (p.id ?? "").toLowerCase().includes(s) ||
        (p.category ?? "").toLowerCase().includes(s)
    );
  }, [products, search]);

  // KPI
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 3).length;
  const soldOutProducts = products.filter((p) => p.stock === 0).length;

  function openEdit(product: UiProduct) {
    setEdit({
      id: product.id,
      name: product.name,
      price: String(product.price ?? 0),
      stock: String(product.stock ?? 0),
      categoryId: product.categoryId ?? "",
      imageUrl: product.imageUrl ?? "",
    });
    setEditOpen(true);
  }

  function saveEdit() {
    if (!edit) return;

    const price = Number(edit.price);
    const stock = Number(edit.stock);

    if (!edit.name.trim()) return alert("Name is required.");
    if (Number.isNaN(price) || price < 0) return alert("Price must be a valid number (>= 0).");
    if (!Number.isInteger(stock) || stock < 0)
      return alert("Stock must be a valid integer (>= 0).");

    updateMutation.mutate({
      id: edit.id,
      payload: {
        name: edit.name.trim(),
        price,
        stock_quantity: stock,
        category_id: edit.categoryId.trim() ? edit.categoryId.trim() : null,
        image_url: edit.imageUrl.trim() ? edit.imageUrl.trim() : null,
        description: null,
      },
    });
  }

  function saveCreate() {
    const name = create.name.trim();
    const price = Number(create.price);
    const stock = Number(create.stock);

    if (!name) return alert("Name is required.");
    if (Number.isNaN(price) || price < 0) return alert("Price must be a valid number (>= 0).");
    if (!Number.isInteger(stock) || stock < 0)
      return alert("Stock must be a valid integer (>= 0).");

    createMutation.mutate({
      name,
      price,
      stock_quantity: stock,
      category_id: create.categoryId.trim() ? create.categoryId.trim() : null,
      image_url: create.imageUrl.trim() ? create.imageUrl.trim() : null,
      description: null,
    });
  }

  const busy = productsQ.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>

        <Button onClick={() => setCreateOpen(true)} disabled={busy}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsQ.isLoading ? "—" : totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsQ.isLoading ? "—" : lowStockProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsQ.isLoading ? "—" : soldOutProducts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>View and manage your products</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-8 bg-background/50"
              />
            </div>
          </div>

          {productsQ.isError && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              Failed to load products: {String(productsQ.error)}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {productsQ.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>

                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>

                    <TableCell>
                      <span className={product.stock < 5 ? "text-orange-600 font-medium" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(product)}
                        disabled={busy}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"?`)) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        disabled={busy}
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={(v) => !createMutation.isPending && setCreateOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product and save to database.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <Input
                value={create.name}
                onChange={(e) => setCreate({ ...create, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Price</div>
                <Input
                  inputMode="decimal"
                  value={create.price}
                  onChange={(e) => setCreate({ ...create, price: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Stock</div>
                <Input
                  inputMode="numeric"
                  value={create.stock}
                  onChange={(e) => setCreate({ ...create, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Category ID (optional)</div>
              <Input
                value={create.categoryId}
                onChange={(e) => setCreate({ ...create, categoryId: e.target.value })}
                placeholder="uuid..."
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Image URL (optional)</div>
              <Input
                value={create.imageUrl}
                onChange={(e) => setCreate({ ...create, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {createMutation.isError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                Create failed: {String(createMutation.error)}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => !createMutation.isPending && setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>

            <Button onClick={saveCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={(v) => !updateMutation.isPending && setEditOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product fields and save.</DialogDescription>
          </DialogHeader>

          {!edit ? (
            <div className="text-sm text-muted-foreground">No product selected.</div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Name</div>
                <Input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Price</div>
                  <Input
                    inputMode="decimal"
                    value={edit.price}
                    onChange={(e) => setEdit({ ...edit, price: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">Stock</div>
                  <Input
                    inputMode="numeric"
                    value={edit.stock}
                    onChange={(e) => setEdit({ ...edit, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Category ID (optional)</div>
                <Input
                  value={edit.categoryId}
                  onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}
                  placeholder="uuid..."
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Image URL (optional)</div>
                <Input
                  value={edit.imageUrl}
                  onChange={(e) => setEdit({ ...edit, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {updateMutation.isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                  Update failed: {String(updateMutation.error)}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                if (!updateMutation.isPending) {
                  setEditOpen(false);
                  setEdit(null);
                }
              }}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>

            <Button onClick={saveEdit} disabled={!edit || updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
