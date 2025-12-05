import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, MessageCircle, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  platform: "instagram" | "youtube";
  matched: boolean;
  duplicate?: boolean;
}

export default function LiveStream() {
  const [isLive, setIsLive] = useState(true);
  
  const mockComments: Comment[] = [
    {
      id: "1",
      username: "@sarah_designs",
      message: "I want the blue handbag! 💙",
      timestamp: "2 seconds ago",
      platform: "instagram",
      matched: false,
    },
    {
      id: "2",
      username: "@mike_style",
      message: "Blue handbag please!",
      timestamp: "1 second ago",
      platform: "youtube",
      matched: true,
    },
    {
      id: "3",
      username: "@emma_shop",
      message: "Blue handbag!",
      timestamp: "just now",
      platform: "instagram",
      duplicate: true,
      matched: false,
    },
  ];

  const activeProducts = [
    { id: "1", name: "Blue Designer Handbag", stock: 12, claims: 1 },
    { id: "2", name: "Red Crossbody Bag", stock: 8, claims: 0 },
    { id: "3", name: "Black Leather Wallet", stock: 25, claims: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Live Stream Sales</h1>
          <p className="text-muted-foreground">Real-time comment matching and order automation</p>
        </div>
        <Badge className="h-10 px-6 text-sm gradient-primary animate-pulse">
          <Radio className="mr-2 h-4 w-4" />
          LIVE NOW
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Live Comments Feed
              </h3>
              <Badge variant="secondary">
                {mockComments.length} active
              </Badge>
            </div>

            <ScrollArea className="h-96 pr-4">
              <div className="space-y-3">
                {mockComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-xl border transition-all ${
                      comment.matched
                        ? "border-success bg-success/10 glow-accent"
                        : comment.duplicate
                        ? "border-warning bg-warning/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {comment.username[1].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{comment.username}</p>
                          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={comment.platform === "instagram" ? "default" : "secondary"}>
                          {comment.platform}
                        </Badge>
                        {comment.matched && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {comment.duplicate && (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{comment.message}</p>
                    {comment.matched && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-success font-medium">
                          ✓ Matched: Blue Designer Handbag • Order created
                        </p>
                      </div>
                    )}
                    {comment.duplicate && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-warning font-medium">
                          ⚠ Duplicate claim detected • Already assigned
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-xl font-semibold mb-4">Match Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/30">
                <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">@mike_style matched to Blue Designer Handbag</p>
                  <p className="text-sm text-muted-foreground">1 second ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Active Products
            </h3>
            <div className="space-y-3">
              {activeProducts.map((product) => (
                <div key={product.id} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <h4 className="font-medium mb-2">{product.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock:</span>
                    <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                      {product.stock} left
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Claims:</span>
                    <span className="font-semibold">{product.claims}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Live Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Comments/min</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-3/4 gradient-primary" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Match Rate</span>
                  <span className="font-semibold text-success">87%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-success" />
                </div>
              </div>
            </div>
          </Card>

          <Button className="w-full gradient-primary glow-primary" size="lg">
            Configure Stream
          </Button>
        </div>
      </div>
    </div>
  );
}
