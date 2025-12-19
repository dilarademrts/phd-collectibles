import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, TrendingUp, Plus, Search, Filter, MoreHorizontal } from 'lucide-react';

// TypeScript Veri Tipi
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft';
  image: string;
}

export default function Products() {
  // SAHTE VERİ (Backend bağlanana kadar)
  const [products] = useState<Product[]>([
    { id: "PROD-001", name: "Amazing Spider-Man #300", category: "Comic", price: 1250, stock: 1, status: 'active', image: "🕷️" },
    { id: "PROD-002", name: "Incredible Hulk #181", category: "Comic", price: 3500, stock: 0, status: 'active', image: "🟢" },
    { id: "PROD-003", name: "Batman #1 (1940)", category: "Comic", price: 8000, stock: 0, status: 'active', image: "🦇" },
    { id: "PROD-004", name: "X-Men #1", category: "Comic", price: 5400, stock: 4, status: 'active', image: "❌" },
    { id: "PROD-005", name: "Iron Man Helmet Prop", category: "Collectibles", price: 250, stock: 12, status: 'active', image: "🤖" },
    { id: "PROD-006", name: "Thor's Hammer (Mjolnir)", category: "Collectibles", price: 400, stock: 8, status: 'draft', image: "🔨" },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* KPI KARTLARI (Dinamik Hale Getirildi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {/* Ürün sayısını dinamik alıyoruz */}
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {/* Stok < 5 olanları sayıyoruz */}
            <div className="text-2xl font-bold text-yellow-500">
              {products.filter(p => p.stock > 0 && p.stock < 5).length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {/* Stok 0 olanları sayıyoruz */}
            <div className="text-2xl font-bold text-red-500">
              {products.filter(p => p.stock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Missed opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* ÜRÜN TABLOSU */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>View and manage all products.</CardDescription>
          
          {/* Arama ve Filtreleme */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8 bg-background/50" />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-2xl">{product.image}</TableCell>
                  <TableCell>
                    <div className="font-bold">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.id}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                  <TableCell className="font-mono font-medium">${product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {/* Stok Durumuna Göre Renkli Badge */}
                    {product.stock === 0 ? (
                      <Badge variant="destructive" className="bg-red-600">Sold Out</Badge>
                    ) : product.stock < 5 ? (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-none">
                        Low Stock ({product.stock})
                      </Badge>
                    ) : (
                      <Badge className="bg-green-600 hover:bg-green-700 border-none">
                        In Stock ({product.stock})
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}