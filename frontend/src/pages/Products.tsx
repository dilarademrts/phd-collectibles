import { useState, useEffect } from 'react';
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
  // Verileri artık boş başlatıyoruz, backend dolduracak
  const [products, setProducts] = useState<Product[]>([]);

  // BACKEND BAĞLANTISI (Sihirli Kısım Burası 🪄)
  useEffect(() => {
    // Backend portun 5001 olarak ayarlıydı
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Backend'den gelen veriler:", data);
        setProducts(data);
      })
      .catch((error) => {
        console.error("❌ Veri çekme hatası:", error);
      });
  }, []);

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

      {/* KPI KARTLARI (Backend verisine göre otomatik hesaplar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
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
              {products.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                     Loading products from backend...
                   </TableCell>
                 </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-2xl">{product.image || "📦"}</TableCell>
                    <TableCell>
                      <div className="font-bold">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.id}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{product.category || "General"}</Badge></TableCell>
                    <TableCell className="font-mono font-medium">${Number(product.price).toLocaleString()}</TableCell>
                    <TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}