import { useState } from 'react';
import { Send, TrendingUp, Package, ShoppingCart, AlertTriangle, Sparkles, BarChart3, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    title: 'Top 5 Products Last Month',
    description: 'Show best-selling items from previous period',
    badge: 'Sales',
    color: 'from-primary to-accent',
  },
  {
    icon: AlertTriangle,
    title: 'Low Stock Items',
    description: 'Products that need restocking soon',
    badge: 'Inventory',
    color: 'from-warning to-destructive',
  },
  {
    icon: ShoppingCart,
    title: 'Abandoned Cart Analysis',
    description: 'Recovery opportunities and insights',
    badge: 'Marketing',
    color: 'from-neon-mint to-neon-blue',
  },
  {
    icon: Package,
    title: 'Pre-Order Forecast',
    description: 'Upcoming pre-order deliveries',
    badge: 'Operations',
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you analyze sales data, generate reports, and provide insights. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: "I'm analyzing your request... Based on your sales data, here are the insights you requested.",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  const handleSuggestionClick = (title: string) => {
    setInput(title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Your intelligent analytics companion powered by advanced AI
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
                Chat with AI
              </CardTitle>
              <CardDescription>Ask questions in natural language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                          : 'glass-panel border border-border/50'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask anything... e.g., 'Show me top products from last month'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                  onClick={handleSend}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Sales Chart */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-neon-mint" />
                Predictive Sales Forecast
              </CardTitle>
              <CardDescription>AI-powered revenue predictions</CardDescription>
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
                  <span className="text-sm text-muted-foreground">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon-mint" />
                  <span className="text-sm text-muted-foreground">Predicted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Suggestions */}
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Quick Insights
              </CardTitle>
              <CardDescription>Popular queries</CardDescription>
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
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {suggestion.badge}
                      </Badge>
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
                Auto Reports
              </CardTitle>
              <CardDescription>AI-generated insights</CardDescription>
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
                      {report.trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}
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
