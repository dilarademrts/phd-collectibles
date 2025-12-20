import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, Layers } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
const CATEGORY_COLORS = ["#8b5cf6", "#22c55e", "#06b6d4", "#f97316", "#ef4444"];

export default function Dashboard() {
  const kpisQ = useQuery({ queryKey: ["kpis"], queryFn: api.kpis });
  const salesQ = useQuery({
    queryKey: ["sales-daily", 7],
    queryFn: () => api.salesDaily(7),
  });
  const stockQ = useQuery({
    queryKey: ["stock-by-category"],
    queryFn: api.stockByCategory,
  });

  const k = kpisQ.data ?? { today_sales_total: 0, completed_orders_today: 0, low_stock_count: 0 };

  const salesData = (salesQ.data ?? []).map((x: any) => ({
    day: new Date(x.day).toLocaleDateString(),
    total: Number(x.total ?? 0),
  }));

  const stockData = (stockQ.data ?? []).map((x: any) => ({
    category: x.category,
    stock_total: Number(x.stock_total ?? 0),
  }));

  const loading = kpisQ.isLoading || salesQ.isLoading || stockQ.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Live admin overview (from DB).</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(k.today_sales_total ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Sum of completed orders today</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(k.completed_orders_today ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Orders completed today</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(k.low_stock_count ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Products stock &lt;= 3</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
    <AlertTriangle className="h-4 w-4 text-destructive" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{Number((k as any).out_of_stock_count ?? 0)}</div>
    <p className="text-xs text-muted-foreground">Stock = 0</p>
  </CardContent>
</Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layers className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : stockData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockData} dataKey="stock_total" nameKey="category" outerRadius={90} label>
                      {stockData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
