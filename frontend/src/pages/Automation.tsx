import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Eye, Gavel, DollarSign, Play, Square, Ban, MessageSquare, Package, CheckCircle2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Automation() {
  const qc = useQueryClient();

  const [isLive, setIsLive] = useState(false);
  const [liveSaleId, setLiveSaleId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const [chats, setChats] = useState([
    { id: 1, user: "TrollKing99", msg: "Bu fiyatlar ne ya çöp!", risk: "high" as const, isBanned: false },
    { id: 2, user: "SpideyFan", msg: "Hulk ne zaman çıkacak?", risk: "low" as const, isBanned: false },
    { id: 3, user: "RichGuy", msg: "$4000 veririm hemen.", risk: "low" as const, isBanned: false },
    { id: 4, user: "Scammer123", msg: "Bedava nitro için tıkla...", risk: "high" as const, isBanned: false },
  ]);

  // ✅ DB ürünleri
  const productsQ = useQuery({
  queryKey: ["products"],
  queryFn: api.products,
  refetchInterval: 2000,            // 2 saniyede bir yenile
  refetchOnWindowFocus: true,
});


  const products = productsQ.data ?? [];

  const activeProduct = useMemo(
    () => products.find((p) => p.product_id === activeProductId),
    [products, activeProductId]
  );

  const startLiveM = useMutation({
    mutationFn: () => api.startLive({ stream_platform: "Instagram", stream_id: "demo-admin" }),
    onSuccess: (data) => {
      setIsLive(true);
      setLiveSaleId(data.live.live_sale_id);
      toast.success("Yayın başladı");
    },
    onError: (e: any) => toast.error(e.message ?? "Live start hata"),
  });

  const stopLive = () => {
    setIsLive(false);
    setLiveSaleId(null);
    setActiveProductId(null);
    toast.message("Yayın kapatıldı (UI)");
  };

  const claimM = useMutation({
    mutationFn: (payload: { live_sale_id: string; product_id: string }) =>
      api.claim({ live_sale_id: payload.live_sale_id, product_id: payload.product_id, user: "Ali" }),
    onSuccess: (data: any) => {
      toast.success(`Claim OK → Order: ${data?.order?.order_id ?? ""}`);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders-summary"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      qc.invalidateQueries({ queryKey: ["sales-daily"] });
      qc.invalidateQueries({ queryKey: ["stock-by-category"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Claim hata"),
  });

  const pushToLive = (id: string) => setActiveProductId(id);

  const handleBan = (chatId: number) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, isBanned: true } : c)));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
            Live Ops Center
          </h1>
          <p className="text-muted-foreground mt-2">Yayın Akışı ve Mezat Kontrol Paneli (Admin)</p>

          {isLive && liveSaleId && (
            <div className="mt-2 text-xs text-muted-foreground">
              Live Sale ID: <span className="font-mono">{liveSaleId}</span>
            </div>
          )}
        </div>

        <Button
          size="lg"
          onClick={() => {
            if (isLive) stopLive();
            else startLiveM.mutate();
          }}
          disabled={startLiveM.isPending}
          className={`font-bold text-lg px-8 shadow-xl transition-all ${
            isLive ? "bg-red-600 hover:bg-red-700 animate-pulse shadow-red-500/20" : "bg-green-600 hover:bg-green-700 shadow-green-500/20"
          }`}
        >
          {isLive ? (
            <>
              <Square className="mr-2 h-5 w-5 fill-current" /> YAYINI BİTİR
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5 fill-current" /> YAYINI BAŞLAT
            </>
          )}
        </Button>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">İzleyici</CardTitle>
            <Eye className={`h-3 w-3 ${isLive ? "text-neon-mint animate-pulse" : "text-muted"}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black">{isLive ? "1,245" : "-"}</div>
            <p className="text-[10px] text-green-500 font-bold">{isLive ? "+12%" : "Kapalı"}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Teklifler</CardTitle>
            <Gavel className="h-3 w-3 text-warning" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black">{isLive ? "84" : "-"}</div>
            <p className="text-[10px] text-muted-foreground">Dakikada 12</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">Canlı Ciro</CardTitle>
            <DollarSign className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black tracking-tight truncate">$12,450</div>
            <p className="text-[10px] text-muted-foreground">%85 Hedef</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ürünler</CardTitle>
            <Package className="h-3 w-3 text-neon-pink" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl md:text-2xl font-black">{products.length} / {products.length}</div>
            <p className="text-[10px] text-muted-foreground">{isLive ? "Yayında" : "Kapalı"}</p>
          </CardContent>
        </Card>
      </div>

      {/* ANA PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* YAYIN AKIŞI */}
        <Card className="lg:col-span-2 glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" /> Yayın Akışı
            </CardTitle>
            <CardDescription>Sıradaki ürünü seç ve yayına ver.</CardDescription>
          </CardHeader>

          <CardContent>
            {productsQ.isLoading && <p className="text-muted-foreground">Products loading...</p>}
            {productsQ.isError && (
              <p className="text-red-500">Products error: {(productsQ.error as any).message}</p>
            )}

            {!productsQ.isLoading && !productsQ.isError && (
              <div className="space-y-4">
                {products.map((p) => (
                  <div
                    key={p.product_id}
                    className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${
                      activeProductId === p.product_id
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-[1.01]"
                        : "bg-card/30 border-transparent hover:bg-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl md:text-3xl filter drop-shadow-md">📦</span>
                      <div>
                        <h4 className="font-bold text-sm md:text-lg">{p.name}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          ₺{Number(p.price)} • Stock: {Number(p.stock_quantity)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {Number(p.stock_quantity) <= 0 ? (
                        <Badge variant="secondary" className="bg-gray-800 text-gray-400">
                          STOK YOK
                        </Badge>
                      ) : activeProductId === p.product_id ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-600 animate-pulse text-white border-none shadow-lg shadow-red-900/50 whitespace-nowrap">
                            CANLI 🔴
                          </Badge>

                          <Button
                            size="sm"
                            className="font-bold"
                            disabled={!isLive || !liveSaleId || claimM.isPending}
                            onClick={() => {
                              if (!liveSaleId) return toast.error("Önce live başlat");
                              claimM.mutate({ live_sale_id: liveSaleId, product_id: p.product_id });
                            }}
                          >
                            CLAIM TEST
                          </Button>
                        </div>
                      ) : (
                        <Button
                          disabled={!isLive}
                          onClick={() => pushToLive(p.product_id)}
                          size="sm"
                          className={`font-bold transition-all shadow-md min-w-[120px] ${
                            !isLive
                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-[#1e3a8a] hover:bg-[#172554] text-white shadow-blue-900/50"
                          }`}
                        >
                          YAYINA VER
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isLive && liveSaleId && activeProduct && (
              <p className="text-xs text-muted-foreground mt-4">
                Seçili ürün: <span className="font-semibold">{activeProduct.name}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* MODERASYON */}
        <Card className="glass-panel border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Ban className="h-5 w-5" /> Moderasyon
            </CardTitle>
            <CardDescription>Riskli mesajlar (demo).</CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                      chat.isBanned ? "bg-red-900/10 border-red-900/30 opacity-70" : "bg-card/40 border-border/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={`font-bold text-sm ${
                            chat.risk === "high" ? "text-red-400" : "text-foreground"
                          } ${chat.isBanned ? "line-through" : ""}`}
                        >
                          {chat.user}
                        </span>
                      </div>

                      {chat.risk === "high" && !chat.isBanned && (
                        <Badge variant="outline" className="border-red-500 text-red-500 text-[10px]">
                          RİSKLİ
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{chat.msg}</p>

                    {chat.isBanned ? (
                      <div className="flex items-center justify-center gap-2 bg-red-900/20 text-red-500 text-xs font-bold py-2 rounded mt-2">
                        <CheckCircle2 className="w-3 h-3" /> BANLANDI 🚫
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBan(chat.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2 h-7 text-xs font-bold shadow-red-500/20 shadow-md"
                      >
                        ENGELLE
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
