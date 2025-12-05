import { Search, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="lg:hidden" />
        
        <div className="flex-1 flex items-center gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, orders, customers..."
              className="pl-10 bg-secondary/50 border-border/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-[10px]">
              3
            </Badge>
          </Button>
          
          <Button className="gradient-primary glow-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>
    </header>
  );
};
