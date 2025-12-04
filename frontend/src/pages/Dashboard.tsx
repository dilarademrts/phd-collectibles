import { DollarSign, ShoppingCart, Package, Clock, TrendingUp, Users } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const kpiData = [
    {
      title: "Total Revenue",
      value: "$124,589",
      change: "+12.5% from last month",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "2,847",
      change: "+8.2% from last month",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Pre-Orders",
      value: "341",
      change: "+23.1% from last month",
      trend: "up" as const,
      icon: Clock,
    },
    {
      title: "Products",
      value: "1,234",
      change: "+4 new this week",
      trend: "up" as const,
      icon: Package,
    },
  ];

  const recentOrders = [
    { id: "#ORD-2847", customer: "Sarah Johnson", amount: "$234.00", status: "Completed", type: "Live" },
    { id: "#PRE-0341", customer: "Michael Chen", amount: "$189.00", status: "Pending", type: "Pre-order" },
    { id: "#ORD-2846", customer: "Emma Williams", amount: "$456.00", status: "Shipped", type: "Regular" },
    { id: "#ORD-2845", customer: "James Brown", amount: "$125.00", status: "Completed", type: "Live" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Overview
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Revenue chart will be displayed here
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Customer Segments
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Customer segmentation chart will be displayed here
          </div>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-4 px-4 font-medium">{order.id}</td>
                    <td className="py-4 px-4">{order.customer}</td>
                    <td className="py-4 px-4 font-semibold">{order.amount}</td>
                    <td className="py-4 px-4">
                      <Badge variant={order.type === "Live" ? "default" : "secondary"}>
                        {order.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          order.status === "Completed"
                            ? "default"
                            : order.status === "Shipped"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
