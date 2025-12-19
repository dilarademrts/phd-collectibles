import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Truck, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Orders() {
  const qc = useQueryClient();

  const ordersQ = useQuery({
    queryKey: ["orders"],
    queryFn: api.orders,
  });

  const summaryQ = useQuery({
    queryKey: ["orders-summary"],
    queryFn: api.ordersSummary,
  });

  const s = summaryQ.data ?? {};

  const completeM = useMutation({
    mutationFn: (id: string) => api.completeOrder(id),
    onSuccess: () => {
      toast.success("Sipariş tamamlandı + fatura oluşturuldu");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders-summary"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      qc.invalidateQueries({ queryKey: ["sales-daily"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Hata"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          Orders Management
        </h1>
        <p className="text-muted-foreground mt-2">Track and manage all customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.pending ?? 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.processing ?? 0}</div>
            <p className="text-xs text-muted-foreground">Being prepared</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-neon-mint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.shipped ?? 0}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.completed ?? 0}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>View and manage all orders</CardDescription>
        </CardHeader>

        <CardContent>
          {ordersQ.isLoading && <p className="text-muted-foreground text-center py-8">Loading...</p>}

          {ordersQ.isError && (
            <p className="text-red-500 text-center py-8">Error: {(ordersQ.error as any).message}</p>
          )}

          {!ordersQ.isLoading && !ordersQ.isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">Order ID</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Total</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(ordersQ.data ?? []).map((o: any) => (
                    <tr key={o.order_id} className="border-b border-border/50">
                      <td className="py-3 px-2 max-w-[220px] truncate">{o.order_id}</td>
                      <td className="py-3 px-2">{o.status}</td>
                      <td className="py-3 px-2">{o.total_amount}</td>
                      <td className="py-3 px-2">{new Date(o.order_date).toLocaleString()}</td>

                      <td className="py-3 px-2 flex gap-2">
                        <Button
                          size="sm"
                          disabled={completeM.isPending}
                          onClick={() => completeM.mutate(o.order_id)}
                        >
                          Complete
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await api.downloadInvoice(o.order_id);
                              toast.success("Fatura indirildi");
                            } catch (e: any) {
                              toast.error(e.message ?? "İndirme hatası");
                            }
                          }}
                        >
                          Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(ordersQ.data ?? []).length === 0 && (
                <p className="text-muted-foreground text-center py-6">Hiç sipariş yok.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
