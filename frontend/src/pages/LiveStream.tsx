import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, MessageCircle, Zap, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

// TypeScript Tipleri
interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  isSystem?: boolean;
}

export default function LiveStream() {
  // --- 1. SAHTE VERİLER (KOD İÇİNE GÖMÜLÜ) ---
  const [products, setProducts] = useState<Product[]>([
    {
      product_id: "1",
      name: "Amazing Spider-Man #300",
      description: "Venom'un ilk tam görünümü! Todd McFarlane imzalı, 9.8 CGC sertifikalı efsanevi sayı.",
      price: 1250,
      stock_quantity: 1, 
      image_url: "/spider.jpg" 
    }
  ]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoId = "4n2PcFg2qJY";

  // --- 2. SAHTE CHAT SİMÜLASYONU ---
  useEffect(() => {
    const users = ["ComicsFan99", "SpideyLover", "Collector_TR", "MintCondition", "IronManFan"];
    const comments = ["Fiyat çok iyi!", "Kargo bedava mı?", "CGC sertifikalı mı?", "Kutusunda ezik var mı?", "CLAIM!", "Kaçmaz bu parça"];
    
    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      
      setMessages(prev => {
        const newMsg = { id: Date.now(), user: randomUser, message: randomComment };
        const newArr = [...prev, newMsg];
        return newArr.slice(-50);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mesaj gelince aşağı kaydır
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- 3. SATIN ALMA İŞLEMİ ---
  const handleBuy = (product: Product) => {
    if (product.stock_quantity > 0) {
        // Konfeti Patlat
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#22c55e', '#ffffff'] // Mor, Yeşil, Beyaz
        });
        
        // Chat'e Yaz
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          user: "SİSTEM", 
          message: `🏆 ${product.name} SATILDI!`, 
          isSystem: true 
        }]);

        // Stoğu Düşür (Tükendi yazması için)
        setProducts(prev => prev.map(p => 
            p.product_id === product.product_id ? { ...p, stock_quantity: 0 } : p
        ));
    }
  };

  const activeProduct = products.find(p => p.stock_quantity > 0) || products[0];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] space-y-4 p-2 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-red-800 tracking-tighter">
            PHD LIVE AUCTION 🔴
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">Collectables estd. 2017</p>
        </div>
        <Badge className="h-10 px-4 md:px-6 text-sm bg-red-600 text-white hover:bg-red-700 animate-pulse border-none">
          <Radio className="mr-2 h-4 w-4" />
          CANLI YAYIN
        </Badge>
      </div>

      {/* ANA İÇERİK - BURAYI GÜNCELLEDİM (md:grid-cols-3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
        
        {/* SOL: VIDEO (2/3 Genişlik) */}
        <div className="md:col-span-2 bg-black rounded-xl overflow-hidden shadow-2xl relative h-full min-h-[300px]">
           <iframe 
              className="w-full h-full absolute inset-0 object-cover"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0`} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border-l-4 border-purple-500 z-10 hidden md:block">
              <h3 className="text-purple-400 font-bold text-lg">Amazing Spider-Man #300</h3>
              <p className="text-white text-sm">Todd McFarlane İmzalı • 9.8 CGC</p>
            </div>
        </div>

        {/* SAĞ: ÜRÜN & CHAT (1/3 Genişlik) */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          
          {/* ÜRÜN KARTI */}
          <Card className="p-4 border-2 border-purple-200 shadow-lg bg-white shrink-0">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="border-purple-500 text-purple-600 animate-pulse">
                <Zap className="w-3 h-3 mr-1" /> ŞU AN SATIŞTA
              </Badge>
              <div className="text-right">
                <p className="text-xs text-gray-500">Güncel Fiyat</p>
                <p className="text-3xl font-black text-green-600">${activeProduct?.price}</p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
               <div className="w-20 h-28 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                 <img 
                   src={activeProduct?.image_url} 
                   className="w-full h-full object-cover"
                 />
               </div>
               <div>
                 <h3 className="font-bold leading-tight mb-1 text-gray-900 text-sm">{activeProduct?.name}</h3>
                 <p className="text-xs text-gray-500 line-clamp-2">{activeProduct?.description}</p>
               </div>
            </div>

            <Button 
              size="lg" 
              className={`w-full font-bold text-lg h-12 transition-all ${
                activeProduct?.stock_quantity > 0 
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={() => handleBuy(activeProduct)}
              disabled={activeProduct?.stock_quantity === 0}
            >
              {activeProduct?.stock_quantity > 0 ? "⚡ HEMEN AL " : " TÜKENDİ"}
            </Button>
          </Card>

          {/* CHAT KARTI */}
          <Card className="flex-1 flex flex-col overflow-hidden border border-gray-200 bg-gray-50 min-h-0">
            <div className="p-3 border-b bg-white flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-sm text-gray-800">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                Sohbet
              </h3>
              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                {messages.length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-sm border ${
                      msg.isSystem 
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700 font-bold text-center"
                        : "bg-white border-gray-100 shadow-sm"
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-purple-700">@{msg.user}</span>
                      </div>
                    )}
                    <p className="text-gray-700 text-xs">{msg.message}</p>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            
            <div className="p-2 bg-white border-t">
                <input 
                  type="text" 
                  placeholder="Yaz..." 
                  className="w-full bg-gray-100 border-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}