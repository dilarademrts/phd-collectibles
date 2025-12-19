export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

async function json<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export const api = {
  // analytics
  kpis: () => json<{ today_sales_total: any; completed_orders_today: any; low_stock_count: any }>(
    "/analytics/kpis"
  ),
  salesDaily: (days = 7) =>
    json<Array<{ day: string; total: any }>>(`/analytics/sales-daily?days=${days}`),
  stockByCategory: () =>
    json<Array<{ category: string; stock_total: any }>>("/analytics/stock-by-category"),

  // orders
  orders: () => json<any[]>("/orders"),
  completeOrder: (id: string) => json(`/orders/${id}/complete`, { method: "PATCH" }),
  ordersSummary: () => json<Record<string, number>>("/orders/summary"),

  // products
  products: () => json<Array<{ product_id: string; name: string; price: any; stock_quantity: any }>>("/products"),


  // invoices download
  async downloadInvoice(orderId: string) {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`);
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // live
  startLive: (payload: { stream_platform: string; stream_id: string }) =>
    json<{ message: string; live: { live_sale_id: string } }>("/live/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  claim: (payload: { live_sale_id: string; user: string; product_id: string }) =>
    json("/live/claim", { method: "POST", body: JSON.stringify(payload) }),
};
