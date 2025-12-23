import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/* =========================
   API CALLS
========================= */
const fetchKpis = async () => {
  const res = await fetch("http://localhost:5001/analytics/kpis");
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
};

const fetchTopProducts = async () => {
  const res = await fetch(
    "http://localhost:5001/product-analytics/top-products"
  );
  if (!res.ok) throw new Error("Failed to fetch top products");
  return res.json();
};

/* =========================
   COMPONENT
========================= */
export default function Analytics() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["kpis"],
    queryFn: fetchKpis,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["top-products"],
    queryFn: fetchTopProducts,
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time business intelligence from live data
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* TODAY REVENUE */}
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺
              {kpisLoading
                ? "—"
                : Number(kpis.today_sales_total).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed orders today
            </p>
          </CardContent>
        </Card>

        {/* COMPLETED ORDERS */}
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Orders Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? "—" : kpis.completed_orders_today}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed today
            </p>
          </CardContent>
        </Card>

        {/* LOW STOCK */}
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock
            </CardTitle>
            <Package className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? "—" : kpis.low_stock_count}
            </div>
            <p className="text-xs text-muted-foreground">
              Stock ≤ 3
            </p>
          </CardContent>
        </Card>

        {/* OUT OF STOCK */}
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Out of Stock
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpisLoading ? "—" : kpis.out_of_stock_count}
            </div>
            <p className="text-xs text-muted-foreground">
              No inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TOP PRODUCTS */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Based on completed orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          {productsLoading && (
            <p className="text-muted-foreground text-center py-6">
              Loading product analytics...
            </p>
          )}

          {!productsLoading && topProducts && (
            <div className="space-y-4">
              {topProducts.map((p: any, i: number) => (
                <div
                  key={p.product_id}
                  className="flex justify-between items-center border-b border-border/40 pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {i + 1}. {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sold: {p.total_sold}
                    </p>
                  </div>
                  <div className="font-semibold text-success">
                    ₺{Number(p.revenue).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
