import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Package, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PreOrders() {
  const [productName, setProductName] = useState("")
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const getRecommendations = async () => {
    if (!productName) return

    setLoading(true)
    try {
      const res = await fetch("http://localhost:5002/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_name: productName }),
      })

      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error("Recommendation error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          Product Recommendation Engine
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered content-based product recommendations
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">In AI memory</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Model Type</CardTitle>
            <Clock className="h-4 w-4 text-neon-mint" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">TF-IDF</div>
            <p className="text-xs text-muted-foreground">Content-based filtering</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Similarity</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cosine</div>
            <p className="text-xs text-muted-foreground">Vector similarity</p>
          </CardContent>
        </Card>
      </div>

      {/* RECOMMENDATION PANEL */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle>Product Recommendation</CardTitle>
          <CardDescription>
            Enter a product name and get similar recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Batman"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Button onClick={getRecommendations} disabled={loading}>
              {loading ? "Analyzing..." : "Recommend"}
            </Button>
          </div>

          {recommendations.length > 0 && (
            <div className="grid gap-3 mt-4">
              {recommendations.map((item, idx) => (
                <Card key={idx} className="border border-border/50">
                  <CardContent className="py-3">
                    <p className="font-medium">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
