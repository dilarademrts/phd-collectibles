const products = [
  { id: 1, name: "Amazing Spider-Man #300", price: 1200, stock: 1 },
  { id: 2, name: "Batman #50", price: 500, stock: 1 }
];

export function getProducts(req, res) {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
