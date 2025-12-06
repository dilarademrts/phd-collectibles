import { useState } from 'react';
import { Send, TrendingUp, Package, ShoppingCart, AlertTriangle, Sparkles, BarChart3, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // Kullanılmıyorsa çıkarabilirsin
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- SABİT VERİLER (Grafikler vb. için) ---
const predictiveData = [
  { month: 'Jan', actual: 45000, predicted: 47000 },
  { month: 'Feb', actual: 52000, predicted: 54000 },
  { month: 'Mar', actual: 48000, predicted: 51000 },
  { month: 'Apr', actual: 61000, predicted: 58000 },
  { month: 'May', actual: 55000, predicted: 59000 },
  { month: 'Jun', actual: 67000, predicted: 65000 },
  { month: 'Jul', predicted: 72000 },
  { month: 'Aug', predicted: 78000 },
];

const suggestions = [
  {
    icon: TrendingUp,
    title: 'Elimde Spider-Man #300 var',
    description: 'Fiyat analizi ve değerleme',
    badge: 'Değerleme',
    color: 'from-primary to-accent',
  },
  {
    icon: AlertTriangle,
    title: 'Stokta hangi X-Men sayıları var?',
    description: 'Envanter kontrolü',
    badge: 'Stok',
    color: 'from-warning to-destructive',
  },
  {
    icon: ShoppingCart,
    title: 'En pahalı ürün hangisi?',
    description: 'Mağaza içi analiz',
    badge: 'Analiz',
    color: 'from-neon-mint to-neon-blue',
  },
  {
    icon: Package,
    title: 'Yeni başlayanlar için ne önerirsin?',
    description: 'Yatırım tavsiyesi',
    badge: 'Öneri',
    color: 'from-neon-pink to-primary',
  },
];

const autoReports = [
  {
    title: 'Revenue Growth',
    value: '+23.5%',
    trend: 'up',
    insight: 'YoY increase driven by pre-orders',
  },
  {
    title: 'Conversion Rate',
    value: '3.8%',
    trend: 'up',
    insight: 'Live stream sales performing well',
  },
  {
    title: 'Avg Order Value',
    value: '$127',
    trend: 'down',
    insight: 'Consider upsell strategies',
  },
  {
    title: 'Customer Retention',
    value: '68%',
    trend: 'up',
    insight: 'Strong repeat purchase rate',
  },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  // --- STATE TANIMLARI ---
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Selam Kaptan! 👋 Ben Stan. PHD Collectibles'ın yapay zeka beyniyim. Bana koleksiyon parçaları, fiyatlar veya dükkan hakkında her şeyi sorabilirsin! 🕷️",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor durumu eklendi

  // --- GERÇEK BACKEND BAĞLANTISI ---
  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    // 1. Kullanıcı mesajını ekle
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Mevcut mesajlara kullanıcı mesajını ekle
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true); // Yüklemeyi başlat

    try {
      // 2. Backend'e İstek At (Stan'in Beyni)
      const response = await fetch('http://localhost:5001/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });

      const data = await response.json();

      // 3. Stan'in cevabını ekle
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || "Bağlantı hatası! Backend çalışıyor mu dostum? 🔌",
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMessage]);

    } catch (error) {
      console.error("AI Hatası:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Üzgünüm, sunucuya ulaşamıyorum. Lütfen backend terminalini kontrol et! 🤖💥",
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Yüklemeyi bitir
    }
  };

  // Öneriye tıklanınca direkt gönder
  const handleSuggestionClick = (title: string) => {
    handleSend(title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          AI Koleksiyon Uzmanı (Stan)
        </h1>
        <p className="text-muted-foreground mt-2">
          Akıllı asistanınız çizgi roman dünyasını analiz ediyor...
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Messages */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Stan ile Sohbet
              </CardTitle>
              <CardDescription>Doğal dilde sorular sorun (Örn: Batman #251 ne kadar?)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                          : 'glass-panel border border-border/50 bg-secondary/10'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Yükleniyor Animasyonu */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass-panel border border-border/50 bg-secondary/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Stan'e bir şeyler sor..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="glow-border resize-none"
                  rows={2}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-auto px-6"
                >
                  {isLoading ? <span className="animate-spin">⏳</span> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Sales Chart (Burası görsel olarak kalabilir, demoda güzel durur) */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-neon-mint" />
                Gelecek Ay Tahmini (AI)
              </CardTitle>
              <CardDescription>Gemini Destekli Gelir Tahmini</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictiveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--neon-mint))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--neon-mint))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Gerçekleşen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon-mint" />
                  <span className="text-sm text-muted-foreground">AI Tahmini</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Suggestions - Bunları güncelledim */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Hızlı Sorular
              </CardTitle>
              <CardDescription>Stan'e şunları sorabilirsin:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.title)}
                  className="w-full text-left p-3 rounded-lg glass-panel border border-border/50 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${suggestion.color} bg-opacity-20`}>
                      <suggestion.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Auto-Generated Reports */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-neon-pink" />
                Otomatik Raporlar
              </CardTitle>
              <CardDescription>Günlük Özet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {autoReports.map((report, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg glass-panel border border-border/50 hover:border-accent/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{report.title}</p>
                    <span
                      className={`text-lg font-bold ${
                        report.trend === 'up' ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {report.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.insight}</p>
                  <div className="mt-2">
                    <Badge
                      variant={report.trend === 'up' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {report.trend === 'up' ? '↑ Artış' : '↓ Düşüş'}
                    </Badge>
                  </div>
                </div>
              ))} 
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}