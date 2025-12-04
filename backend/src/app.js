import express from "express";
import cors from "cors";
import productRoutes from "./modules/product/product.router.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
