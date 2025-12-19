import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, FileText, CheckCircle2, Clock, Search, Filter, Download, Tv, Globe } from 'lucide-react';

// TypeScript Sipariş Tipi
interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: 'Completed' | 'Processing' | 'Cancelled';
  type: 'Live Stream' | 'Store'; // Satışın kaynağı
  date: string;
}

export default function Orders() {
  // SAHTE VERİ (Daha gerçekçi senaryo)
  const [orders] = useState<Order[]>([
    { id: "ORD-2847", customer: "Sarah Johnson", items: "Amazing Spider-Man #300", total: 1250, status: 'Completed', type: 'Live Stream', date: "Just now" },
    { id: "ORD-2846", customer: "Alex Mercer", items: "Incredible Hulk #181", total: 3500, status: 'Processing', type: 'Live Stream', date: "5 mins ago" },
    { id: "ORD-2845", customer: "Mike Ross", items: "Batman #1 (1940)", total: 8000, status: 'Completed', type: 'Store', date: "1 hour ago" },
    { id: "ORD-2844", customer: "Emily Blunt", items: "X-Men #1", total: 5400, status: 'Completed', type: 'Live Stream', date: "2 hours ago" },
    { id: "ORD-2843", customer: "Jenny Doe", items: "Iron Man Helmet", total: 250, status: 'Cancelled', type: 'Store', date: "Yesterday" },
  ]);

  // Fatura İndirme Simülasyonu
  const handleDownloadInvoice = (orderId: string) => {
    // Backend bağlandığında burası gerçek PDF linkine gidecek
    alert(`📄 ${orderId} numaralı siparişin faturası hazırlanıyor...`);
  };

  return (
    <div className="space-y-6">
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-green-500 font-bold">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,400</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 Pending processing</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Needs shipping</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* SİPARİŞ TABLOSU */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of recent orders from all channels.</CardDescription>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search orders, customers..." className="pl-8 bg-background/50" />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-xs text-muted-foreground truncate w-32">{order.items}</div>
                  </TableCell>
                  <TableCell className="font-bold">${order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    {/* Satışın nereden geldiğini gösteren küçük etiketler */}
                    {order.type === 'Live Stream' ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                        <Tv className="w-3 h-3 mr-1" /> Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        <Globe className="w-3 h-3 mr-1" /> Store
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Statüye Göre Renkli Badge */}
                    {order.status === 'Completed' && <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>}
                    {order.status === 'Processing' && <Badge className="bg-blue-600 hover:bg-blue-700">Processing</Badge>}
                    {order.status === 'Cancelled' && <Badge variant="destructive">Cancelled</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={order.status === 'Cancelled'}
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Invoice
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