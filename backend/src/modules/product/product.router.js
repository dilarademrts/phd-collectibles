import { Router } from "express";
import { getProducts } from "./product.controller.js";

const router = Router();

router.get("/", getProducts);


export default router;

